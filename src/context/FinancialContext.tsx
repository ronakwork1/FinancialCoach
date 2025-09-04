import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our financial data
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Budget {
  category: string;
  budget: number;
  spent: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface VariableIncome {
  id: string;
  month: string; // YYYY-MM format
  amount: number;
  description: string;
  type: 'salary' | 'bonus' | 'freelance' | 'investment' | 'other';
}

export interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  income: {
    salary: string;
    additionalIncome: string;
    frequency: string;
  };
  variableIncome: VariableIncome[];
  expenses: {
    housing: string;
    utilities: string;
    groceries: string;
    transportation: string;
    healthcare: string;
    entertainment: string;
    other: string;
  };
  savings: {
    emergencyFund: string;
    retirement: string;
    investments: string;
    goals: string;
  };
}

// Define CSV data format for import/export
export interface CSVTransaction {
  date: string;
  merchant: string;
  category: string;
  amount: string;
}

interface FinancialContextType {
  financialData: FinancialData;
  updateIncome: (income: FinancialData['income']) => void;
  updateExpenses: (expenses: FinancialData['expenses']) => void;
  updateSavings: (savings: FinancialData['savings']) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (budget: Budget) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (goal: FinancialGoal) => void;
  deleteGoal: (id: string) => void;
  addVariableIncome: (income: Omit<VariableIncome, 'id'>) => void;
  updateVariableIncome: (income: VariableIncome) => void;
  deleteVariableIncome: (id: string) => void;
  getVariableIncomeForMonth: (month: string) => number;
  calculateFinancialHealth: () => number;
  getInsights: () => { text: string; type: 'positive' | 'warning' | 'info' }[];
  clearAllData: () => void;
  setTransactionData: (csvTransactions: CSVTransaction[]) => void;
}

// Initial default data
const initialFinancialData: FinancialData = {
  transactions: [],
  budgets: [
    { category: 'Housing', budget: 1500, spent: 0 },
    { category: 'Food', budget: 500, spent: 0 },
    { category: 'Transportation', budget: 300, spent: 0 },
    { category: 'Entertainment', budget: 200, spent: 0 },
    { category: 'Shopping', budget: 300, spent: 0 },
    { category: 'Utilities', budget: 200, spent: 0 },
  ],
  goals: [],
  income: {
    salary: '',
    additionalIncome: '',
    frequency: 'monthly',
  },
  variableIncome: [],
  expenses: {
    housing: '',
    utilities: '',
    groceries: '',
    transportation: '',
    healthcare: '',
    entertainment: '',
    other: '',
  },
  savings: {
    emergencyFund: '',
    retirement: '',
    investments: '',
    goals: '',
  },
};

// Create the context
const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Provider component
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [financialData, setFinancialData] = useState<FinancialData>(initialFinancialData);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('financialData');
    if (savedData) {
      try {
        setFinancialData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing financial data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('financialData', JSON.stringify(financialData));
  }, [financialData]);

  // Update income data
  const updateIncome = (income: FinancialData['income']) => {
    setFinancialData(prev => ({
      ...prev,
      income,
    }));
  };

  // Update expenses data
  const updateExpenses = (expenses: FinancialData['expenses']) => {
    setFinancialData(prev => ({
      ...prev,
      expenses,
    }));

    // Update budget spent amounts based on expenses
    updateBudgetsFromExpenses(expenses);
  };

  // Update savings data
  const updateSavings = (savings: FinancialData['savings']) => {
    setFinancialData(prev => ({
      ...prev,
      savings,
    }));
  };

  // Update budgets based on expenses
  const updateBudgetsFromExpenses = (expenses: FinancialData['expenses']) => {
    const updatedBudgets = financialData.budgets.map(budget => {
      let spent = 0;
      
      // Map expense categories to budget categories
      switch (budget.category.toLowerCase()) {
        case 'housing':
          spent = parseFloat(expenses.housing) || 0;
          break;
        case 'food':
          spent = parseFloat(expenses.groceries) || 0;
          break;
        case 'transportation':
          spent = parseFloat(expenses.transportation) || 0;
          break;
        case 'entertainment':
          spent = parseFloat(expenses.entertainment) || 0;
          break;
        case 'utilities':
          spent = parseFloat(expenses.utilities) || 0;
          break;
        case 'shopping':
          spent = parseFloat(expenses.other) || 0;
          break;
        default:
          break;
      }

      return {
        ...budget,
        spent,
      };
    });

    setFinancialData(prev => ({
      ...prev,
      budgets: updatedBudgets,
    }));
  };

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    setFinancialData(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
    }));

    // Update budgets based on new transaction
    if (transaction.type === 'expense') {
      const categoryBudget = financialData.budgets.find(
        budget => budget.category.toLowerCase() === transaction.category.toLowerCase()
      );

      if (categoryBudget) {
        updateBudget({
          ...categoryBudget,
          spent: categoryBudget.spent + transaction.amount,
        });
      }
    }
  };

  // Update an existing transaction
  const updateTransaction = (transaction: Transaction) => {
    setFinancialData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === transaction.id ? transaction : t
      ),
    }));

    // Recalculate budget spent amounts
    recalculateBudgetSpent();
  };

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    setFinancialData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));

    // Recalculate budget spent amounts
    recalculateBudgetSpent();
  };

  // Recalculate budget spent amounts based on transactions
  const recalculateBudgetSpent = () => {
    const updatedBudgets = financialData.budgets.map(budget => {
      const categoryTransactions = financialData.transactions.filter(
        t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase()
      );

      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        spent,
      };
    });

    setFinancialData(prev => ({
      ...prev,
      budgets: updatedBudgets,
    }));
  };

  // Update a budget
  const updateBudget = (budget: Budget) => {
    setFinancialData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => 
        b.category === budget.category ? budget : b
      ),
    }));
  };

  // Add a new goal
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };

    setFinancialData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  // Update an existing goal
  const updateGoal = (goal: FinancialGoal) => {
    setFinancialData(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === goal.id ? goal : g
      ),
    }));
  };

  // Delete a goal
  const deleteGoal = (id: string) => {
    setFinancialData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
    }));
  };

  // Add variable income entry
  const addVariableIncome = (income: Omit<VariableIncome, 'id'>) => {
    const newIncome = {
      ...income,
      id: Date.now().toString(),
    };

    setFinancialData(prev => ({
      ...prev,
      variableIncome: [...prev.variableIncome, newIncome],
    }));
  };

  // Update variable income entry
  const updateVariableIncome = (income: VariableIncome) => {
    setFinancialData(prev => ({
      ...prev,
      variableIncome: prev.variableIncome.map(vi =>
        vi.id === income.id ? income : vi
      ),
    }));
  };

  // Delete variable income entry
  const deleteVariableIncome = (id: string) => {
    setFinancialData(prev => ({
      ...prev,
      variableIncome: prev.variableIncome.filter(vi => vi.id !== id),
    }));
  };

  // Get total variable income for a specific month
  const getVariableIncomeForMonth = (month: string) => {
    return financialData.variableIncome
      .filter(income => income.month === month)
      .reduce((sum, income) => sum + income.amount, 0);
  };

  // Calculate financial health score (0-100)
  const calculateFinancialHealth = (): number => {
    let score = 0;
    const maxScore = 100;

    // Check if income is greater than expenses
    const totalIncome = parseFloat(financialData.income.salary) + parseFloat(financialData.income.additionalIncome || '0');
    const totalExpenses = Object.values(financialData.expenses).reduce((sum, value) => sum + parseFloat(value || '0'), 0);
    
    if (totalIncome > totalExpenses) {
      score += 25; // 25% of score comes from positive cash flow
    } else if (totalIncome > 0) {
      score += 10; // Some income, but not enough
    }

    // Check emergency fund
    const emergencyFund = parseFloat(financialData.savings.emergencyFund || '0');
    if (emergencyFund > totalExpenses * 6) {
      score += 25; // 6+ months of expenses in emergency fund
    } else if (emergencyFund > totalExpenses * 3) {
      score += 20; // 3+ months of expenses
    } else if (emergencyFund > totalExpenses) {
      score += 15; // 1+ month of expenses
    } else if (emergencyFund > 0) {
      score += 5; // Some emergency fund
    }

    // Check retirement savings
    const retirement = parseFloat(financialData.savings.retirement || '0');
    if (retirement > totalIncome * 5) {
      score += 25; // Significant retirement savings
    } else if (retirement > totalIncome * 2) {
      score += 20;
    } else if (retirement > totalIncome) {
      score += 15;
    } else if (retirement > 0) {
      score += 5;
    }

    // Check budget adherence
    const budgetsOverLimit = financialData.budgets.filter(budget => budget.spent > budget.budget).length;
    const budgetScore = 25 * (1 - (budgetsOverLimit / financialData.budgets.length));
    score += budgetScore;

    return Math.min(Math.round(score), maxScore);
  };

  // Generate AI-style insights based on financial data
  const getInsights = () => {
    const insights: { text: string; type: 'positive' | 'warning' | 'info' }[] = [];
    
    // Check budget adherence
    financialData.budgets.forEach(budget => {
      const percentUsed = (budget.spent / budget.budget) * 100;
      if (percentUsed > 90) {
        insights.push({
          text: `You've used ${Math.round(percentUsed)}% of your ${budget.category} budget`,
          type: 'warning'
        });
      }
    });

    // Check emergency fund
    const totalExpenses = Object.values(financialData.expenses).reduce((sum, value) => sum + parseFloat(value || '0'), 0);
    const emergencyFund = parseFloat(financialData.savings.emergencyFund || '0');
    if (emergencyFund < totalExpenses * 3) {
      insights.push({
        text: 'Your emergency fund is below the recommended 3-month minimum',
        type: 'warning'
      });
    } else if (emergencyFund > totalExpenses * 6) {
      insights.push({
        text: 'Great job! Your emergency fund exceeds the 6-month recommendation',
        type: 'positive'
      });
    }

    // Check savings rate
    const totalIncome = parseFloat(financialData.income.salary) + parseFloat(financialData.income.additionalIncome || '0');
    const savingsRate = (totalIncome - totalExpenses) / totalIncome * 100;
    if (savingsRate > 20) {
      insights.push({
        text: `Excellent! Your savings rate is ${Math.round(savingsRate)}%, above the recommended 20%`,
        type: 'positive'
      });
    } else if (savingsRate < 10 && savingsRate > 0) {
      insights.push({
        text: `Your savings rate is ${Math.round(savingsRate)}%, below the recommended 20%`,
        type: 'warning'
      });
    }

    // Add general info insight if no specific insights
    if (insights.length === 0) {
      insights.push({
        text: 'Enter more financial data to receive personalized insights',
        type: 'info'
      });
    }

    return insights;
  };

  // Clear all financial data
  const clearAllData = () => {
    setFinancialData(initialFinancialData);
    localStorage.removeItem('financialData');
  };

  // Import transaction data from CSV
  const setTransactionData = (csvTransactions: CSVTransaction[]) => {
    // Convert CSV transactions to our internal Transaction format
    const transactions: Transaction[] = csvTransactions.map((csvTx) => {
      const amount = parseFloat(csvTx.amount);
      const isIncome = csvTx.category.toLowerCase() === 'income';
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        date: csvTx.date,
        amount: amount,
        category: csvTx.category,
        description: csvTx.merchant,
        type: isIncome ? 'income' : 'expense'
      };
    });

    // Update transactions in state
    setFinancialData(prev => ({
      ...prev,
      transactions: [...transactions]
    }));

    // Calculate budget data from transactions
    const categoryTotals: Record<string, number> = {};
    
    // Group non-income transactions by category
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = 0;
        }
        categoryTotals[tx.category] += tx.amount;
      }
    });

    // Update budgets with new spent amounts
    const updatedBudgets = financialData.budgets.map(budget => {
      const categorySpent = categoryTotals[budget.category] || 0;
      return {
        ...budget,
        spent: categorySpent,
        // Set a reasonable budget based on spending
        budget: Math.max(budget.budget, Math.ceil(categorySpent * 1.1 / 100) * 100)
      };
    });

    // Update budgets in state
    setFinancialData(prev => ({
      ...prev,
      budgets: updatedBudgets
    }));
  };

  return (
    <FinancialContext.Provider
      value={{
        financialData,
        updateIncome,
        updateExpenses,
        updateSavings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addVariableIncome,
        updateVariableIncome,
        deleteVariableIncome,
        getVariableIncomeForMonth,
        calculateFinancialHealth,
        getInsights,
        clearAllData,
        setTransactionData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

// Custom hook to use the financial context
export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
