// src/domain/use-cases/users/SignUpUseCase.ts
import type { UserRepository } from '../../interfaces/UserRepository';

export class SignUpUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, pass: string, name: string): Promise<void> {
    // Валидация перед отправкой в базу
    if (name.trim().length < 2) {
      throw new Error('Имя слишком короткое');
    }
    if (pass.length < 6) {
      throw new Error('Пароль должен быть не менее 6 символов');
    }

    // Передаем проверенные данные в репозиторий
    await this.userRepository.signUp(email, pass, name);
  }
}
