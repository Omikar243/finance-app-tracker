export type Category = 
  | 'Housing' 
  | 'Food' 
  | 'Transportation' 
  | 'Utilities' 
  | 'Insurance' 
  | 'Medical' 
  | 'Savings' 
  | 'Personal' 
  | 'Entertainment' 
  | 'Salary'
  | 'P2P Transfer'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Insurance',
  'Medical',
  'Savings',
  'Personal',
  'Entertainment',
  'Salary',
  'P2P Transfer',
  'Other'
];

export type Sustainability = 'Low GHG' | 'Medium GHG' | 'High GHG' | 'N/A';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO string
  description: string;
  sustainability?: Sustainability;
  type?: 'income' | 'expense';
  sourceFile?: string;
  timestamp?: number;
  location?: string;
}

export interface Budget {
  total: number;
}
