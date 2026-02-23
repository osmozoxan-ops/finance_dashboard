import type { TransactionRepository } from '../../interfaces/TransactionRepository';
import type { Transaction } from '../../entities/Transaction';

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(data: {id:string, transaction: number, type: boolean, category: string, createdAt: Date, icon: string }): Promise<Transaction> {

    if (data.transaction <= 0) throw new Error('Сумма должна быть больше нуля');

    const updatedTransaction: Transaction = {
      id: data.id,
      transaction: data.transaction,
      type: data.type,
      category: data.type ? 'Доход' : data.category,
      icon: data.type ? 'pi pi-money-bill' : data.icon,
      createdAt: data.createdAt
    };

    await this.transactionRepository.update(updatedTransaction);
    
    // ВАЖНО: Возвращаем созданный объект со всеми полями (ID, Date)
    return updatedTransaction;
  }
}
