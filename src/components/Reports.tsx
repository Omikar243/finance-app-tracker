import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#64748b'
];

interface ReportsProps {
  expenses: Expense[];
}

export function Reports({ expenses }: ReportsProps) {
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'custom'>('thisMonth');
  const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(exp => {
      if (exp.type === 'income') return false; // Only report on expenses
      const expDate = parseISO(exp.date);
      if (dateFilter === 'thisMonth') {
        return isWithinInterval(expDate, { start: startOfMonth(now), end: endOfMonth(now) });
      } else if (dateFilter === 'lastMonth') {
        const lastMonth = subMonths(now, 1);
        return isWithinInterval(expDate, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
      } else if (dateFilter === 'custom' && customStart && customEnd) {
        try {
          return isWithinInterval(expDate, { start: parseISO(customStart), end: parseISO(customEnd) });
        } catch (e) {
          return true;
        }
      }
      return true;
    });
  }, [expenses, dateFilter, customStart, customEnd]);

  const categoryData = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const sustainabilityData = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, exp) => {
      const sus = exp.sustainability || 'N/A';
      if (sus !== 'N/A') {
        acc[sus] = (acc[sus] || 0) + exp.amount;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const timeData = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, exp) => {
      const dateObj = parseISO(exp.date);
      const key = format(dateObj, 'yyyy-MM-dd');
      acc[key] = (acc[key] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount]) => ({
        date: format(parseISO(date), 'MMM dd'),
        amount
      }));
  }, [filteredExpenses]);

  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const SUSTAINABILITY_COLORS: Record<string, string> = {
    'Low GHG': '#10b981', // emerald
    'Medium GHG': '#f59e0b', // amber
    'High GHG': '#ef4444', // red
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Spending Reports</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  placeholder="Start date"
                  aria-label="Start date"
                  className="rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  placeholder="End date"
                  aria-label="End date"
                  className="rounded-xl border-gray-300 bg-gray-50 border py-2 px-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 inline-block">
          <p className="text-sm text-blue-600 font-medium mb-1">Total Spending in Period</p>
          <p className="text-3xl font-light text-blue-900">₹{totalFiltered.toFixed(2)}</p>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No expenses found for the selected period.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div className="border border-gray-100 rounded-xl p-4 lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Spending Over Time</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Spending by Category</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sustainability Pie Chart */}
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Sustainability Breakdown</h3>
              {sustainabilityData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sustainabilityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sustainabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SUSTAINABILITY_COLORS[entry.name] || '#64748b'} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                  No sustainability data available for this period.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
