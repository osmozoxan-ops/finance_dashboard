import type { User } from '../../entities/User';
import type { UserRepository } from '../../interfaces/UserRepository';

export class GetProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User | null> {
    // Этот метод просто просит репозиторий дать текущего юзера
    return await this.userRepository.getCurrentUser();
  }
}
