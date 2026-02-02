// API path constants
export const BASE_PATH = '/api';

// User paths
export const USER_PATH = `${BASE_PATH}/user`;

// Report paths
export const REPORTS_PATH = `${BASE_PATH}/report`;
export const REPORT_SUMMARY_PATH = `${REPORTS_PATH}/summary`;
export const REPORT_CASHFLOW_PATH = `${REPORTS_PATH}/cashflow`;
export const REPORT_AVERAGE_TRANSACTION_PATH = `${REPORTS_PATH}/average-transaction`;
export const REPORT_AVERAGE_SPENDING_PATH = `${REPORTS_PATH}/average-spending`;
export const REPORT_CASHFLOW_OVERTIME_PATH = `${REPORTS_PATH}/cashflow-overtime`;
export const REPORT_TRANSACTION_FREQUENCY_PATH = `${REPORTS_PATH}/transaction-frequency`;
export const REPORT_SAVING_RATE_PATH = `${REPORTS_PATH}/saving-rate`;
export const REPORT_CATEGORY_RADAR_PATH = `${REPORTS_PATH}/category-radar`;
export const REPORT_HISTORIES_PATH = `${REPORTS_PATH}/histories`;

// Investment paths
export const INVESTMENT_PATH = `${BASE_PATH}/investment`;
export const INVESTMENT_CATEGORIES_PATH = `${INVESTMENT_PATH}/categories`;
export const INVESTMENT_PORTFOLIO_PATH = `${INVESTMENT_PATH}/portfolio`;
export const INVESTMENT_PERFORMANCE_PATH = `${INVESTMENT_PATH}/performance`;

// Budget paths
export const BUDGET_PATH = `${BASE_PATH}/budget`;
export const BUDGET_ALLOCATIONS_PATH = `${BUDGET_PATH}/allocations`;
export const BUDGET_COMPARISON_PATH = `${BUDGET_PATH}/comparison`;

// Transaction paths
export const TRANSACTION_PATH = `${BASE_PATH}/transaction`;
export const TRANSACTION_CATEGORIES_PATH = `${TRANSACTION_PATH}/categories`;
export const TRANSACTION_HEATMAP_PATH = `${TRANSACTION_PATH}/heatmap`;
export const TRANSACTION_ANOMALY_PATH = `${TRANSACTION_PATH}/anomaly`;

// Auth paths
export const AUTH_PATH = `${BASE_PATH}/auth`;
export const AUTH_ME_PATH = `${AUTH_PATH}/me`;
export const AUTH_LOGIN_PATH = `${AUTH_PATH}/login`;
export const AUTH_REGISTER_PATH = `${AUTH_PATH}/register`;
export const AUTH_LOGOUT_PATH = `${AUTH_PATH}/logout`;
