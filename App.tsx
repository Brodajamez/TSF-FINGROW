import React, { useState, useMemo } from 'react';
import { Transaction, Budget, View, Record, Asset, Liability } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/Transactions';
import ExpenseTrackerPage from './components/ExpenseTrackerPage';
import BudgetPage from './components/Budget';
import AiAdvisor from './components/AiAdvisor';
import InvestmentsPage from './components/InvestmentsPage';
import NetWorthPage from './components/NetWorthPage';
import RecordsPage from './components/RecordsPage';
import SettingsPage from './components/Settings';
import { EXPENSE_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [records, setRecords] = useLocalStorage<Record[]>('records', []);
  const [assets, setAssets] = useLocalStorage<Asset[]>('assets', []);
  const [liabilities, setLiabilities] = useLocalStorage<Liability[]>('liabilities', []);
  const [currency, setCurrency] = useLocalStorage<string>('currency', 'NGN');
  const [financialGoal, setFinancialGoal] = useLocalStorage<number>('financialGoal', 500);
  
  const initialBudgets: Budget[] = useMemo(() => EXPENSE_CATEGORIES.map(category => ({ category, limit: 500 })), []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', initialBudgets);

  // Transaction Management
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  // Record Management
  const addRecord = (record: Record) => {
    setRecords(prev => [record, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateRecord = (updatedRecord: Record) => {
    setRecords(prev =>
      prev.map(r => (r.id === updatedRecord.id ? updatedRecord : r))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // Budget Management
  const updateBudget = (category: string, limit: number) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit } : b));
  };

  // Asset Management
  const addAsset = (asset: Asset) => {
    setAssets(prev => [asset, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prev =>
      prev.map(a => (a.id === updatedAsset.id ? updatedAsset : a))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Liability Management
  const addLiability = (liability: Liability) => {
    setLiabilities(prev => [liability, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateLiability = (updatedLiability: Liability) => {
    setLiabilities(prev =>
      prev.map(l => (l.id === updatedLiability.id ? updatedLiability : l))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const deleteLiability = (id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard transactions={transactions} budgets={budgets} currency={currency} />;
      case View.TRANSACTIONS:
        return <TransactionsPage transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} currency={currency} />;
      case View.EXPENSE_TRACKER:
        return <ExpenseTrackerPage transactions={transactions} currency={currency} />;
      case View.BUDGET:
        return <BudgetPage transactions={transactions} budgets={budgets} updateBudget={updateBudget} currency={currency} financialGoal={financialGoal} updateFinancialGoal={setFinancialGoal} />;
      case View.ADVISOR:
        return <AiAdvisor transactions={transactions} />;
      case View.INVESTMENTS:
        return <InvestmentsPage />;
      case View.NET_WORTH:
        return <NetWorthPage
          assets={assets}
          liabilities={liabilities}
          addAsset={addAsset}
          updateAsset={updateAsset}
          deleteAsset={deleteAsset}
          addLiability={addLiability}
          updateLiability={updateLiability}
          deleteLiability={deleteLiability}
          currency={currency}
        />;
      case View.RECORDS:
        return <RecordsPage records={records} addRecord={addRecord} updateRecord={updateRecord} deleteRecord={deleteRecord} />;
      case View.SETTINGS:
        return <SettingsPage currency={currency} setCurrency={setCurrency} />;
      default:
        return <Dashboard transactions={transactions} budgets={budgets} currency={currency} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
