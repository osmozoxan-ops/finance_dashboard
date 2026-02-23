import type { Transaction } from '../../entities/Transaction';
import type { TransactionRepository } from '../../interfaces/TransactionRepository';

export class GetAllTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(): Promise<Transaction[]> {
    return this.transactionRepository.getAll();
  }
}