export interface ITransaction {
  id: string;
  transaction: number;
  type: boolean;
  category: string;
  createdAt: Date;
  icon: string;
}