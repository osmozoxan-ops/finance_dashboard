import { GetAllTransactionsUseCase } from '../use-cases/transaction/GetAllTransactionsUseCase';
import { CreateTransactionUseCase } from '../use-cases/transaction/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../use-cases/transaction/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../use-cases/transaction/DeleteTransactionUseCase';
import { FirebaseTransactionRepository } from '../../data/repositories/FirebaseTransactionRepository';

export class TransactionUseCaseFactory {
  private static transactionRepository = new FirebaseTransactionRepository();
  
  static createGetAllTransactionsUseCase() {
    return new GetAllTransactionsUseCase(this.transactionRepository);
  }
  
  static createCreateTransactionUseCase() {
    return new CreateTransactionUseCase(this.transactionRepository);
  }
  
  static createUpdateTransactionUseCase() {
    return new UpdateTransactionUseCase(this.transactionRepository);
  }
  
  static createDeleteTransactionUseCase() {
    return new DeleteTransactionUseCase(this.transactionRepository);
  }
}