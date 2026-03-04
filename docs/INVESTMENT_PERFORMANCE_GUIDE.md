# Investment Performance Calculation Guide

## Overview

This document describes the refactored investment performance calculation system that correctly accounts for capital injections and measures true investment returns using cashflow-aware methods.

## Background

The previous implementation incorrectly calculated returns by comparing the earliest and latest investment snapshots without considering capital injections. This inflated the perceived returns because new capital was treated as profit.

**Example of the problem:**
- Month 1: Invested $10,000, Portfolio value: $10,000
- Month 6: Invested additional $5,000, Portfolio value: $16,000
- Old calculation: Growth = $16,000 - $10,000 = $6,000 (60% return) ❌
- Correct calculation: Net profit = $16,000 - $15,000 = $1,000 (6.7% return) ✅

## New Architecture

### 1. Data Sources

#### Transactions Table (Capital Injections)
Capital injections are identified by:
- `type = 'OUT'` (outgoing transaction)
- `category = 'investment'` (via join with categories table)
- `created_by = current_user`

Each transaction represents money flowing **into** the investment portfolio.

#### Investments Table (Total Asset Snapshots)
Contains historical snapshots of total portfolio value:
- `date`: Snapshot date
- `total`: Total portfolio value at that date
- `created_by`: User ID

### 2. Calculated Metrics

#### A. Total Invested Capital
```sql
SUM(transactions.amount)
WHERE type = 'OUT' AND category = 'investment'
```
This represents the total amount of money the user has put into their investment portfolio.

#### B. Current Equity
```sql
SELECT total
FROM investments
ORDER BY date DESC
LIMIT 1
```
The most recent total portfolio value from the investments table.

#### C. Net Profit
```
net_profit = current_equity - total_invested_capital
```
The actual profit (or loss) from investments, excluding capital injections.

#### D. Real Return Percent
```
real_return_percent = (net_profit / total_invested_capital) × 100
```
The simple percentage return on invested capital.

#### E. Annualized Return (XIRR)
Uses the Extended Internal Rate of Return (XIRR) algorithm to calculate annualized returns considering:
- Timing of capital injections
- Amount of each injection
- Current portfolio value
- Time-weighted performance

## XIRR Implementation

### What is XIRR?

XIRR calculates the annualized rate of return for a series of cashflows occurring at irregular intervals. It answers the question: "What constant annual rate would produce these results given these cashflows?"

### Algorithm: Newton-Raphson Method

The XIRR is found by solving for `r` (rate) where:

$$NPV = \sum_{i=1}^{n} \frac{CF_i}{(1 + r)^{t_i}} = 0$$

Where:
- $CF_i$ = cashflow at time i (negative for investments, positive for returns)
- $t_i$ = time in years from the first cashflow
- $r$ = the rate we're solving for (XIRR)

The Newton-Raphson method iteratively refines the rate:

$$r_{n+1} = r_n - \frac{f(r_n)}{f'(r_n)}$$

Where:
- $f(r) = NPV$ (Net Present Value)
- $f'(r) = \frac{dNPV}{dr}$ (derivative of NPV with respect to rate)

### Cashflow Structure

For investment performance:

1. **Capital Injections** = Negative cashflows (money going out)
   ```typescript
   { date: '2024-01-15', amount: -10000 }
   { date: '2024-06-10', amount: -5000 }
   ```

2. **Current Portfolio Value** = Positive cashflow (money returned)
   ```typescript
   { date: '2026-03-04', amount: 16500 }
   ```

### Example Calculation

**Scenario:**
- Jan 1, 2024: Invest $10,000
- Jul 1, 2024: Invest $5,000
- Jan 1, 2025: Portfolio value = $16,500

**Cashflows:**
```typescript
[
  { date: new Date('2024-01-01'), amount: -10000 },
  { date: new Date('2024-07-01'), amount: -5000 },
  { date: new Date('2025-01-01'), amount: 16500 }
]
```

**XIRR Calculation:**
The algorithm finds `r ≈ 0.125` (12.5% annualized return)

This means if you earned a constant 12.5% annual return on the money as it was invested, you would end up with $16,500.

## API Response Format

### Endpoint
```
GET /api/investment/performance/cards
```

### Response
```typescript
{
  data: {
    total_invested_capital: number,    // Total money invested
    current_equity: number,             // Current portfolio value
    net_profit: number,                 // Profit (current - invested)
    real_return_percent: number,        // Simple return percentage
    annualized_return_percent: number   // XIRR (time-weighted annualized return)
  },
  error?: string
}
```

### Example Response
```json
{
  "data": {
    "total_invested_capital": 15000.00,
    "current_equity": 16500.00,
    "net_profit": 1500.00,
    "real_return_percent": 10.00,
    "annualized_return_percent": 12.45
  }
}
```

## Implementation Details

### SQL Queries

#### 1. Total Invested Capital
```sql
SELECT COALESCE(SUM(t.amount), 0)::float AS total_invested
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'OUT'
  AND LOWER(c.name) = 'investment'
  AND t.created_by = $1
```

#### 2. Current Equity
```sql
SELECT total::float, date
FROM investments
WHERE created_by = $1
ORDER BY date DESC
LIMIT 1
```

#### 3. Capital Injection Cashflows (for XIRR)
```sql
SELECT 
  t.amount::float,
  t.created_at
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'OUT'
  AND LOWER(c.name) = 'investment'
  AND t.created_by = $1
ORDER BY t.created_at ASC
```

### TypeScript Utilities

#### XIRR Function
Located in: `src/utils/xirr.ts`

Key functions:
- `calculateXIRR()`: Main XIRR calculation using Newton-Raphson
- `prepareCashflows()`: Formats investment data for XIRR calculation
- `daysBetween()`: UTC-aware date difference calculation

## Edge Cases Handled

1. **No Investments**: Returns zeros for all metrics
2. **No Transactions**: Assumes all equity is from initial capital (0% transaction-based return)
3. **Single Cashflow**: Cannot calculate XIRR (requires at least 2 cashflows)
4. **Non-convergent XIRR**: Returns 0% if Newton-Raphson fails to converge
5. **Negative Returns**: XIRR can be negative if portfolio value < invested capital

## Precision Considerations

1. **Rounding**: All output values rounded to 2 decimal places
2. **Float Casting**: SQL queries cast to `::float` for consistent precision
3. **COALESCE**: Handles NULL values in aggregations
4. **UTC Dates**: All date calculations use UTC to avoid timezone issues

## Frontend Integration

### Component: `performance-chart.tsx`

The performance chart displays 5 key metrics:

1. **Current Equity**: Latest portfolio value
2. **Total Invested**: Sum of all capital injections
3. **Net Profit**: Profit after subtracting invested capital
4. **Return Rate**: Simple percentage return
5. **Annualized Return (XIRR)**: Time-weighted annualized return

### Type Definition

Updated in: `src/types/api/response.d.ts`

## Testing Recommendations

### Test Scenarios

1. **Basic Profit Scenario**
   - Invest $10,000
   - Portfolio grows to $11,000
   - Expected: 10% return, positive XIRR

2. **Multiple Injections**
   - Month 1: Invest $5,000
   - Month 3: Invest $5,000
   - Month 6: Portfolio = $11,000
   - Expected: 10% simple return, lower XIRR (money was idle)

3. **Loss Scenario**
   - Invest $10,000
   - Portfolio drops to $9,000
   - Expected: -10% return, negative XIRR

4. **No Transactions**
   - Portfolio value without recorded transactions
   - Expected: Graceful handling with zeros

## Migration Notes

### Breaking Changes

1. **Response structure changed**: Frontend components must be updated
2. **Removed fields**:
   - `this_month_amount`
   - `last_month_amount`
   - `this_month_growth_amount`
   - `this_month_growth_percent`
   - `overall_oldest_total`
   - `overall_latest_total`
   - `overall_growth_amount`
   - `overall_growth_percent`
   - `duration_days`
   - `current_cagr_percent`

3. **New fields**:
   - `total_invested_capital`
   - `current_equity`
   - `net_profit`
   - `real_return_percent`
   - `annualized_return_percent`

### Database Schema

No database schema changes required. The refactoring uses existing tables:
- `transactions`
- `categories`
- `investments`

## Performance Considerations

1. **Query Efficiency**: Uses indexes on `created_by`, `type`, and `date` fields
2. **XIRR Complexity**: O(n × m) where n = number of cashflows, m = iterations (typically < 20)
3. **Caching**: Frontend caches results with 60-second stale time

## Future Enhancements

Potential improvements:
1. **Money-Weighted Return (MWR)**: Alternative to XIRR
2. **Benchmark Comparison**: Compare returns against market indices
3. **Risk Metrics**: Sharpe ratio, max drawdown, volatility
4. **Tax Considerations**: After-tax returns
5. **Dividend Tracking**: Separate dividends from capital gains

## References

- [XIRR Formula Explanation](https://en.wikipedia.org/wiki/Internal_rate_of_return#Exact_dates_of_cash_flows)
- [Newton-Raphson Method](https://en.wikipedia.org/wiki/Newton%27s_method)
- [Time-Weighted vs Money-Weighted Returns](https://www.investopedia.com/ask/answers/05/timevsmoneywgtreturn.asp)
