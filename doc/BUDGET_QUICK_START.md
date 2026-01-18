# Budget Allocation Feature - Quick Start

## ✅ What Was Built

A complete monthly budget allocation feature with:
- **Main Budget Page**: View and manage budget allocations by month
- **Add Budget Page**: Create budget allocations with dynamic form
- **REST API**: Backend endpoints for creating and fetching allocations
- **Type Safety**: Full TypeScript types and Zod validation

---

## 🚀 Quick Start

### 1. Create Database Table

Run the migration script:

```bash
psql $DATABASE_URL -f migrations/create_budget_allocations.sql
```

Or manually create the table:

```sql
CREATE TABLE budget_allocations (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_month_category UNIQUE(month, category_id)
);

CREATE INDEX idx_budget_allocations_month ON budget_allocations(month);
CREATE INDEX idx_budget_allocations_category ON budget_allocations(category_id);
```

### 2. Access the Feature

Navigate to: **http://localhost:3000/dashboard/transaction/budget**

### 3. Create Your First Budget

1. Click **"Add Budget"** button
2. Select month (defaults to current month)
3. Add categories and amounts:
   - Click dropdown to select expense category
   - Enter budget amount
   - Click "+ Add Category" for more rows
4. Click **"Save Budget"**

---

## 📁 Files Created/Modified

### New Files
- `src/app/api/budget/allocations/route.ts` - API endpoint
- `src/app/dashboard/transaction/budget/add/page.tsx` - Add budget page
- `migrations/create_budget_allocations.sql` - Database migration
- `BUDGET_FEATURE_GUIDE.md` - Detailed documentation

### Modified Files
- `src/app/dashboard/transaction/budget/page.tsx` - Main budget page (replaced dummy UI)
- `src/types/api/request.d.ts` - Added request types
- `src/types/api/response.d.ts` - Added response types
- `src/schema/schema.ts` - Added validation schemas
- `src/lib/fetcher/budget.ts` - Added fetcher functions

---

## 🔌 API Endpoints

### Create Budget Allocations
```
POST /api/budget/allocations
Content-Type: application/json

{
  "month": "2026-01",
  "allocations": [
    { "categoryId": 1, "amount": 500000 },
    { "categoryId": 2, "amount": 300000 }
  ]
}
```

### Get Budget Allocations
```
GET /api/budget/allocations?month=2026-01
```

### Get Transaction Categories
```
GET /api/transaction/categories?type=out
```

---

## 🎯 Key Features

✅ **Dynamic Form**: Add/remove category rows on the fly  
✅ **Real-time Calculation**: Total budget updates as you type  
✅ **Type Safety**: Full TypeScript + Zod validation  
✅ **Transaction Safety**: Atomic database operations  
✅ **Clean UX**: Follows existing app patterns  
✅ **Responsive**: Works on mobile and desktop  

---

## 🧪 Test It

1. **Create a budget** for January 2026
2. **Switch months** using the month selector
3. **Edit existing budget** by clicking "Add Budget" again
4. **View summary cards** showing totals and averages
5. **Check the table** for detailed breakdown

---

## 📊 How It Works

### Data Flow (Create)
```
User fills form
  ↓
React Hook Form validates (Zod)
  ↓
POST /api/budget/allocations
  ↓
Database transaction (DELETE old + INSERT new)
  ↓
Success → Navigate to main page
```

### Data Flow (View)
```
User selects month
  ↓
GET /api/budget/allocations?month=YYYY-MM
  ↓
Database query with JOIN
  ↓
Update UI (cards + table)
```

---

## 🔍 What's Next?

See `BUDGET_FEATURE_GUIDE.md` for:
- Detailed API documentation
- Database schema explanation
- Advanced usage examples
- Future enhancement ideas
- Testing checklist

---

## 💡 Tips

- **Updating budgets**: Just create a new allocation for the same month - it will replace the old one
- **Categories**: Only expense categories (type=OUT) are shown
- **Amounts**: Use thousand separators (e.g., 1.000.000)
- **Month format**: Always YYYY-MM (e.g., 2026-01)

---

## 🐛 Troubleshooting

**"No budget allocations found"**
- Make sure you've created allocations for that month
- Check the month selector is set correctly

**"Failed to fetch categories"**
- Ensure the categories table has expense categories (type=OUT)
- Check the API endpoint is running

**"Failed to create budget allocations"**
- Verify the database table exists
- Check all amounts are > 0
- Ensure category IDs are valid

---

**Built with**: Next.js 14, React Hook Form, Zod, TypeScript, PostgreSQL
