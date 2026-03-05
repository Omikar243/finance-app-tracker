import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, FileText, CheckCircle, AlertCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { Expense } from '../types';

// Use unpkg for the worker to avoid Vite bundling issues with pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface StatementUploaderProps {
  expenses: Expense[];
  onUploadSuccess: (expenses: Omit<Expense, 'id'>[]) => void;
  onDeleteSourceFile: (fileName: string) => void;
}

const sanitizeBankText = (text: string) => {
  let sanitized = text;
  // Redact UPI IDs (e.g., name@bank)
  sanitized = sanitized.replace(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/g, '[UPI_ID]');
  // Redact Card Numbers (12-19 digits, possibly with spaces/dashes)
  sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[CARD_NUMBER]');
  // Redact Account Numbers (typically 9-18 digits)
  sanitized = sanitized.replace(/\b\d{9,18}\b/g, '[ACCOUNT_NUMBER]');
  // Redact long alphanumeric transaction IDs (8+ chars containing both letters and numbers)
  sanitized = sanitized.replace(/\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{8,}\b/g, '[TXN_ID]');
  // Redact phone numbers
  sanitized = sanitized.replace(/\b\d{10}\b/g, '[PHONE_NUMBER]');
  return sanitized;
};

export function StatementUploader({ expenses, onUploadSuccess, onDeleteSourceFile }: StatementUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const uploadedFiles = useMemo(() => {
    const files = new Set<string>();
    expenses.forEach(e => {
      if (e.sourceFile) files.add(e.sourceFile);
    });
    return Array.from(files);
  }, [expenses]);

  const createTasksFromFile = async (file: File) => {
    const tasks: any[][] = [];
    let rawText = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          rawText += pageText + '\n';
        }
      } catch (e: any) {
        throw new Error(`Failed to parse PDF locally: ${e.message}`);
      }
    } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      rawText = workbook.SheetNames.map(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        return `--- Sheet: ${sheetName} ---\n` + XLSX.utils.sheet_to_csv(sheet);
      }).join('\n\n');
    } else {
      rawText = await file.text();
    }

    // Sanitize the text locally before sending to Gemini
    const sanitizedText = sanitizeBankText(rawText);

    const lines = sanitizedText.split('\n');
    if (lines.length <= 50) {
      tasks.push([{ text: `File ${file.name} contents:\n${sanitizedText}` }]);
    } else {
      const header = lines.slice(0, 1).join('\n');
      for (let i = 1; i < lines.length; i += 50) {
        const chunk = lines.slice(i, i + 50).join('\n');
        if (chunk.trim()) {
          tasks.push([{ text: `File ${file.name} chunk:\n${header}\n${chunk}` }]);
        }
      }
    }
    return tasks;
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setSuccessCount(null);
    setProgress({ current: 0, total: 0 });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let allTransactions: Omit<Expense, 'id'>[] = [];
      
      const allTasks: { parts: any[], fileName: string }[] = [];
      for (const file of files) {
        const fileTasks = await createTasksFromFile(file);
        fileTasks.forEach(parts => allTasks.push({ parts, fileName: file.name }));
      }

      setProgress({ current: 0, total: allTasks.length });

      const processTask = async (parts: any[], fileName: string) => {
        parts.push({
          text: `Extract all transactions from the provided bank statement data. 
          Return a JSON array of objects.
          For each transaction:
          - amount: absolute number (positive)
          - date: YYYY-MM-DD
          - description: string
          - category: one of ['Housing', 'Food', 'Transportation', 'Utilities', 'Insurance', 'Medical', 'Savings', 'Personal', 'Entertainment', 'Salary', 'P2P Transfer', 'Other']
          - type: 'income' or 'expense'
          - sustainability: 'Low GHG', 'Medium GHG', 'High GHG', or 'N/A'. Evaluate the greenhouse gas (GHG) carbon emissions associated with the purchase. Use 'N/A' for Salary and P2P Transfers.
          - location: Extract the location (city, state, country, or specific store location) from the description. 
            CRITICAL: If the location is not explicitly stated, INFER it from the merchant name or context if possible (e.g., "Starbucks Seattle" -> "Seattle", "Uber" -> "Ride Share", "Walmart #1234" -> "Walmart Store"). 
            If it is a well-known online service (e.g., "Netflix", "Spotify", "Amazon"), set location to "Online".
            If absolutely no location can be inferred, return null or empty string.`
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  amount: { type: Type.NUMBER },
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  type: { type: Type.STRING },
                  sustainability: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ["amount", "date", "description", "category", "type", "sustainability"]
              }
            }
          }
        });

        if (response.text) {
          const extracted = JSON.parse(response.text);
          setProgress(p => ({ ...p, current: p.current + 1 }));
          return extracted.map((e: any) => ({ ...e, sourceFile: fileName }));
        }
        return [];
      };

      const batchSize = 3;
      for (let i = 0; i < allTasks.length; i += batchSize) {
        const batch = allTasks.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(task => processTask(task.parts, task.fileName)));
        allTransactions.push(...results.flat());
      }
      
      if (allTransactions.length === 0) {
        throw new Error("No transactions found in the provided files.");
      }

      onUploadSuccess(allTransactions);
      setSuccessCount(allTransactions.length);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process statements. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    }
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Import Bank Statements</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload your bank statements to automatically extract and categorize transactions.
          Supports PDF, CSV, Excel, and JSON.
        </p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">100% Private & Local Parsing</p>
          <p className="text-blue-600/80">
            Your files are parsed locally in your browser. Sensitive data like account numbers, UPI IDs, and card numbers are redacted <strong>before</strong> being sent to Google Gemini AI for categorization. Raw narrations are never shared.
          </p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <div className="text-gray-600 font-medium">Processing statements...</div>
              {progress.total > 0 && (
                <div className="w-full max-w-xs mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Extracting data</span>
                    <span>{progress.current} / {progress.total} parts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-500 mt-2">This might take a few moments.</div>
            </>
          ) : (
            <>
              <div className="p-4 bg-white rounded-full shadow-sm">
                <UploadCloud className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, CSV, XLSX, XLS, JSON up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl flex items-start border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successCount !== null && (
        <div className="mt-4 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start border border-emerald-100">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">Successfully imported {successCount} transactions!</p>
        </div>
      )}

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-md font-medium text-gray-900 mb-4">Previously Uploaded Statements</h3>
        {uploadedFiles.length > 0 ? (
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div key={file} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center text-sm text-gray-700">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  {file}
                </div>
                <button
                  onClick={() => onDeleteSourceFile(file)}
                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Erase Data
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <p className="text-sm text-gray-500">No statements have been uploaded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Files you upload will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

