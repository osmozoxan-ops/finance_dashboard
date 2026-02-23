// src/domain/use-cases/users/SignInUseCase.ts
import type { UserRepository } from '../../interfaces/UserRepository';

export class SignInUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, pass: string): Promise<void> {
    // Тут можно добавить валидацию: например, проверку на пустой email
    if (!email.includes('@')) throw new Error('Некорректный email');
    
    await this.userRepository.signIn(email, pass);
  }
} 
