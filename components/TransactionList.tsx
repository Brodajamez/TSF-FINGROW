import React from 'react';
import { Transaction, TransactionType } from '../types';
import CategoryIcon from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  currency: string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, currency }) => {
  return (
    <ul className="divide-y divide-slate-200">
      {transactions.map(t => (
        <li key={t.id} className="py-4 flex items-center justify-between hover:bg-slate-50 -mx-6 px-6 group">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <CategoryIcon category={t.category} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t.description}</p>
              <p className="text-sm text-slate-500">{t.category} &middot; {formatDate(t.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount, currency)}
            </p>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                  <button onClick={() => onEdit(t)} className="text-slate-400 hover:text-primary-600" aria-label={`Edit transaction: ${t.description}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                      </svg>
                  </button>
              )}
              {onDelete && (
                  <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-600" aria-label={`Delete transaction: ${t.description}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                  </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;