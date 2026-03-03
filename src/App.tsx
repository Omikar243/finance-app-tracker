/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { BudgetSettings } from './components/BudgetSettings';
import { Reports } from './components/Reports';
import { AIAdvisor } from './components/AIAdvisor';
import { Wallet, LayoutDashboard, PieChart as PieChartIcon, Sparkles } from 'lucide-react';

export default function App() {
  const { expenses, budget, addExpense, deleteExpense, updateBudget } = useFinance();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'advisor'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">FinanceTracker</h1>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-4 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:block" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChartIcon className="w-4 h-4 mr-1.5 hidden sm:block" />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'advisor' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-1.5 hidden sm:block" />
              AI Advisor
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Dashboard expenses={expenses} budget={budget} />
              <ExpenseList expenses={expenses} onDelete={deleteExpense} />
            </div>
            <div className="space-y-8">
              <ExpenseForm onAddExpense={addExpense} />
              <BudgetSettings budget={budget} onUpdateBudget={updateBudget} />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <Reports expenses={expenses} />
        )}

        {activeTab === 'advisor' && (
          <div className="max-w-3xl mx-auto">
            <AIAdvisor expenses={expenses} budget={budget} />
          </div>
        )}
      </main>
    </div>
  );
}
