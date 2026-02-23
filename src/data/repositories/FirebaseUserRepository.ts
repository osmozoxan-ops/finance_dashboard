import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/interfaces/UserRepository';
import { getAuth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';

export class FirebaseUserRepository implements UserRepository {
  private get auth() {
    return getAuth();
  }
  
  subscribeToAuthChange(callback: (userId: string | null) => void): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        callback(user.uid);
      } else {
        callback(null);
      }
    });
  }
  async getCurrentUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    if (user) {
      return {
        id: user.uid,
        name: user.displayName || 'Пользователь'
      };
    }
    return null;
  }
  
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    // Обновляем имя в профиле Firebase сразу после создания
    await updateProfile(userCredential.user, { displayName: name });
  }
}