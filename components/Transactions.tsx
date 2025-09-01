import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Input from './ui/Input';

interface TransactionsPageProps {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  currency: string;
}

const generateId = () => '_' + Math.random().toString(36).substring(2, 11);

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, addTransaction, deleteTransaction, updateTransaction, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing to prevent form content from flashing during modal close animation
    setTimeout(() => setEditingTransaction(null), 300);
  };

  const handleFormSubmit = (formData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...formData, id: editingTransaction.id });
    } else {
      addTransaction({ ...formData, id: generateId() });
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
        <Button onClick={handleOpenAddModal}>Add Transaction</Button>
      </div>

      <div className="max-w-md">
          <Input
              id="search-transactions"
              label="Search by description"
              type="search"
              placeholder="e.g., Coffee, Salary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>
      
      <Card>
        {transactions.length > 0 ? (
          filteredTransactions.length > 0 ? (
            <TransactionList 
              transactions={filteredTransactions} 
              onDelete={deleteTransaction} 
              onEdit={handleOpenEditModal} 
              currency={currency} 
            />
          ) : (
            <p className="text-slate-500 text-center py-8">No transactions match your search.</p>
          )
        ) : (
          <p className="text-slate-500 text-center py-8">You haven't recorded any transactions yet.</p>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}>
        <TransactionForm 
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
          transactionToEdit={editingTransaction}
        />
      </Modal>
    </div>
  );
};

export default TransactionsPage;