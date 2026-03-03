import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Budget, Category } from '../types';

export function useFinance() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('finance_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('finance_budget');
    return saved ? JSON.parse(saved) : { total: 2000 };
  });

  useEffect(() => {
    localStorage.setItem('finance_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finance_budget', JSON.stringify(budget));
  }, [budget]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [{ ...expense, id: uuidv4() }, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateBudget = (total: number) => {
    setBudget({ total });
  };

  return {
    expenses,
    budget,
    addExpense,
    deleteExpense,
    updateBudget
  };
}
