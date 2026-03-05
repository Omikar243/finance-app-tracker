import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { Expense, Budget, Category } from '../types';

const SECRET_KEY = 'finance-tracker-local-secure-key-256';

const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
};

export function useFinance() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedSecure = localStorage.getItem('finance_expenses_secure');
    if (savedSecure) {
      const decrypted = decryptData(savedSecure);
      if (decrypted) return decrypted;
    }
    // Fallback to old unencrypted data for migration
    const saved = localStorage.getItem('finance_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<Budget>(() => {
    const savedSecure = localStorage.getItem('finance_budget_secure');
    if (savedSecure) {
      const decrypted = decryptData(savedSecure);
      if (decrypted) return decrypted;
    }
    const saved = localStorage.getItem('finance_budget');
    return saved ? JSON.parse(saved) : { total: 2000 };
  });

  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>(() => {
    const savedSecure = localStorage.getItem('finance_category_icons_secure');
    if (savedSecure) {
      const decrypted = decryptData(savedSecure);
      if (decrypted) return decrypted;
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('finance_expenses_secure', encryptData(expenses));
    // Clear old unencrypted data
    localStorage.removeItem('finance_expenses');
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finance_budget_secure', encryptData(budget));
    localStorage.removeItem('finance_budget');
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('finance_category_icons_secure', encryptData(categoryIcons));
  }, [categoryIcons]);

  const addExpense = (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    setExpenses(prev => {
      // Duplicate detection
      const isDuplicate = prev.some(e => 
        e.amount === expense.amount && 
        e.date === expense.date && 
        e.description.toLowerCase() === expense.description.toLowerCase()
      );
      if (isDuplicate) {
        alert('Duplicate transaction detected and ignored.');
        return prev;
      }
      return [{ ...expense, id: uuidv4(), timestamp: Date.now(), type: expense.type || 'expense' }, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const addExpenses = (newExpenses: Omit<Expense, 'id' | 'timestamp'>[]) => {
    setExpenses(prev => {
      // Filter out duplicates
      const uniqueNew = newExpenses.filter(newExp => 
        !prev.some(e => 
          e.amount === newExp.amount && 
          e.date === newExp.date && 
          e.description.toLowerCase() === newExp.description.toLowerCase()
        )
      );
      const withIds = uniqueNew.map(e => ({ ...e, id: uuidv4(), timestamp: Date.now(), type: e.type || 'expense' }));
      return [...withIds, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const deleteBySourceFile = (sourceFile: string) => {
    setExpenses(prev => prev.filter(e => e.sourceFile !== sourceFile));
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  const updateBudget = (total: number) => {
    setBudget({ total });
  };

  const updateCategoryIcon = (category: string, iconName: string) => {
    setCategoryIcons(prev => ({ ...prev, [category]: iconName }));
  };

  return {
    expenses,
    budget,
    categoryIcons,
    addExpense,
    addExpenses,
    deleteExpense,
    deleteBySourceFile,
    clearAllExpenses,
    updateBudget,
    updateCategoryIcon
  };
}
