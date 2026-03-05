import React, { useState } from 'react';
import { Expense } from '../types';
import { format } from 'date-fns';
import { Trash2, Leaf, AlertTriangle, MinusCircle, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CategoryIconSelector } from './CategoryIconSelector';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onClearAll?: () => void;
  categoryIcons?: Record<string, string>;
  onUpdateCategoryIcon?: (category: string, iconName: string) => void;
}

export function ExpenseList({ expenses, onDelete, onClearAll, categoryIcons, onUpdateCategoryIcon }: ExpenseListProps) {
  const [filter, setFilter] = useState<string>('All');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [selectingIconFor, setSelectingIconFor] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 font-medium">No transactions recorded yet.</p>
        <p className="text-sm text-gray-400 mt-1">Add an expense or import statements to see them here.</p>
      </div>
    );
  }

  const getSustainabilityIcon = (sustainability?: string) => {
    switch (sustainability) {
      case 'Low GHG':
        return <Leaf className="w-3 h-3 text-emerald-500 mr-1" />;
      case 'High GHG':
        return <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />;
      case 'Medium GHG':
        return <MinusCircle className="w-3 h-3 text-amber-500 mr-1" />;
      case 'N/A':
      default:
        return null;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'All') return true;
    // Treat undefined sustainability as 'N/A' for filtering purposes
    const sus = expense.sustainability || 'N/A';
    return sus === filter;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg bg-gray-50 px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
          >
            <option value="All">All Impact</option>
            <option value="Low GHG">Low GHG</option>
            <option value="Medium GHG">Medium GHG</option>
            <option value="High GHG">High GHG</option>
            <option value="N/A">N/A</option>
          </select>
          {onClearAll && (
            isConfirmingClear ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-red-600 font-medium">Are you sure?</span>
                <button
                  onClick={() => {
                    onClearAll();
                    setIsConfirmingClear(false);
                  }}
                  className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingClear(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear All
              </button>
            )
          )}
        </div>
      </div>
      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No transactions match the selected sustainability filter.
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const iconName = categoryIcons?.[expense.category];
            // @ts-ignore
            const IconComponent = iconName ? Icons[iconName] : null;

            return (
              <div key={expense.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div 
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                      expense.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}
                    onClick={() => onUpdateCategoryIcon && setSelectingIconFor(expense.category)}
                    title="Change icon"
                  >
                    {IconComponent ? <IconComponent size={20} /> : expense.category.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                      <span>{expense.category}</span>
                      <span>&bull;</span>
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                      {expense.sustainability && expense.sustainability !== 'N/A' && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center" title={`Sustainability: ${expense.sustainability}`}>
                            {getSustainabilityIcon(expense.sustainability)}
                            {expense.sustainability}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-base font-medium ${
                    expense.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                  }`}>
                    {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 p-2 rounded-full hover:bg-red-50"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {selectingIconFor && onUpdateCategoryIcon && (
        <CategoryIconSelector
          selectedIcon={categoryIcons?.[selectingIconFor]}
          onSelect={(icon) => {
            onUpdateCategoryIcon(selectingIconFor, icon);
            setSelectingIconFor(null);
          }}
          onClose={() => setSelectingIconFor(null)}
        />
      )}
    </div>
  );
}
