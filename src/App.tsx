/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { BudgetSettings } from './components/BudgetSettings';
import { Reports } from './components/Reports';
import { AIAdvisor } from './components/AIAdvisor';
import { StatementUploader } from './components/StatementUploader';
import { CyberEarth } from './components/CyberEarth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Wallet, LayoutDashboard, PieChart as PieChartIcon, Sparkles, UploadCloud, Moon, Sun, Eye } from 'lucide-react';

export default function App() {
  const { expenses, budget, categoryIcons, addExpense, addExpenses, deleteExpense, deleteBySourceFile, clearAllExpenses, updateBudget, updateCategoryIcon } = useFinance();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'advisor' | 'import'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (colorBlindMode !== 'none') {
      document.body.classList.add(colorBlindMode);
    }
  }, [colorBlindMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 relative">
      <ErrorBoundary fallback={<div className="fixed inset-0 -z-10 bg-slate-900" />}>
        {isDarkMode && <CyberEarth />}
      </ErrorBoundary>
      <header className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">FinanceTracker</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setColorBlindMode(prev => prev === 'none' ? 'protanopia' : prev === 'protanopia' ? 'deuteranopia' : prev === 'deuteranopia' ? 'tritanopia' : 'none')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Toggle Color Blind Mode"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <nav className="flex items-center space-x-1 sm:space-x-4 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:block" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'reports' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <PieChartIcon className="w-4 h-4 mr-1.5 hidden sm:block" />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('advisor')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'advisor' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-1.5 hidden sm:block" />
                AI Advisor
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'import' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4 mr-1.5 hidden sm:block" />
                Import
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Dashboard expenses={expenses} budget={budget} />
              <ExpenseList 
                expenses={expenses} 
                onDelete={deleteExpense} 
                onClearAll={clearAllExpenses}
                categoryIcons={categoryIcons}
                onUpdateCategoryIcon={updateCategoryIcon}
              />
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

        {activeTab === 'import' && (
          <div className="max-w-3xl mx-auto">
            <StatementUploader 
              expenses={expenses}
              onUploadSuccess={addExpenses} 
              onDeleteSourceFile={deleteBySourceFile}
            />
          </div>
        )}
      </main>
    </div>
  );
}
