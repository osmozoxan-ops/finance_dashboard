import { SignOutUseCase } from '../use-cases/user/SignOutUseCase';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';

export class UserUseCaseFactory {
  private static userRepository = new FirebaseUserRepository();
  
  static createSignOutUseCase() {
    return new SignOutUseCase(this.userRepository);
  }
}