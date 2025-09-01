import React, { useMemo, useState } from 'react';
import { Transaction, Budget, TransactionType } from '../types';
import Card from './ui/Card';
import CategoryIcon from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';
import Button from './ui/Button';
import Input from './ui/Input';

interface BudgetPageProps {
  transactions: Transaction[];
  budgets: Budget[];
  updateBudget: (category: string, limit: number) => void;
  currency: string;
  financialGoal: number;
  updateFinancialGoal: (goal: number) => void;
}

const BudgetItem: React.FC<{
  budget: Budget;
  spent: number;
  updateBudget: (category: string, limit: number) => void;
  currency: string;
}> = ({ budget, spent, updateBudget, currency }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(budget.limit);
  const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
  const remaining = budget.limit - spent;
  
  const progressColor = progress > 100 ? 'bg-red-500' : 'bg-green-500';

  const handleUpdate = () => {
    if (newLimit !== budget.limit && newLimit >= 0) {
      updateBudget(budget.category, newLimit);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setNewLimit(budget.limit);
      setIsEditing(false);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
            <CategoryIcon category={budget.category} className="h-6 w-6 text-slate-600"/>
            <span className="font-semibold text-lg">{budget.category}</span>
        </div>
        <div className="text-right">
            <span className="font-bold text-slate-800">{formatCurrency(spent, currency)}</span>
            <span className="text-sm text-slate-500"> / </span>
            {isEditing ? (
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-24 text-right px-1 py-0 border rounded-md border-primary-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
                aria-label={`New budget limit for ${budget.category}`}
              />
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-sm text-slate-500 hover:text-primary-600 font-semibold focus:outline-none focus:underline"
                aria-label={`Current budget for ${budget.category} is ${formatCurrency(budget.limit, currency)}. Click to edit.`}
              >
                {formatCurrency(budget.limit, currency)}
              </button>
            )}
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
      </div>
      <p className={`text-sm mt-1 ${remaining < 0 ? 'text-red-600' : 'text-slate-500'}`}>
        {remaining >= 0 ? `${formatCurrency(remaining, currency)} remaining` : `${formatCurrency(Math.abs(remaining), currency)} over budget`}
      </p>
    </div>
  );
};

const SavingsCalculator: React.FC<{ currency: string }> = ({ currency }) => {
    const [income, setIncome] = useState('');
    const [housing, setHousing] = useState('');
    const [transport, setTransport] = useState('');
    const [food, setFood] = useState('');
    const [other, setOther] = useState('');

    const { totalExpenses, monthlySavings, annualSavings } = useMemo(() => {
        const numIncome = parseFloat(income) || 0;
        const expenses = [housing, transport, food, other].reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
        const savings = numIncome - expenses;
        return {
            totalExpenses: expenses,
            monthlySavings: savings,
            annualSavings: savings * 12
        };
    }, [income, housing, transport, food, other]);
    
    return (
        <Card title="Savings Calculator">
            <p className="text-sm text-slate-500 mb-6">Enter your estimated monthly income and expenses to see your savings potential.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Input id="calc-income" label="Monthly Income" type="number" placeholder="3000" value={income} onChange={(e) => setIncome(e.target.value)} />
                    <Input id="calc-housing" label="Housing" type="number" placeholder="800" value={housing} onChange={(e) => setHousing(e.target.value)} />
                    <Input id="calc-transport" label="Transportation" type="number" placeholder="250" value={transport} onChange={(e) => setTransport(e.target.value)} />
                    <Input id="calc-food" label="Food / Groceries" type="number" placeholder="400" value={food} onChange={(e) => setFood(e.target.value)} />
                    <Input id="calc-other" label="Other Expenses" type="number" placeholder="300" value={other} onChange={(e) => setOther(e.target.value)} />
                </div>
                <div className="bg-slate-50 rounded-lg p-6 flex flex-col justify-center items-center text-center">
                    <div className="space-y-6">
                        <div>
                            <p className="text-slate-500">Total Monthly Expenses</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, currency)}</p>
                        </div>
                        <div>
                            <p className="text-slate-600 font-semibold">Potential Monthly Savings</p>
                            <p className={`text-4xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(monthlySavings, currency)}</p>
                        </div>
                         <div>
                            <p className="text-slate-500">Projected Annual Savings</p>
                            <p className={`text-2xl font-bold ${annualSavings >= 0 ? 'text-primary-700' : 'text-red-600'}`}>{formatCurrency(annualSavings, currency)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const BudgetPage: React.FC<BudgetPageProps> = ({ transactions, budgets, updateBudget, currency, financialGoal, updateFinancialGoal }) => {
  const expensesByCategory = useMemo(() => {
    const expensesMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        expensesMap[t.category] = (expensesMap[t.category] || 0) + t.amount;
      });
    return expensesMap;
  }, [transactions]);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(financialGoal);

  const handleGoalUpdate = () => {
    if (goalInput >= 0 && goalInput !== financialGoal) {
        updateFinancialGoal(goalInput);
    }
    setIsEditingGoal(false);
  };
  
  const handleGoalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleGoalUpdate();
      else if (e.key === 'Escape') setIsEditingGoal(false);
  };

  const {
    projectedIncome,
    totalBudgeted,
    availableToSpend,
    surplusOrDeficit
  } = useMemo(() => {
    const today = new Date();
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const incomeLastMonth = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === TransactionType.INCOME &&
          transactionDate >= startOfPreviousMonth &&
          transactionDate <= endOfPreviousMonth
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const budgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
    const available = incomeLastMonth - financialGoal;
    const difference = available - budgeted;

    return {
      projectedIncome: incomeLastMonth,
      totalBudgeted: budgeted,
      availableToSpend: available,
      surplusOrDeficit: difference
    };
  }, [transactions, budgets, financialGoal]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Monthly Financial Plan</h1>
      <p className="text-slate-600">Set a savings goal and plan your expenses to stay on track.</p>
      
      <Card title="Your Plan Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-2">
                <h3 className="font-semibold text-slate-600">Monthly Savings Goal</h3>
                {isEditingGoal ? (
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-primary-700 mr-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value}</span>
                        <input
                            type="number"
                            value={goalInput}
                            onChange={(e) => setGoalInput(Number(e.target.value))}
                            onBlur={handleGoalUpdate}
                            onKeyDown={handleGoalKeyDown}
                            className="text-2xl font-bold text-primary-700 w-48 bg-slate-100 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
                        />
                    </div>
                ) : (
                    <button 
                        onClick={() => { setGoalInput(financialGoal); setIsEditingGoal(true); }}
                        className="text-2xl font-bold text-primary-700 hover:bg-slate-100 p-1 rounded-md transition"
                        aria-label="Edit monthly savings goal"
                    >
                        {formatCurrency(financialGoal, currency)}
                    </button>
                )}
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-500">Projected Income <em className="text-xs">(based on last month)</em></span><strong className="text-base">{formatCurrency(projectedIncome, currency)}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Savings Goal</span><strong className="text-base">- {formatCurrency(financialGoal, currency)}</strong></div>
                <hr />
                <div className="flex justify-between items-center font-bold"><span className="text-slate-600">Available to Spend</span><strong className="text-base">{formatCurrency(availableToSpend, currency)}</strong></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Total Budgeted Expenses</span><strong className="text-base">- {formatCurrency(totalBudgeted, currency)}</strong></div>
                <hr />
                <div className={`flex justify-between items-center font-bold text-lg ${surplusOrDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{surplusOrDeficit >= 0 ? 'Surplus' : 'Deficit'}</span>
                    <strong>{formatCurrency(surplusOrDeficit, currency)}</strong>
                </div>
            </div>
        </div>
        {surplusOrDeficit < 0 && <p className="mt-4 text-center text-sm p-3 bg-red-50 rounded-lg text-red-600">Your budgeted expenses are higher than your available funds. Consider reducing some category budgets to meet your savings goal.</p>}
      </Card>
      
      <SavingsCalculator currency={currency} />

      <Card title="Category Budgets">
        <p className="text-sm text-slate-500 mb-4">Click on a budget limit to edit it and adjust your plan.</p>
        <div className="divide-y divide-slate-200">
            {budgets.map(budget => (
            <BudgetItem 
                key={budget.category} 
                budget={budget} 
                spent={expensesByCategory[budget.category] || 0}
                updateBudget={updateBudget}
                currency={currency}
            />
            ))}
        </div>
        <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-lg text-slate-800">Total Budgeted</span>
            <span className="font-bold text-lg text-slate-800">{formatCurrency(totalBudgeted, currency)}</span>
        </div>
      </Card>
    </div>
  );
};

export default BudgetPage;