export type TransactionType = 'OB' | 'IN' | 'OUT';

export interface Transaction {
  id: string;
  category_id: number;
  category_name: string;
  type: TransactionType;
  amount: number;
  created_at: string;
  description: string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  transaction_type: TransactionType;
  description: string;
  created_at: string;
  updated_at: string;
}