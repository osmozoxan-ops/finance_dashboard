import type { TransactionFilterType } from '../../entities/TransactionFilterType';
import type { Transaction } from '../../entities/Transaction';

export class FilterTransactionsUseCase {

  execute(filter: TransactionFilterType, transactions: Transaction[]): Transaction[] {
    if (filter === 'income') {
      return transactions.filter(t => t.type === true);
    } else if (filter === 'expense') {
      return transactions.filter(t => t.type === false);
    }

    return transactions;
  }
}