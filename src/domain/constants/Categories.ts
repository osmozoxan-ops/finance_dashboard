import type { CategoryItem } from '../entities/CategoryItem';

export const TRANSACTION_CATEGORIES: CategoryItem[] = [
  { label: 'Еда', icon: 'pi pi-apple' },
  { label: 'Транспорт', icon: 'pi pi-car' },
  { label: 'Здоровье', icon: 'pi pi-heart' },
  { label: 'Развлечения', icon: 'pi pi-ticket' },
  { label: 'Прочее', icon: 'pi pi-briefcase' }
];

export const DEFAULT_INCOME_ICON = 'pi pi-money-bill';
export const DEFAULT_EXPENSE_ICON = 'pi pi-apple';
