import type { Transaction } from '../../entities/Transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/Categories';
import type { CategoryStat } from '@/domain/entities/CategoryStat';


export class GetCategoryStatisticsUseCase {
  execute(transactions: Transaction[]): CategoryStat[] {
    // 1. Берем наши официальные категории из констант
    const stats: Record<string, number> = {};
    TRANSACTION_CATEGORIES.forEach(cat => {
      stats[cat.label] = 0;
    });
    stats['Прочее'] = 0;

    // 2. Считаем только расходы (type === false)
    transactions.forEach(t => {
      if (!t.type) {
        const category = stats[t.category] !== undefined ? t.category : 'Прочее';
        stats[category] = (stats[category] || 0) + t.transaction;
      }
    });

    // 3. Превращаем в массив для удобства UI
    return Object.entries(stats).map(([label, total]) => ({ label, total }));
  }
}