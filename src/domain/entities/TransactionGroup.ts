import type { Transaction } from "../entities/Transaction";

export interface TransactionGroup {
  dateLabel: string; 
  transactions: Transaction[];
}