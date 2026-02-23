import type { TransactionRepository } from '../../interfaces/TransactionRepository';


export class DeleteAllTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

 async execute(): Promise<void> {
    await this.transactionRepository.deleteAll();
  }
}

