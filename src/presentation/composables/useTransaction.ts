import { ref, computed } from 'vue';
import type { Transaction } from '../../domain/entities/Transaction';
import { TransactionUseCaseFactory } from '../../domain/factories/TransactionUseCaseFactory';
import type { CreateTransactionParams } from '@/shared/types/transaction-params';
import type { TransactionFilterType } from '../../domain/entities/TransactionFilterType';
import type { MonthFilter } from '../../domain/entities/MonthFilter';


// ГЛОБАЛЬНОЕ СОСТОЯНИЕ (вынесено за пределы функции)
const currentFilter = ref<TransactionFilterType>('all');
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const clearTransactions = () => {transactions.value = [];};
const selectedMonth = ref<MonthFilter | null>(null);

export function useTransaction() {
  const getAllTransactionsUseCase = TransactionUseCaseFactory.createGetAllTransactionsUseCase();
  const createTransactionUseCase = TransactionUseCaseFactory.createCreateTransactionUseCase();
  const updateTransactionUseCase = TransactionUseCaseFactory.createUpdateTransactionUseCase();
  const deleteTransactionUseCase = TransactionUseCaseFactory.createDeleteTransactionUseCase();
  const deleteAllTransactionUseCase = TransactionUseCaseFactory.createDeleteAllTransactionsUseCase();
  const getStatsUseCase = TransactionUseCaseFactory.createGetCategoryStatisticsUseCase();
  const filterTransactionsUseCase = TransactionUseCaseFactory.createFilterTransactionsUseCase();
  const getAvailableMonthsUseCase = TransactionUseCaseFactory.createGetAvailableMonthsUseCase();
  const groupTransactionsByDateUseCase = TransactionUseCaseFactory.createGroupTransactionsByDateUseCase();


 const groupedTransactions = computed(() => {
    return groupTransactionsByDateUseCase.execute(filteredTransactions.value);
  });

  const availableMonths = computed(() => getAvailableMonthsUseCase.execute(transactions.value));

  const filteredTransactions = computed(() => {
    let list = filterTransactionsUseCase.execute(currentFilter.value, transactions.value);
    
    if (selectedMonth.value) {
      list = list.filter(t => 
        t.createdAt.getMonth() === selectedMonth.value?.month &&
        t.createdAt.getFullYear() === selectedMonth.value?.year
      );
    }
    return list;
  });

  const setFilter = (filter: TransactionFilterType) =>{
    currentFilter.value = filter
  }
  const loadTransactions = async () => {
    // Если данные уже есть, не загружаем повторно (по желанию)
    if (transactions.value.length > 0) return; 
    
    isLoading.value = true;
    try {
      const loadedTransactions = await getAllTransactionsUseCase.execute();
      transactions.value = loadedTransactions;
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const createTransaction = async (data: CreateTransactionParams) => {
  isLoading.value = true;
  try {
    // 1. Ждем, пока Офицер создаст полноценную транзакцию с ID
    const fullTransaction = await createTransactionUseCase.execute(data);
    
    // 2. Добавляем в реактивный массив ПОЛНЫЙ объект
    transactions.value.unshift(fullTransaction);
    
  } catch (error) {
    console.error('Ошибка при создании:', error);
    throw error;
  } finally {
    isLoading.value = false;
  }
  };


  const updateTransaction = async (transaction: Transaction) => {
  try {
    const updated = await updateTransactionUseCase.execute(transaction);

    // 2. Находим, где эта транзакция лежит в нашем списке на экране
    const index = transactions.value.findIndex(t => t.id === updated.id);

    if (index !== -1) {
      // 3. МАГИЯ ЗДЕСЬ: Используем splice, чтобы Vue "увидел" замену объекта
      // Это заставит Dashboard перерисовать иконку и сумму МГНОВЕННО
      transactions.value.splice(index, 1, { ...updated });
    }
    
  } catch (error) {
    console.error('Ошибка обновления в UI:', error);
    throw error;
  }
  };
  
  const deleteTransaction = async (id: string) => {
    // Оптимистичное удаление - сразу удаляем из локального состояния
    const index = transactions.value.findIndex(t => t.id === id);
    let removedTransaction: Transaction | null = null;
    
    if (index !== -1) {
      // Сохраняем удаленную транзакцию для возможного восстановления
      removedTransaction = { ...transactions.value[index] } as Transaction;
      transactions.value.splice(index, 1);
    }
    
    try {
      // Удаляем из Firebase
      await deleteTransactionUseCase.execute(id);
    } catch (error) {
      // В случае ошибки восстанавливаем удаленную транзакцию
      if (removedTransaction && index !== -1) {
        transactions.value.splice(index, 0, removedTransaction);
      }
      console.error('Ошибка при удалении:', error);
      throw error; // Пробрасываем ошибку дальше
    }
  };
  
  const recentTransactions = computed(() => {
    return transactions.value.slice(0, 4);
  })

  const getPagedTransactions = (page: number, itemsPerPage: number) => {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTransactions.value.slice(start, end);
  };

  const totalBalance = computed(() => {
    return transactions.value.reduce((total, transaction) => {
      return transaction.type ? total + transaction.transaction : total - transaction.transaction;
    }, 0);
  });

  const totalExpenses = computed(() => {
    return transactions.value.reduce((total, transaction) => {
      return transaction.type ? total : total + transaction.transaction;
    }, 0);
  });
  
  const totalIncome = computed(() => {
    return transactions.value.reduce((total, transaction) => {
      return transaction.type ? total + transaction.transaction : total;
    }, 0);
  });

  const deleteAllTransactions = async () => {
    try {
      await deleteAllTransactionUseCase.execute();
      transactions.value = [];
    } catch (error) {
      console.error('Ошибка при удалении всех транзакций:', error);
      throw error;
    }
  };

  const categoryStats = computed(() => {
    return getStatsUseCase.execute(transactions.value);
  });
  return {
    transactions,
    isLoading,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    totalBalance,
    totalExpenses,
    totalIncome,
    recentTransactions,
    getPagedTransactions,
    categoryStats,
    clearTransactions,
    filteredTransactions,
    setFilter,
    availableMonths,
    selectedMonth, 
    groupedTransactions
  };
}
