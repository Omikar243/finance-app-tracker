import React, { useState } from 'react';
import { Expense, CATEGORIES, Category } from '../types';
import { PlusCircle } from 'lucide-react';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (numAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    // Validate decimal precision (max 2 decimal places)
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      setError('Amount cannot have more than 2 decimal places.');
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate > today) {
      setError('Date cannot be in the future.');
      return;
    }

    onAddExpense({
      amount: numAmount,
      category,
      date,
      description,
      location: location.trim() || undefined
    });

    setAmount('');
    setDescription('');
    setLocation('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Expense</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 block w-full rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="block w-full rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-all"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-all"
            placeholder="Where was this?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition-all"
            placeholder="What was this for?"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Expense
        </button>
      </form>
    </div>
  );
}
