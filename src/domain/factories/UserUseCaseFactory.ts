import { SignOutUseCase } from '../use-cases/user/SignOutUseCase';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';
import { SignInUseCase } from '../use-cases/user/SignInUseCase';
import { SignUpUseCase } from '../use-cases/user/SignUpUseCase';
import { GetProfileUseCase } from '../use-cases/user/GetProfileUseCase'
import { SubscribeToAuthChangeUseCase } from '../use-cases/user/SubscribeToAuthChangeUseCase';
export class UserUseCaseFactory {
  private static userRepository = new FirebaseUserRepository();
  
  static createSignOutUseCase() {
    return new SignOutUseCase(this.userRepository);
  }

  static createSignInUseCase() {
    return new SignInUseCase(this.userRepository);
  }

  static createSignUpUseCase() {
    return new SignUpUseCase(this.userRepository);
  }

  static createGetProfileUseCase() {
    return new GetProfileUseCase(this.userRepository);
  }
  
  static createSubscribeToAuthChangeUseCase() {
    return new SubscribeToAuthChangeUseCase(this.userRepository);
  }
}


 
