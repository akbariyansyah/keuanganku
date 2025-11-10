
export type TransactionType = "IN" | "OUT";

export interface Transaction {
  id: string;
  category_id: number;
  category_name: string;
  type: TransactionType;
  amount: number;
  created_at: string;
  description: string;
}
