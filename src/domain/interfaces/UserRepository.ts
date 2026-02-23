import type { User } from '../entities/User';

export interface UserRepository {
  getCurrentUser(): Promise<User | null>;
  signOut(): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, name: string): Promise<void>;
  subscribeToAuthChange(callback: (user: string | null) => void): void;
}