import { TransactionType } from '@/types/transaction';

export const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'OUT', label: 'expense' },
  { value: 'IN', label: 'income' },
];

export interface TransactionCategory {
  id: number;
  name: string;
  description: string;
  type: TransactionType;
}

export type TransactionCategoryMap = Record<
  TransactionType,
  TransactionCategory[]
>;
