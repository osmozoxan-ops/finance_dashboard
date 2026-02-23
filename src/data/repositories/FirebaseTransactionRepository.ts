import type { Transaction } from '../../domain/entities/Transaction';
import type { TransactionRepository } from '../../domain/interfaces/TransactionRepository';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


export class FirebaseTransactionRepository implements TransactionRepository {
  private db = getFirestore();
  
  private getUserId(): string {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('Пользователь не авторизован');
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
  };
  
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
  };
  
  async create(transaction: Transaction): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, transaction.id);
    await setDoc(docRef, {
      ...transaction
    });
  };
  
  async update(transaction: Transaction): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, transaction.id);
    await updateDoc(docRef, {
      ...transaction
    });
  };
  
  async delete(id: string): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.db, `users/${userId}/transactions`, id);
    await deleteDoc(docRef);
  };

  async deleteAll(): Promise<void> {
    const userId = this.getUserId();
    const q = query(collection(this.db, `users/${userId}/transactions`));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.docs.forEach(async doc => {
      await deleteDoc(doc.ref);
    });
  };
}