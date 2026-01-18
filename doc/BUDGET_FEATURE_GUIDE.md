# Budget Allocation Feature - Implementation Guide

## Overview
This document explains the monthly budget allocation feature implementation, including API design, frontend structure, and data flow.

---

## 1. API Endpoints

### POST `/api/budget/allocations`
Create or update budget allocations for a specific month.

**Request Body:**
```json
{
  "month": "2026-01",
  "allocations": [
    { "categoryId": 1, "amount": 500000 },
    { "categoryId": 2, "amount": 300000 },
    { "categoryId": 5, "amount": 200000 }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Budget allocations created successfully",
  "data": [
    {
      "id": 1,
      "month": "2026-01-01",
      "category_id": 1,
      "amount": 500000,
      "created_at": "2026-01-18T07:54:00.000Z"
    },
    ...
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body or month format
- `400 Bad Request` - Invalid category ID (foreign key constraint)
- `500 Internal Server Error` - Database error

**Implementation Notes:**
- Uses transaction (BEGIN/COMMIT/ROLLBACK) for atomic operations
- Deletes existing allocations for the month before inserting new ones
- Validates month format (YYYY-MM)
- Validates that all amounts are greater than 0

---

### GET `/api/budget/allocations?month=2026-01`
Fetch budget allocations for a specific month.

**Query Parameters:**
- `month` (required): Month in YYYY-MM format

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "month": "2026-01-01",
      "category_id": 1,
      "amount": 500000,
      "created_at": "2026-01-18T07:54:00.000Z",
      "category_name": "Food & Dining",
      "category_description": "Groceries, restaurants, etc."
    },
    ...
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid month parameter
- `500 Internal Server Error` - Database error

**Implementation Notes:**
- Joins with `categories` table to include category details
- Returns empty array if no allocations found
- Orders by category_id ascending

---

### GET `/api/transaction/categories?type=out`
Fetch transaction categories (already exists, used for dropdown).

**Query Parameters:**
- `type` (optional): Filter by transaction type ('in' or 'out')

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "description": "Groceries, restaurants, etc.",
      "transaction_type": "OUT"
    },
    ...
  ]
}
```

---

## 2. Database Schema

### Required Table: `budget_allocations`

```sql
CREATE TABLE budget_allocations (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,  -- First day of month (YYYY-MM-01)
  category_id INTEGER NOT NULL REFERENCES categories(id),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(month, category_id)  -- One allocation per category per month
);

CREATE INDEX idx_budget_allocations_month ON budget_allocations(month);
```

**Note:** You'll need to create this table in your database if it doesn't exist.

---

## 3. Type Definitions

### Request Types (`src/types/api/request.d.ts`)
```typescript
type BudgetAllocationItem = {
  categoryId: number;
  amount: number;
};

type CreateBudgetAllocationsRequest = {
  month: string; // 'YYYY-MM'
  allocations: BudgetAllocationItem[];
};
```

### Response Types (`src/types/api/response.d.ts`)
```typescript
type BudgetAllocationResponse = {
  id: number;
  month: string; // ISO date (YYYY-MM-01)
  category_id: number;
  amount: number;
  created_at: string;
  category_name?: string;
  category_description?: string;
};

type BudgetAllocationsResponse = {
  data?: BudgetAllocationResponse[];
  error?: string;
};
```

---

## 4. Validation Schema

### Zod Schema (`src/schema/schema.ts`)
```typescript
const budgetAllocationItemSchema = z.object({
  categoryId: z.number().gt(0, 'Please select a category'),
  amount: z.number().gt(0, 'Amount must be greater than 0'),
});

const createBudgetAllocationsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
  allocations: z
    .array(budgetAllocationItemSchema)
    .min(1, 'At least one allocation is required'),
});
```

**Validation Rules:**
- Month must match YYYY-MM format
- At least one allocation required
- Each categoryId must be > 0
- Each amount must be > 0

---

## 5. Frontend Structure

### Page Routing
```
/dashboard/transaction/budget          → Main budget overview page
/dashboard/transaction/budget/add      → Add/edit budget allocations
```

### Main Budget Page (`/dashboard/transaction/budget/page.tsx`)

**Features:**
- Month selector (defaults to current month)
- Summary cards showing:
  - Total budget
  - Number of categories
  - Average per category
- Budget allocations table with:
  - Category name & description
  - Amount
  - Percentage of total
- "Add Budget" button → navigates to add page

**Key Functions:**
- `fetchBudgetAllocations(month)` - Loads allocations for selected month
- `formatCurrency(amount)` - Formats numbers as IDR currency
- Auto-loads data when month changes

---

### Add Budget Page (`/dashboard/transaction/budget/add/page.tsx`)

**Features:**
- Dynamic form with add/remove rows
- Category dropdown (fetches from API)
- Numeric amount input with thousand separators
- Real-time subtotal calculation
- Summary sidebar showing breakdown
- Month input (pre-filled from URL param)

**Form Pattern:**
- Uses React Hook Form with Zod validation
- `useFieldArray` for dynamic rows
- `Controller` for custom inputs (Select, formatted number)
- `useWatch` for real-time calculations

**Key Functions:**
- `fetchTransactionCategories('out')` - Loads expense categories
- `createBudgetAllocations(data)` - Submits form
- `formatNumber` / `parseNumber` - Handles thousand separators

---

## 6. Data Flow

### Creating Budget Allocations

```
User fills form → Submit
  ↓
React Hook Form validates (Zod schema)
  ↓
createBudgetAllocations(payload)
  ↓
POST /api/budget/allocations
  ↓
API validates request
  ↓
BEGIN transaction
  ↓
DELETE existing allocations for month
  ↓
INSERT new allocations
  ↓
COMMIT transaction
  ↓
Return success response
  ↓
Navigate to main budget page
```

### Viewing Budget Allocations

```
User selects month
  ↓
fetchBudgetAllocations(month)
  ↓
GET /api/budget/allocations?month=YYYY-MM
  ↓
Query database with JOIN
  ↓
Return allocations with category details
  ↓
Update UI (table, summary cards)
```

---

## 7. Key Implementation Details

### Number Formatting
```typescript
// Display: 1000000 → "1.000.000"
const formatNumber = (value?: number) => {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse: "1.000.000" → 1000000
const parseNumber = (value: string) => {
  return Number(value.replace(/\./g, '')) || 0;
};
```

### Dynamic Form Pattern
```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'allocations',
});

// Add row
append({ categoryId: 0, amount: 0 });

// Remove row
remove(index);

// Watch for changes
const watchedAllocations = useWatch({ control, name: 'allocations' });
```

### Transaction Safety
The API uses PostgreSQL transactions to ensure:
- All allocations are saved together (atomicity)
- Old allocations are deleted before new ones are inserted
- Rollback on any error

---

## 8. Usage Example

### Step 1: Navigate to Budget Page
```
/dashboard/transaction/budget
```

### Step 2: Click "Add Budget"
Navigates to `/dashboard/transaction/budget/add?month=2026-01`

### Step 3: Fill Form
- Month: 2026-01 (pre-filled)
- Add rows for each category:
  - Food & Dining: 500,000
  - Transportation: 300,000
  - Entertainment: 200,000

### Step 4: Submit
Form data:
```json
{
  "month": "2026-01",
  "allocations": [
    { "categoryId": 1, "amount": 500000 },
    { "categoryId": 2, "amount": 300000 },
    { "categoryId": 5, "amount": 200000 }
  ]
}
```

### Step 5: View Results
Redirected to main page showing:
- Total Budget: Rp 1,000,000
- 3 Categories
- Table with breakdown

---

## 9. Error Handling

### Frontend
- Form validation (Zod schema)
- Loading states during API calls
- Error messages for failed requests
- Disabled submit button during submission

### Backend
- Request validation (format, required fields)
- Database constraint validation
- Transaction rollback on errors
- Proper HTTP status codes

---

## 10. Future Enhancements

Potential improvements:
1. **Edit Mode**: Load existing allocations when editing
2. **Budget vs Actual**: Compare budget with actual spending
3. **Budget Templates**: Save and reuse allocation patterns
4. **Notifications**: Alert when spending exceeds budget
5. **Analytics**: Visualize budget utilization over time
6. **Multi-currency**: Support different currencies
7. **Bulk Import**: Upload budget from CSV/Excel

---

## 11. Testing Checklist

- [ ] Create budget allocations for current month
- [ ] Create budget allocations for future month
- [ ] View budget allocations for different months
- [ ] Add/remove dynamic form rows
- [ ] Validate form (empty fields, invalid amounts)
- [ ] Test with duplicate categories (should be allowed in form, last wins)
- [ ] Test with invalid month format
- [ ] Test with invalid category ID
- [ ] Test concurrent updates (transaction safety)
- [ ] Test navigation flow (add → save → back to list)

---

## Summary

This implementation provides a clean, scalable budget allocation feature with:
- ✅ RESTful API design
- ✅ Type-safe frontend/backend communication
- ✅ Form validation with Zod
- ✅ Dynamic form inputs (React Hook Form)
- ✅ Transaction safety (PostgreSQL)
- ✅ Clean state management
- ✅ Responsive UI with summary cards and tables

The code follows the existing patterns in your codebase (similar to the investment portfolio feature) for consistency and maintainability.
