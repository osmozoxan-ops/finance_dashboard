import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user' // Импортируем Pinia
import { useTransaction } from './useTransaction';
import { UserUseCaseFactory } from '@/domain/factories/UserUseCaseFactory';

export function useUser() {
  const userStore = useUserStore() // Инициализируем стор
  const isLoading = ref(false)
  const { clearTransactions } = useTransaction()
  // Инициализируем репозиторий и юзкейсы
  const authChangeUseCase = UserUseCaseFactory.createSubscribeToAuthChangeUseCase();
  const getProfileUseCase = UserUseCaseFactory.createGetProfileUseCase();
  const signOutUseCase = UserUseCaseFactory.createSignOutUseCase();
  const signInUseCase = UserUseCaseFactory.createSignInUseCase();
  const signUpUseCase = UserUseCaseFactory.createSignUpUseCase();

  const initSession = () => {
    return new Promise<void>((resolve) => {
      authChangeUseCase.execute(async (uid) => {
        if (uid) {
          userStore.userId = uid;
        } else {
          userStore.userId = '';
        }
        resolve();
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
      console.error('Ошибка авторизации:', error)
      throw error 
    }
  }
  const signUp = async (email: string, password: string, name: string) => {
    try {
      await signUpUseCase.execute(email, password, name)
    } catch (error) {
      console.error('Ошибка при регистрации:', error)
      throw error 
    }
  }
  return {
    // Теперь мы можем возвращать данные прямо из Pinia!
    userId: computed(() => userStore.userId),
    userName: computed(() => userStore.userName),
    isLoading,
    loadUser,
    signOut,
    signIn,
    signUp,
    initSession
  }
}
