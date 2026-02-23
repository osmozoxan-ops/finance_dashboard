import type { Transaction } from '../../entities/Transaction';
import type { MonthFilter } from '../../entities/MonthFilter';

export class GetAvailableMonthsUseCase {
  execute(transactions: Transaction[]): MonthFilter[] {
    const monthsMap = new Map<string, MonthFilter>();

    transactions.forEach(t => {
      const date = t.createdAt;
      const key = `${date.getMonth()}-${date.getFullYear()}`;
      
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          month: date.getMonth(),
          year: date.getFullYear(),
          label: date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
        });
      }
    });

    return Array.from(monthsMap.values()).sort((a, b) => 
      (b.year * 12 + b.month) - (a.year * 12 + a.month) // Сортировка: новые сверху
    );
  }
}
