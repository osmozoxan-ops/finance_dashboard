import { ref } from 'vue';
import { SignOutUseCase } from '../../domain/use-cases/user/SignOutUseCase';
import { SignInUseCase } from '@/domain/use-cases/user/SignInUseCase';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';
import { GetProfileUseCase } from '../../domain/use-cases/user/GetProfileUseCase'
import { useUserStore } from '../stores/user' // Импортируем Pinia
import { SignUpUseCase } from '../../domain/use-cases/user/SignUpUseCase'
import { useTransaction } from './useTransaction';

export function useUser() {
  const userStore = useUserStore() // Инициализируем стор
  const isLoading = ref(false)
  const { clearTransactions } = useTransaction()
  // Инициализируем репозиторий и юзкейсы
  const userRepository = new FirebaseUserRepository()
  const getProfileUseCase = new GetProfileUseCase(userRepository)
  const signOutUseCase = new SignOutUseCase(userRepository)
  const signInUseCase = new SignInUseCase(userRepository)
  const signUpUseCase = new SignUpUseCase(userRepository)

  const initSession = () => {
    return new Promise<void>((resolve) => {
      userRepository.subscribeToAuthChange(async (uid) => {
        if (uid) {
          userStore.userId = uid;
          // await loadUser(); // Если хочешь сразу имя подгрузить
        } else {
          userStore.userId = '';
        }
        resolve(); // ДАЕМ СИГНАЛ "МОЖНО ИДТИ ДАЛЬШЕ"
      });
    });
  };

  const loadUser = async () => {
    isLoading.value = true
    try {
      const userEntity = await getProfileUseCase.execute()
      if (userEntity) {
        // СИНХРОНИЗАЦИЯ С PINIA
        userStore.setUser(userEntity.id, userEntity.name)
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error)
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      await signOutUseCase.execute()
      // ОЧИСТКА PINIA ПРИ ВЫХОДЕ
      userStore.clearUser()
      clearTransactions()
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInUseCase.execute(email, password)
    } catch (error) {
      console.error('Ошибка при входе:', error)
    }
  }
  const signUp = async (email: string, password: string, name: string) => {
    try {
      await signUpUseCase.execute(email, password, name)
    } catch (error) {
      console.error('Ошибка при регистрации:', error)
    }
  }
  return {
    // Теперь мы можем возвращать данные прямо из Pinia!
    userId: userStore.userId,
    userName: userStore.userName,
    isLoading,
    loadUser,
    signOut,
    signIn,
    signUp,
    initSession
  }
}
