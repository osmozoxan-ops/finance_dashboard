import type { Transaction } from '../../entities/Transaction';
import type { TransactionGroup } from '../../entities/TransactionGroup';

export class GroupTransactionsByDateUseCase {
  execute(transactions: Transaction[]): TransactionGroup[] {
    const groups: Record<string, TransactionGroup> = {};

    transactions.forEach(t => {
      // Превращаем дату в красивую метку
      const label = this.formatDateLabel(new Date(t.createdAt));

      if (!groups[label]) {
        groups[label] = { dateLabel: label, transactions: [] };
      }
      groups[label].transactions.push(t);
    });

    return Object.values(groups);
  }

  private formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Сравниваем только день, месяц и год (без учета времени)
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    
    // Если дата старее — выводим "число месяц" (напр. "15 февраля")
    return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long' });
  }
}