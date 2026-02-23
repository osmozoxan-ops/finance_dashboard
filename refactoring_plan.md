# План рефакторинга проекта Finance Dashboard

## Этап 1: Подготовка структуры

### 1.1 Создание новой структуры папок

```
src/
├── presentation/
│   ├── components/
│   └── views/
├── domain/
│   ├── entities/
│   ├── use-cases/
│   └── interfaces/
├── data/
│   ├── repositories/
│   ├── datasources/
│   └── models/
├── shared/
│   ├── constants/
│   ├── utils/
│   └── types/
└── router/
```

### 1.2 Перенос существующих файлов

1. Перенести `src/interface.ts` в `src/shared/types/`
2. Перенести `src/components/` в `src/presentation/components/`
3. Перенести `src/views/` в `src/presentation/views/`
4. Перенести `src/router/` в корень `src/`

## Этап 2: Создание слоя Domain

### 2.1 Создание бизнес-сущностей

Файл: `src/domain/entities/Transaction.ts`
```typescript
export interface Transaction {
  id: string;
  transaction: number;
  type: boolean;
  category: string;
  createdAt: Date;
  icon: string;
}
```

Файл: `src/domain/entities/User.ts`
```typescript
export interface User {
  id: string;
  name: string;
}
```

### 2.2 Создание интерфейсов репозиториев

Файл: `src/domain/interfaces/TransactionRepository.ts`
```typescript
import { Transaction } from '../entities/Transaction';

export interface TransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
```

Файл: `src/domain/interfaces/UserRepository.ts`
```typescript
import { User } from '../entities/User';

export interface UserRepository {
  getCurrentUser(): Promise<User | null>;
  signOut(): Promise<void>;
}
```

### 2.3 Создание Use Cases

Файл: `src/domain/use-cases/transaction/GetAllTransactionsUseCase.ts`
```typescript
import { Transaction } from '../../entities/Transaction';
import { TransactionRepository } from '../../interfaces/TransactionRepository';

export class GetAllTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(): Promise<Transaction[]> {
    return this.transactionRepository.getAll();
  }
}
```

Файл: `src/domain/use-cases/transaction/CreateTransactionUseCase.ts`
```typescript
import { Transaction } from '../../entities/Transaction';
import { TransactionRepository } from '../../interfaces/TransactionRepository';

export class CreateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(transaction: Transaction): Promise<void> {
    return this.transactionRepository.create(transaction);
  }
}
```
<!-- 
Файл: `src/domain/use-cases/transaction/UpdateTransactionUseCase.ts` -->
```typescript
import { Transaction } from '../../entities/Transaction';
import { TransactionRepository } from '../../interfaces/TransactionRepository';

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(transaction: Transaction): Promise<void> {
    return this.transactionRepository.update(transaction);
  }
}
```

Файл: `src/domain/use-cases/transaction/DeleteTransactionUseCase.ts`
```typescript
import { TransactionRepository } from '../../interfaces/TransactionRepository';

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(id: string): Promise<void> {
    return this.transactionRepository.delete(id);
  }
}
```

Файл: `src/domain/use-cases/user/SignOutUseCase.ts`
```typescript
import { UserRepository } from '../../interfaces/UserRepository';

export class SignOutUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<void> {
    return this.userRepository.signOut();
  }
}
```

## Этап 3: Создание слоя Data

### 3.1 Создание моделей данных

Файл: `src/data/models/FirebaseTransaction.ts`
```typescript
export interface FirebaseTransaction {
  id: string;
  transaction: number;
  type: boolean;
  category: string;
  createdAt: any; // Firebase Timestamp
  icon: string;
}
```

### 3.2 Создание репозиториев

Файл: `src/data/repositories/FirebaseTransactionRepository.ts`
```typescript
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository } from '../../domain/interfaces/TransactionRepository';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export class FirebaseTransactionRepository implements TransactionRepository {
  private db = getFirestore();
  
  private getUserId(): string {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }
  
  async getAll(): Promise<Transaction[]> {
    const userId = this.getUserId();
    const q = query(collection(this.db, `users/${userId}/transactions`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        transaction: data.transaction,
        type: data.type,
        category: data.category,
        createdAt: data.createdAt.toDate(),
        icon: data.icon
      };
    });
  }
  
  async getById(id: string): Promise<Transaction | null> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        transaction: data.transaction,
        type: data.type,
        category: data.category,
        createdAt: data.createdAt.toDate(),
        icon: data.icon
      };
    }
    
    return null;
  }
  
  async create(transaction: Transaction): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, transaction.id);
    await setDoc(docRef, {
      ...transaction,
      createdAt: new Date()
    });
  }
  
  async update(transaction: Transaction): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, transaction.id);
    await updateDoc(docRef, transaction);
  }
  
  async delete(id: string): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, id);
    await deleteDoc(docRef);
  }
}
```

Файл: `src/data/repositories/FirebaseUserRepository.ts`
```typescript
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/interfaces/UserRepository';
import { getAuth, signOut } from 'firebase/auth';

export class FirebaseUserRepository implements UserRepository {
  private auth = getAuth();
  
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
}
```

## Этап 4: Адаптация Presentation слоя

### 4.1 Создание Composition Functions

Файл: `src/presentation/composables/useTransaction.ts`
```typescript
import { ref, computed } from 'vue';
import { Transaction } from '../../domain/entities/Transaction';
import { GetAllTransactionsUseCase } from '../../domain/use-cases/transaction/GetAllTransactionsUseCase';
import { CreateTransactionUseCase } from '../../domain/use-cases/transaction/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../../domain/use-cases/transaction/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../domain/use-cases/transaction/DeleteTransactionUseCase';
import { FirebaseTransactionRepository } from '../../data/repositories/FirebaseTransactionRepository';

const transactionRepository = new FirebaseTransactionRepository();
const getAllTransactionsUseCase = new GetAllTransactionsUseCase(transactionRepository);
const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository);
const updateTransactionUseCase = new UpdateTransactionUseCase(transactionRepository);
const deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);

export function useTransaction() {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  
  const loadTransactions = async () => {
    isLoading.value = true;
    try {
      transactions.value = await getAllTransactionsUseCase.execute();
    } finally {
      isLoading.value = false;
    }
  };
  
  const createTransaction = async (transaction: Transaction) => {
    await createTransactionUseCase.execute(transaction);
    await loadTransactions();
  };
  
  const updateTransaction = async (transaction: Transaction) => {
    await updateTransactionUseCase.execute(transaction);
    await loadTransactions();
  };
  
  const deleteTransaction = async (id: string) => {
    await deleteTransactionUseCase.execute(id);
    await loadTransactions();
  };
  
  const totalBalance = computed(() => {
    return transactions.value.reduce((total, transaction) => {
      return transaction.type ? total + transaction.transaction : total - transaction.transaction;
    }, 0);
  });
  
  const totalExpenses = computed(() => {
    return transactions.value.reduce((total, transaction) => {
      return transaction.type ? total : total + transaction.transaction;
    }, 0);
  });
  
  const totalIncome = computed(() => {
    return transactions.value.reduce((total, transaction) => {
      return transaction.type ? total + transaction.transaction : total;
    }, 0);
  });
  
  return {
    transactions: transactions.value,
    isLoading,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    totalBalance,
    totalExpenses,
    totalIncome
  };
}
```

Файл: `src/presentation/composables/useUser.ts`
```typescript
import { ref } from 'vue';
import { User } from '../../domain/entities/User';
import { SignOutUseCase } from '../../domain/use-cases/user/SignOutUseCase';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';

const userRepository = new FirebaseUserRepository();
const signOutUseCase = new SignOutUseCase(userRepository);

export function useUser() {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  
  const loadUser = async () => {
    isLoading.value = true;
    try {
      user.value = await userRepository.getCurrentUser();
    } finally {
      isLoading.value = false;
    }
  };
  
  const signOut = async () => {
    await signOutUseCase.execute();
  };
  
  return {
    user,
    isLoading,
    loadUser,
    signOut
  };
}
```

## Этап 5: Адаптация компонентов

### 5.1 Адаптация DashboardView.vue

Файл: `src/presentation/views/DashboardView.vue`
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useTransaction } from '../composables/useTransaction';
import { useUser } from '../composables/useUser';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import PopUp from '../components/PopUp.vue';
import ArrayTransactions from '../components/ArrayTransactions.vue';

const router = useRouter();
const { 
  transactions, 
  isLoading, 
  loadTransactions, 
  totalBalance, 
  totalExpenses, 
  totalIncome 
} = useTransaction();
const { user, loadUser, signOut } = useUser();

const showPopupNew = ref<boolean>(false);
let bufferTransaction = ref<any>({});

onMounted(async () => {
  await loadUser();
  await loadTransactions();
});

const signOutMethod = async (): Promise<void> => {
  await signOut();
  router.push('/');
};

// Вычисляем данные для графика
const chartData = computed(() => {
  // Агрегация данных по категориям
  const categoryTotals: Record<string, number> = {
    'Еда': 0,
    'Транспорт': 0,
    'Здоровье': 0,
    'Развлечения': 0,
    'Прочее': 0
  };
  
  // Суммируем транзакции по категориям (только расходы)
  transactions.forEach(transaction => {
    if (!transaction.type && categoryTotals[transaction.category] !== undefined) {
      const currentTotal = categoryTotals[transaction.category];
      if (currentTotal !== undefined) {
        categoryTotals[transaction.category] = currentTotal + transaction.transaction;
      }
    }
  });
  
  return {
    labels: ['Еда', 'Транспорт', 'Здоровье', 'Развлечения', 'Прочее'],
    datasets: [
      {
        data: [
          categoryTotals['Еда'],
          categoryTotals['Транспорт'],
          categoryTotals['Здоровье'],
          categoryTotals['Развлечения'],
          categoryTotals['Прочее']
        ],
        backgroundColor: [
          '#FF6384', // Розовый
          '#36A2EB', // Синий
          '#FFCE56', // Желтый
          '#4BC0C0', // Бирюзовый
          '#9966FF' // Фиолетовый'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#495057',
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  },
  cutout: '0%',
  animation: {
    animateScale: true,
    animateRotate: true
  }
});
</script>

<template>
  <!-- Popup для добавления новой транзакции -->
  <PopUp 
    @bufferTransaction="bufferTransaction = $event" 
    @update="showPopupNew = $event" 
    :user-id="user?.id || ''" 
    :show-popup-new="showPopupNew" 
    :buffer-transaction="bufferTransaction" 
  />

  <!-- блок с юзером -->
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="flex p-8 rounded-lg w-full max-w-lg neumorphism-convex m-3 justify-between">
      <div> Добрый день, <br> {{ user?.name || 'Пользователь' }}</div>
      <Button
        @click="signOutMethod"
        type="button"
        icon="pi pi-sign-out"
        class="c w-[50px]! h-[50px]! rounded-full!"
      />
    </div>

    <!-- блок с балансом -->
    <div class="p-8 mb-0 rounded-lg w-full max-w-lg neumorphism-convex m-3">
      <p>Общая баланс: </p>
      <p class="text-2xl">{{ totalBalance }}₽</p>
    </div>
    <div class="flex w-full max-w-lg">
      <div class="p-8 rounded-lg w-full max-w-lg neumorphism-convex mr-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Расходы:</p>
        <p class="text-lg">{{ totalExpenses }}₽</p>
      </div>
      <div class="p-8 rounded-lg w-full max-w-lg neumorphism-convex ml-1.5 mt-3 mb-3 py-6">
        <p class="text-sm">Доходы: </p>
        <p class="text-lg">{{ totalIncome }}₽</p>
      </div>
    </div>

    <!-- блок графика -->
    <div class="p-4 rounded-lg w-full max-w-lg neumorphism-convex mb-2">
      <Chart type="pie" :data="chartData" :options="chartOptions" />
    </div>

    <Button
      @click="showPopupNew = !showPopupNew"
      label="Добавить транзакцию"
      type="button"
      icon="pi pi-plus"
      class="p-8 rounded-lg w-full max-w-lg custom-override ml-1.5 mt-3 mb-3 py-6"
    />

    <!-- блок транзакций -->
    <ArrayTransactions
      @bufferTransaction="bufferTransaction = $event" 
      @update="showPopupNew = $event"
      :pageType="'dashboard'"
      :all-transaction="transactions"
      :show-popup-new="showPopupNew"
      :buffer-transaction="bufferTransaction"
      :user-id="user?.id || ''" 
    />
    <router-link to="/transactions" class="w-full max-w-lg mb-20">
      <Button
        label="Все транзакции"
        class="p-4 rounded-lg w-full max-w-lg subtle-button mt-3 py-6"
      />
    </router-link>
  </div>
</template>

<style scoped></style>
```

## Этап 6: Создание точек входа

### 6.1 Создание фабрик для Use Cases

Файл: `src/domain/factories/TransactionUseCaseFactory.ts`
```typescript
import { GetAllTransactionsUseCase } from '../use-cases/transaction/GetAllTransactionsUseCase';
import { CreateTransactionUseCase } from '../use-cases/transaction/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../use-cases/transaction/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../use-cases/transaction/DeleteTransactionUseCase';
import { FirebaseTransactionRepository } from '../../data/repositories/FirebaseTransactionRepository';

export class TransactionUseCaseFactory {
  private static transactionRepository = new FirebaseTransactionRepository();
  
  static createGetAllTransactionsUseCase() {
    return new GetAllTransactionsUseCase(this.transactionRepository);
  }
  
  static createCreateTransactionUseCase() {
    return new CreateTransactionUseCase(this.transactionRepository);
  }
  
  static createUpdateTransactionUseCase() {
    return new UpdateTransactionUseCase(this.transactionRepository);
  }
  
  static createDeleteTransactionUseCase() {
    return new DeleteTransactionUseCase(this.transactionRepository);
  }
}
```

Файл: `src/domain/factories/UserUseCaseFactory.ts`
```typescript
import { SignOutUseCase } from '../use-cases/user/SignOutUseCase';
import { FirebaseUserRepository } from '../../data/repositories/FirebaseUserRepository';

export class UserUseCaseFactory {
  private static userRepository = new FirebaseUserRepository();
  
  static createSignOutUseCase() {
    return new SignOutUseCase(this.userRepository);
  }
}
```

## План миграции

### Этап 1 (1-2 дня)
1. Создание структуры папок
2. Перенос типов в shared/types
3. Создание entities в domain

### Этап 2 (2-3 дня)
1. Создание интерфейсов репозиториев
2. Создание use cases
3. Создание моделей данных

### Этап 3 (3-4 дня)
1. Создание реализаций репозиториев
2. Создание composables
3. Адаптация компонентов

### Этап 4 (1-2 дня)
1. Тестирование функциональности
2. Исправление ошибок
3. Оптимизация производительности

## Преимущества после рефакторинга

1. **Четкое разделение ответственности** - каждый слой имеет свою зону ответственности
2. **Упрощенное тестирование** - бизнес-логика изолирована и легко тестируется
3. **Легкость поддержки** - изменения в одном слое не влияют на другие
4. **Масштабируемость** - легко добавлять новые функции
5. **Независимость от фреймворка** - бизнес-логика не зависит от Vue
6. **Повторное использование кода** - use cases могут использоваться в разных частях приложения