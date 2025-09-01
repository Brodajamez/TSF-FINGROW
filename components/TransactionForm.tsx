import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose, transactionToEdit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    if (transactionToEdit) {
        setDescription(transactionToEdit.description);
        setAmount(String(transactionToEdit.amount));
        setType(transactionToEdit.type);
        setCategory(transactionToEdit.category);
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
    } else {
        // Reset form to default values for 'add new'
        setDescription('');
        setAmount('');
        setType(TransactionType.EXPENSE);
        setCategory(EXPENSE_CATEGORIES[0]);
        setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as TransactionType;
    setType(newType);
    setCategory(newType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
        alert("Please fill all fields");
        return;
    }

    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    });
  };
  
  const categories = type === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const submitButtonText = transactionToEdit ? 'Save Changes' : 'Add Transaction';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="description"
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        id="amount"
        label="Amount"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Select id="type" label="Type" value={type} onChange={handleTypeChange}>
        <option value={TransactionType.EXPENSE}>Expense</option>
        <option value={TransactionType.INCOME}>Income</option>
      </Select>
      <Select id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>
      <Input
        id="date"
        label="Date"
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

export default TransactionForm;