import type { UserRepository } from '../../interfaces/UserRepository';

export class SignOutUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<void> {
    await this.userRepository.signOut();
  }
}