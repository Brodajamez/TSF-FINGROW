import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import Card from './ui/Card';
import Select from './ui/Select';
import TransactionList from './TransactionList';
import { formatCurrency } from '../utils/formatters';
import Input from './ui/Input';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface ExpenseTrackerPageProps {
  transactions: Transaction[];
  currency: string;
}

type DateRange = 'this-month' | 'last-month' | 'last-3-months' | 'all-time';

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1', '#075985', '#0c4a6e'];

const ExpenseTrackerPage: React.FC<ExpenseTrackerPageProps> = ({ transactions, currency }) => {
  const [dateRange, setDateRange] = useState<DateRange>('this-month');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = useMemo(() => {
    const allExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    if (dateRange === 'all-time') {
      return allExpenses;
    }

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    if (dateRange === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateRange === 'last-3-months') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    }

    return allExpenses.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });
  }, [transactions, dateRange]);
  
  const searchedExpenses = useMemo(() => {
    return filteredExpenses.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredExpenses, searchQuery]);


  const { totalExpenses, expenseCount, averageExpense, categoryData, dailyData } = useMemo(() => {
    let total = 0;
    const categoryMap: { [key: string]: number } = {};
    const dailyMap: { [key: string]: number } = {};

    for (const t of filteredExpenses) {
      total += t.amount;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      
      const day = new Date(t.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
      dailyMap[day] = (dailyMap[day] || 0) + t.amount;
    }

    const catData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    
    const dayData = Object.entries(dailyMap)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalExpenses: total,
      expenseCount: filteredExpenses.length,
      averageExpense: filteredExpenses.length > 0 ? total / filteredExpenses.length : 0,
      categoryData: catData,
      dailyData: dayData,
    };
  }, [filteredExpenses]);


  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Expense Tracker</h1>
        <div className="w-48">
          <Select 
            id="date-range" 
            label="Date Range" 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="all-time">All Time</option>
          </Select>
        </div>
      </div>
      
      {filteredExpenses.length === 0 ? (
        <Card>
            <p className="text-center text-slate-500 py-12">No expenses recorded for this period.</p>
        </Card>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-slate-500">Total Expenses</h3>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses, currency)}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-slate-500">Transactions</h3>
                    <p className="text-3xl font-bold text-slate-800">{expenseCount}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-slate-500">Average Expense</h3>
                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(averageExpense, currency)}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Spending by Category" className="lg:col-span-2">
                    <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Daily Spending Trend" className="lg:col-span-3">
                    <div className="h-80 w-full">
                         <ResponsiveContainer>
                            <LineChart data={dailyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} />
                                <YAxis tickFormatter={(value) => formatCurrency(value as number, currency, { maximumFractionDigits: 0 })} />
                                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                <Line type="monotone" dataKey="amount" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Expense History">
                <div className="max-w-md mb-4">
                    <Input
                        id="search-expenses"
                        label="Filter history by description"
                        type="search"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {searchedExpenses.length > 0 ? (
                  <TransactionList transactions={searchedExpenses} currency={currency} />
                ) : (
                  <p className="text-slate-500 text-center py-4">No expenses match your search.</p>
                )}
            </Card>
        </>
      )}
    </div>
  );
};

export default ExpenseTrackerPage;