import type { TransactionRepository } from '../../interfaces/TransactionRepository';


export class DeleteTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(id: string): Promise<void> {
    return this.transactionRepository.delete(id);
  }
}