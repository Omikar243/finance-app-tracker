import React from 'react';
import { Expense } from '../types';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 font-medium">No expenses recorded yet.</p>
        <p className="text-sm text-gray-400 mt-1">Add an expense to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
      </div>
      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                {expense.category.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                  <span>{expense.category}</span>
                  <span>&bull;</span>
                  <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-base font-medium text-gray-900">
                ${expense.amount.toFixed(2)}
              </span>
              <button
                onClick={() => onDelete(expense.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 p-2 rounded-full hover:bg-red-50"
                aria-label="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
