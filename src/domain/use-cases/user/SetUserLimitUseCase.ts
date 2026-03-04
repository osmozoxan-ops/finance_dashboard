import type { User } from '../../entities/User';
import type { UserRepository } from '../../interfaces/UserRepository';

export class SetUserLimitUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(limit: number): Promise<void> {
    if (limit < 0) throw new Error('Лимит не может быть меньше 0');
    await this.userRepository.updateLimit(limit);
   
  }
}