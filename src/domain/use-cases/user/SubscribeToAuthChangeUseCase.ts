import type { UserRepository } from '../../interfaces/UserRepository';

export class SubscribeToAuthChangeUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(callback: (userId: string | null) => void): void {
    this.userRepository.subscribeToAuthChange(callback);
  }
}