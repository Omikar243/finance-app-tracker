import React, { useState } from 'react';
import { Expense, Budget } from '../types';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AIAdvisorProps {
  expenses: Expense[];
  budget: Budget;
}

export function AIAdvisor({ expenses, budget }: AIAdvisorProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeFinances = async () => {
    setLoading(true);
    setError('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const expensesByCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

      const prompt = `
        Act as a professional and encouraging financial advisor. Analyze my current financial situation based on the following data:
        - Monthly Budget Goal: $${budget.total}
        - Total Expenses Recorded: $${totalExpenses}
        - Expenses by Category: ${JSON.stringify(expensesByCategory)}
        
        Please provide:
        1. A brief summary of my spending habits.
        2. 3 actionable, specific tips to improve my financial health or save money based on the categories I spend the most on.
        3. A short encouraging closing statement.
        
        Format the response in Markdown. Keep it concise, friendly, and easy to read. Avoid generic advice if possible, tailor it to the data provided.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || 'No analysis generated.');
    } catch (err) {
      console.error(err);
      setError('Failed to generate analysis. Please ensure your API key is configured correctly and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            Gemini Financial Advisor
          </h2>
          <p className="text-sm text-gray-500 mt-1">Get AI-powered insights on your spending habits.</p>
        </div>
        <button
          onClick={analyzeFinances}
          disabled={loading || expenses.length === 0}
          className="flex items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze My Finances
            </>
          )}
        </button>
      </div>

      {expenses.length === 0 && !analysis && (
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
          <p className="text-gray-500">Add some expenses first to get personalized financial advice.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-inner">
          <div className="markdown-body prose prose-purple max-w-none text-sm">
            <Markdown>{analysis}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
