import React from 'react';
import { Asset, Liability } from '../types';
import CategoryIcon from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

type Item = Asset | Liability;

interface AssetLiabilityListProps {
  items: Item[];
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
  currency: string;
  type: 'asset' | 'liability';
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AssetLiabilityList: React.FC<AssetLiabilityListProps> = ({ items, onDelete, onEdit, currency, type }) => {
  const amountColor = type === 'asset' ? 'text-green-600' : 'text-red-600';
  const iconBgColor = type === 'asset' ? 'bg-green-100' : 'bg-red-100';
  const iconTextColor = type === 'asset' ? 'text-green-600' : 'text-red-600';

  if (items.length === 0) {
      return <p className="text-slate-500 text-center py-4">No {type}s added yet.</p>
  }
  
  return (
    <ul className="divide-y divide-slate-200">
      {items.map(item => (
        <li key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 group">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${iconBgColor} ${iconTextColor}`}>
              <CategoryIcon category={item.category} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{item.description}</p>
              <p className="text-sm text-slate-500">{item.category} &middot; As of {formatDate(item.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className={`font-bold text-lg ${amountColor}`}>
              {formatCurrency(item.amount, currency)}
            </p>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(item)} className="text-slate-400 hover:text-primary-600" aria-label={`Edit item: ${item.description}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                  </svg>
              </button>
              <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-600" aria-label={`Delete item: ${item.description}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AssetLiabilityList;
