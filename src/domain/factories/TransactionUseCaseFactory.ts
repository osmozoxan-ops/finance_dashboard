import { GetAllTransactionsUseCase } from '../use-cases/transaction/GetAllTransactionsUseCase';
import { CreateTransactionUseCase } from '../use-cases/transaction/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../use-cases/transaction/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../use-cases/transaction/DeleteTransactionUseCase';
import { FirebaseTransactionRepository } from '../../data/repositories/FirebaseTransactionRepository';
import { DeleteAllTransactionsUseCase } from '../use-cases/transaction/DeleteAllTransactionsUseCase';
import { GetCategoryStatisticsUseCase } from '../use-cases/transaction/GetCategoryStatisticsUseCase';
import { FilterTransactionsUseCase } from '../use-cases/transaction/FilterTransactionsUseCase';
import { GetAvailableMonthsUseCase } from '../use-cases/transaction/GetAvailableMonthsUseCase';
import { GroupTransactionsByDateUseCase } from '../use-cases/transaction/GroupTransactionsByDateUseCase';


export class TransactionUseCaseFactory {
  private static transactionRepository: FirebaseTransactionRepository | null = null;

  // Внутренний метод для безопасного получения репозитория
  private static getRepository(): FirebaseTransactionRepository {
    if (!this.transactionRepository) {
      // Создаем репозиторий только ТОГДА, когда он реально понадобился
      // К этому моменту main.ts уже точно инициализирует Firebase
      this.transactionRepository = new FirebaseTransactionRepository();
    }
    return this.transactionRepository;
  }

  static createGetAllTransactionsUseCase() {
    return new GetAllTransactionsUseCase(this.getRepository());
  }
  
  static createCreateTransactionUseCase() {
    return new CreateTransactionUseCase(this.getRepository());
  }
  
  static createUpdateTransactionUseCase() {
    return new UpdateTransactionUseCase(this.getRepository());
  }
  
  static createDeleteTransactionUseCase() {
    return new DeleteTransactionUseCase(this.getRepository());
  }

  static createDeleteAllTransactionsUseCase() {
    return new DeleteAllTransactionsUseCase(this.getRepository());
  }

  static createGetCategoryStatisticsUseCase() {
    return new GetCategoryStatisticsUseCase();
  }

  static createFilterTransactionsUseCase() {
    return new FilterTransactionsUseCase();
  }

  static createGetAvailableMonthsUseCase() {
    return new GetAvailableMonthsUseCase();
  }

  static createGroupTransactionsByDateUseCase() {
    return new GroupTransactionsByDateUseCase();
  }
}
