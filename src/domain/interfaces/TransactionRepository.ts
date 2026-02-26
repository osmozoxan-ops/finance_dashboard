import type { Transaction } from '../entities/Transaction';

export interface TransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
} 