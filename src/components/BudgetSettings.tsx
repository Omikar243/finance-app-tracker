import React, { useState } from 'react';
import { Budget } from '../types';
import { Settings } from 'lucide-react';

interface BudgetSettingsProps {
  budget: Budget;
  onUpdateBudget: (total: number) => void;
}

export function BudgetSettings({ budget, onUpdateBudget }: BudgetSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.total.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const val = Number(newBudget);
    if (isNaN(val) || val <= 0) {
      setError('Budget must be greater than zero.');
      return;
    }
    
    if (!/^\d+(\.\d{1,2})?$/.test(newBudget)) {
      setError('Budget cannot have more than 2 decimal places.');
      return;
    }

    onUpdateBudget(val);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-400" />
          Budget Settings
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              step="1"
              min="1"
              required
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="pl-7 block w-full rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setNewBudget(budget.total.toString());
            }}
            className="py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          Your current monthly budget is <span className="font-medium text-gray-900">₹{budget.total.toFixed(2)}</span>.
        </p>
      )}
    </div>
  );
}
