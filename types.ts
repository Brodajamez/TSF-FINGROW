export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string format
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Record {
  id:string;
  title: string;
  content: string;
  date: string; // ISO string format
}

export enum View {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  EXPENSE_TRACKER = 'expense_tracker',
  BUDGET = 'budget',
  ADVISOR = 'advisor',
  INVESTMENTS = 'investments',
  RECORDS = 'records',
  SETTINGS = 'settings',
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
}