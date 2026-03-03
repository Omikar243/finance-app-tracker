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
  'Other'
];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO string
  description: string;
}

export interface Budget {
  total: number;
}
