/**
 * XIRR (Extended Internal Rate of Return) Calculation
 * Uses Newton-Raphson method to find the annualized return rate
 * considering irregular cashflows with dates
 */

export interface Cashflow {
  date: Date;
  amount: number;
}

/**
 * Calculate XIRR (annualized return) for a series of cashflows
 * @param cashflows Array of cashflows with dates and amounts
 * @param guess Initial guess for the rate (default: 0.1 = 10%)
 * @param maxIterations Maximum number of iterations (default: 100)
 * @param tolerance Convergence tolerance (default: 1e-6)
 * @returns XIRR as a decimal (e.g., 0.15 for 15%) or null if no solution found
 */
export function calculateXIRR(
  cashflows: Cashflow[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 1e-6,
): number | null {
  // Validate input
  if (cashflows.length < 2) {
    return null;
  }

  // Sort cashflows by date
  const sortedCashflows = [...cashflows].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const firstDate = sortedCashflows[0].date;

  // Calculate days from first date for each cashflow
  const cashflowsWithDays = sortedCashflows.map((cf) => ({
    amount: cf.amount,
    days: daysBetween(firstDate, cf.date),
  }));

  let rate = guess;

  // Newton-Raphson iteration
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0; // Net Present Value
    let dnpv = 0; // Derivative of NPV

    for (const cf of cashflowsWithDays) {
      const years = cf.days / 365.0;
      const discountFactor = Math.pow(1 + rate, years);

      // NPV: sum of (cashflow / (1 + rate)^years)
      npv += cf.amount / discountFactor;

      // Derivative: sum of (-years * cashflow / (1 + rate)^(years + 1))
      dnpv -= (years * cf.amount) / (discountFactor * (1 + rate));
    }

    // Check for convergence
    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    // Check for zero derivative (avoid division by zero)
    if (Math.abs(dnpv) < 1e-10) {
      return null;
    }

    // Newton-Raphson update: x_new = x_old - f(x) / f'(x)
    const newRate = rate - npv / dnpv;

    // Check if rate change is small enough
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    // Prevent extreme values
    if (rate < -0.99 || rate > 10.0) {
      return null;
    }
  }

  // Failed to converge
  return null;
}

/**
 * Calculate number of days between two dates
 * @param date1 First date
 * @param date2 Second date
 * @returns Number of days (can be negative if date2 is before date1)
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(
    date1.getUTCFullYear(),
    date1.getUTCMonth(),
    date1.getUTCDate(),
  );
  const utc2 = Date.UTC(
    date2.getUTCFullYear(),
    date2.getUTCMonth(),
    date2.getUTCDate(),
  );
  return Math.floor((utc2 - utc1) / msPerDay);
}

/**
 * Prepare cashflows for XIRR calculation from investment data
 * @param capitalInjections Array of capital injections (negative cashflows)
 * @param currentEquity Current portfolio value (positive cashflow)
 * @param currentDate Date to use for current equity
 * @returns Array of cashflows ready for XIRR calculation
 */
export function prepareCashflows(
  capitalInjections: { date: Date; amount: number }[],
  currentEquity: number,
  currentDate: Date,
): Cashflow[] {
  const cashflows: Cashflow[] = [
    // Capital injections as negative cashflows
    ...capitalInjections.map((injection) => ({
      date: injection.date,
      amount: -Math.abs(injection.amount), // Ensure negative
    })),
    // Current equity as positive cashflow
    {
      date: currentDate,
      amount: Math.abs(currentEquity), // Ensure positive
    },
  ];

  return cashflows;
}
