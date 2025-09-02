import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Transaction, Budget, TransactionType } from '../types';
import Card from './ui/Card';
import TransactionList from './TransactionList';
import { formatCurrency } from '../utils/formatters';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, currency }) => {
  const { totalIncome, totalExpenses, balance, avgDailySpend } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let expensesThisMonth = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else {
        expenses += t.amount;
        if (new Date(t.date) >= startOfMonth) {
            expensesThisMonth += t.amount;
        }
      }
    });

    const daysInMonthSoFar = now.getDate();
    const dailySpend = daysInMonthSoFar > 0 ? expensesThisMonth / daysInMonthSoFar : 0;

    return { 
      totalIncome: income, 
      totalExpenses: expenses, 
      balance: income - expenses,
      avgDailySpend: dailySpend
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const data: { [key: string]: { income: number, expenses: number } } = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!data[month]) {
        data[month] = { income: 0, expenses: 0 };
      }
      if (t.type === TransactionType.INCOME) {
        data[month].income += t.amount;
      } else {
        data[month].expenses += t.amount;
      }
    });
    return Object.entries(data).map(([name, values]) => ({ name, ...values })).reverse();
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
          <h3 className="text-lg font-semibold text-green-100">Total Income</h3>
          <p className="text-4xl font-bold">{formatCurrency(totalIncome, currency)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-400 to-red-600 text-white">
          <h3 className="text-lg font-semibold text-red-100">Total Expenses</h3>
          <p className="text-4xl font-bold">{formatCurrency(totalExpenses, currency)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <h3 className="text-lg font-semibold text-primary-100">Current Balance</h3>
          <p className="text-4xl font-bold">{formatCurrency(balance, currency)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
          <h3 className="text-lg font-semibold text-indigo-100">Avg. Daily Spend</h3>
          <p className="text-4xl font-bold">{formatCurrency(avgDailySpend, currency)}</p>
        </Card>
      </div>
      
      <Card title="Income vs. Expenses">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value as number, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} />
              <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Recent Transactions">
        {recentTransactions.length > 0 ? (
          <TransactionList transactions={recentTransactions} currency={currency} />
        ) : (
          <p className="text-slate-500 text-center py-4">No transactions yet. Add one to get started!</p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;