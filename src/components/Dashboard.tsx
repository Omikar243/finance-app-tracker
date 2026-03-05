import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Expense, Budget } from '../types';

interface DashboardProps {
  expenses: Expense[];
  budget: Budget;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#64748b'
];

export function Dashboard({ expenses, budget }: DashboardProps) {
  const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budget.total - totalExpenses;
  const percentUsed = budget.total > 0 ? Math.min((totalExpenses / budget.total) * 100, 100) : 0;

  const expensesByCategory = expenses.filter(e => e.type !== 'income').reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-3d p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Budget</h3>
          <p className="text-3xl font-light">₹{budget.total.toFixed(2)}</p>
        </div>
        <div className="card-3d p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Expenses</h3>
          <p className="text-3xl font-light">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="card-3d p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Remaining</h3>
          <p className={`text-3xl font-light ${remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            ₹{remaining.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card-3d p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Usage</h3>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{percentUsed.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${percentUsed > 90 ? 'bg-red-500' : percentUsed > 75 ? 'bg-amber-400' : 'bg-blue-500'}`}
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="card-3d p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--bg-color, #ffffff)',
                    color: 'var(--text-color, #1f2937)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
