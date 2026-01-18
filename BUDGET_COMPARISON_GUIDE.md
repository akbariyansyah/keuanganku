# Planned vs Actual Budget Feature - Implementation Guide

## Overview
This feature compares **planned budget allocations** against **actual spending** from transactions, providing visual and tabular insights into budget performance.

---

## 🎯 Core Concept

### Data Sources
1. **Planned Budget**: From `budget_allocations` table
   - Monthly allocations per category
   - Set by user in advance

2. **Actual Spending**: From `transactions` table
   - Only transactions with `type = 'OUT'`
   - Filtered by `created_at` within selected month
   - Aggregated by category

### Calculation Logic
```
Planned Total = SUM(budget_allocations.amount) WHERE month = selected_month
Actual Total = SUM(transactions.amount) WHERE type='OUT' AND created_at IN selected_month
Variance = Planned Total - Actual Total
  - Positive variance = Under budget (good)
  - Negative variance = Over budget (needs attention)
```

---

## 📊 API Design

### Endpoint: `GET /api/budget/comparison`

**Query Parameters:**
- `month` (required): Month in YYYY-MM format

**Request Example:**
```
GET /api/budget/comparison?month=2026-01
```

**Response Schema:**
```typescript
{
  period: string,              // "2026-01"
  plannedTotal: number,        // Total planned budget
  actualTotal: number,         // Total actual spending
  variance: number,            // plannedTotal - actualTotal
  variancePercent: string,     // "85.50" (actual as % of planned)
  plannedByCategory: [
    {
      categoryId: number,
      categoryName: string,
      amount: number
    }
  ],
  actualByCategory: [
    {
      categoryId: number,
      categoryName: string,
      amount: number
    }
  ]
}
```

**Response Example:**
```json
{
  "period": "2026-01",
  "plannedTotal": 5000000,
  "actualTotal": 4275000,
  "variance": 725000,
  "variancePercent": "85.50",
  "plannedByCategory": [
    { "categoryId": 1, "categoryName": "Food & Dining", "amount": 2000000 },
    { "categoryId": 2, "categoryName": "Transportation", "amount": 1500000 },
    { "categoryId": 5, "categoryName": "Entertainment", "amount": 1500000 }
  ],
  "actualByCategory": [
    { "categoryId": 1, "categoryName": "Food & Dining", "amount": 1850000 },
    { "categoryId": 2, "categoryName": "Transportation", "amount": 1425000 },
    { "categoryId": 5, "categoryName": "Entertainment", "amount": 1000000 }
  ]
}
```

---

## 🗄️ SQL Implementation

### Query 1: Planned Budget
```sql
SELECT 
  ba.category_id as "categoryId",
  c.name as "categoryName",
  ba.amount
FROM budget_allocations ba
LEFT JOIN categories c ON ba.category_id = c.id
WHERE ba.month = '2026-01-01'
ORDER BY ba.category_id ASC
```

### Query 2: Actual Spending
```sql
SELECT 
  t.category_id as "categoryId",
  c.name as "categoryName",
  SUM(t.amount) as amount
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.type = 'OUT'
  AND t.created_at >= '2026-01-01'::date
  AND t.created_at < ('2026-01-31'::date + INTERVAL '1 day')
GROUP BY t.category_id, c.name
ORDER BY t.category_id ASC
```

**Key Points:**
- Uses `SUM()` to aggregate transaction amounts per category
- `type = 'OUT'` filters only expense transactions
- Date range includes entire month (start to end)
- `LEFT JOIN` ensures category names are included
- `GROUP BY` aggregates by category

---

## 🔄 Data Flow

### Backend Flow
```
1. Receive month parameter (YYYY-MM)
   ↓
2. Calculate month start and end dates
   ↓
3. Execute parallel queries:
   - Planned: SELECT from budget_allocations
   - Actual: SELECT + SUM from transactions (type='OUT')
   ↓
4. Calculate totals and variance
   ↓
5. Return combined response
```

### Frontend Flow
```
User selects month
   ↓
fetchBudgetComparison(month)
   ↓
GET /api/budget/comparison?month=YYYY-MM
   ↓
Receive planned vs actual data
   ↓
Render:
   - Pie chart (Planned vs Actual)
   - Summary stats (totals, variance)
   - Table (category breakdown)
```

---

## 🎨 Frontend Implementation

### Component Structure
```
BudgetPage
├── Month Selector (left sidebar)
├── Pie Chart Card (main area)
│   ├── Pie Chart (Planned vs Actual)
│   └── Stats Panel
│       ├── Planned Total
│       ├── Actual Total
│       └── Variance (with indicator)
└── Allocations Table
    ├── Category breakdown
    ├── Planned vs Actual per category
    └── Variance per category
```

### Key Features

#### 1. **Month Filter**
```tsx
<input
  type="month"
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
/>
```
- HTML5 month picker
- Defaults to current month
- Triggers data reload on change

#### 2. **Pie Chart Visualization**
```tsx
<PieChart>
  <Pie
    data={[
      { name: 'Planned', value: plannedTotal },
      { name: 'Actual', value: actualTotal }
    ]}
    dataKey="value"
    nameKey="name"
  />
</PieChart>
```
- Uses `recharts` library
- Two slices: Planned (blue) vs Actual (orange)
- Shows percentage labels
- Tooltip with formatted currency

#### 3. **Variance Indicator**
```tsx
{isOverBudget ? (
  <TrendingDown className="text-red-500" />
) : (
  <TrendingUp className="text-green-500" />
)}
```
- Red arrow down = Over budget
- Green arrow up = Under budget
- Color-coded amounts

#### 4. **Category Breakdown Table**
```tsx
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Planned</th>
      <th>Actual</th>
      <th>Variance</th>
    </tr>
  </thead>
  <tbody>
    {allocations.map(allocation => {
      const actual = findActual(allocation.category_id);
      const variance = allocation.amount - actual;
      return (
        <tr>
          <td>{allocation.category_name}</td>
          <td>{formatCurrency(allocation.amount)}</td>
          <td>{formatCurrency(actual)}</td>
          <td className={variance < 0 ? 'text-red' : 'text-green'}>
            {formatCurrency(variance)}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
```

---

## 💰 Financial Calculations

### 1. **Total Planned Budget**
```typescript
const plannedTotal = plannedByCategory.reduce(
  (sum, item) => sum + Number(item.amount),
  0
);
```

### 2. **Total Actual Spending**
```typescript
const actualTotal = actualByCategory.reduce(
  (sum, item) => sum + Number(item.amount),
  0
);
```

### 3. **Variance**
```typescript
const variance = plannedTotal - actualTotal;
// Positive = under budget
// Negative = over budget
```

### 4. **Variance Percentage**
```typescript
const variancePercent = plannedTotal > 0 
  ? ((actualTotal / plannedTotal) * 100).toFixed(2)
  : 0;
// Shows what % of budget was actually spent
```

### 5. **Category-Level Variance**
```typescript
allocations.map(allocation => {
  const actualItem = actualByCategory.find(
    a => a.categoryId === allocation.category_id
  );
  const actualAmount = actualItem?.amount || 0;
  const variance = allocation.amount - actualAmount;
  const isOver = actualAmount > allocation.amount;
  
  return { ...allocation, actualAmount, variance, isOver };
});
```

---

## 📁 Files Created/Modified

### New Files
1. **`src/app/api/budget/comparison/route.ts`**
   - API endpoint for budget comparison
   - SQL queries for planned and actual data
   - Variance calculations

### Modified Files
1. **`src/types/api/response.d.ts`**
   - Added `BudgetCategoryItem` type
   - Added `BudgetComparisonResponse` type

2. **`src/lib/fetcher/budget.ts`**
   - Added `fetchBudgetComparison()` function

3. **`src/app/dashboard/transaction/budget/page.tsx`**
   - Complete redesign with pie chart
   - Planned vs Actual comparison
   - Category-level variance table

---

## 🎯 Key Insights Provided

### Visual (Pie Chart)
- **Quick comparison** of planned vs actual at a glance
- **Percentage distribution** between planned and actual
- **Color coding** for easy interpretation

### Numerical (Stats Panel)
- **Planned Total**: Total budget allocated
- **Actual Total**: Total money spent
- **Variance**: Difference (with +/- indicator)
- **Percentage Used**: How much of budget was consumed

### Detailed (Table)
- **Per-category breakdown**
- **Planned vs Actual** for each category
- **Category-level variance** (over/under)
- **Color-coded indicators** (red = over, green = under)

---

## 🧪 Testing Scenarios

### Scenario 1: Under Budget
```
Planned: Rp 5,000,000
Actual:  Rp 4,275,000
Variance: +Rp 725,000 (green, under budget)
Percentage: 85.5% used
```

### Scenario 2: Over Budget
```
Planned: Rp 5,000,000
Actual:  Rp 5,850,000
Variance: -Rp 850,000 (red, over budget)
Percentage: 117% used
```

### Scenario 3: No Budget Set
```
Planned: Rp 0
Display: "No budget allocations found for this month"
Action: Show "Create Budget Allocation" button
```

### Scenario 4: Budget Set, No Spending
```
Planned: Rp 5,000,000
Actual:  Rp 0
Variance: +Rp 5,000,000 (green, no spending yet)
Percentage: 0% used
```

---

## 🔍 SQL Query Explanation

### Date Filtering Logic
```sql
WHERE t.created_at >= '2026-01-01'::date
  AND t.created_at < ('2026-01-31'::date + INTERVAL '1 day')
```

**Why this approach?**
- Ensures all transactions on the last day are included
- Handles months with different day counts (28, 30, 31)
- Uses PostgreSQL date arithmetic for accuracy

**Alternative (simpler but less precise):**
```sql
WHERE DATE_TRUNC('month', t.created_at) = '2026-01-01'
```

### Aggregation Logic
```sql
SELECT 
  t.category_id,
  c.name,
  SUM(t.amount) as amount
FROM transactions t
GROUP BY t.category_id, c.name
```

**Key points:**
- `SUM(t.amount)` adds up all transaction amounts
- `GROUP BY category_id` creates one row per category
- `LEFT JOIN categories` includes category names
- Only `type='OUT'` transactions are summed

---

## 🚀 Future Enhancements

Potential improvements:
1. **Trend Analysis**: Compare multiple months
2. **Category Drill-Down**: Click category to see individual transactions
3. **Budget Alerts**: Notify when approaching/exceeding budget
4. **Forecasting**: Predict end-of-month spending based on current rate
5. **Export**: Download comparison report as PDF/Excel
6. **Budget Templates**: Copy previous month's budget
7. **Multiple Charts**: Add bar chart, line chart for trends

---

## ✅ Summary

This implementation provides:
- ✅ **Accurate financial calculations** (planned vs actual)
- ✅ **Clean SQL aggregation** (SUM by category, date filtering)
- ✅ **Visual comparison** (pie chart)
- ✅ **Detailed breakdown** (category-level table)
- ✅ **Variance analysis** (over/under budget indicators)
- ✅ **Maintainable structure** (typed API, reusable components)

The feature focuses on **correct financial logic** and **clean data flow** while providing essential budget tracking capabilities.
