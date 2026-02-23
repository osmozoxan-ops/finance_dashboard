import type { TransactionRepository } from '../../interfaces/TransactionRepository';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../../entities/Transaction';

export class CreateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(data: { transaction: number, type: boolean, category: string, icon: string }): Promise<Transaction> {
    if (data.transaction <= 0) throw new Error('Сумма должна быть больше нуля');

    const newTransaction: Transaction = {
      id: uuidv4(),
      transaction: data.transaction,
      type: data.type,
      category: data.type ? 'Доход' : data.category,
      icon: data.type ? 'pi pi-money-bill' : data.icon,
      createdAt: new Date()
    };

    await this.transactionRepository.create(newTransaction);
    
    // ВАЖНО: Возвращаем созданный объект со всеми полями (ID, Date)
    return newTransaction; 
  }
}
