import { TransactionType } from "@/types/transaction";

export const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "OUT", label: "expense" },
  { value: "IN", label: "income" },
]
