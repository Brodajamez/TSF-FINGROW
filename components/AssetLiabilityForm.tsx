import React, { useState, useEffect } from 'react';
import { Asset, Liability } from '../types';
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '../constants';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

type Item = Asset | Liability;

interface AssetLiabilityFormProps {
  onSubmit: (item: Omit<Item, 'id'>) => void;
  onClose: () => void;
  itemToEdit?: Item | null;
  type: 'asset' | 'liability';
}

const AssetLiabilityForm: React.FC<AssetLiabilityFormProps> = ({ onSubmit, onClose, itemToEdit, type }) => {
  const categories = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    if (itemToEdit) {
        setDescription(itemToEdit.description);
        setAmount(String(itemToEdit.amount));
        setCategory(itemToEdit.category);
        setDate(new Date(itemToEdit.date).toISOString().split('T')[0]);
    } else {
        setDescription('');
        setAmount('');
        setCategory(categories[0]);
        setDate(new Date().toISOString().split('T')[0]);
    }
  }, [itemToEdit, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
        alert("Please fill all fields");
        return;
    }

    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      date,
    });
  };
  
  const titleCaseType = type.charAt(0).toUpperCase() + type.slice(1);
  const submitButtonText = itemToEdit ? `Save Changes` : `Add ${titleCaseType}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="description"
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        placeholder={type === 'asset' ? 'e.g., Savings Account' : 'e.g., Student Loan'}
      />
      <Input
        id="amount"
        label="Current Value / Amount Owed"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Select id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>
      <Input
        id="date"
        label="As of Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{submitButtonText}</Button>
      </div>
    </form>
  );
};

export default AssetLiabilityForm;
