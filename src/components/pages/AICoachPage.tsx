import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import PieChartIcon from '@mui/icons-material/PieChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useFinancial } from '../../context/FinancialContext';

const AICoachPage: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  const [showDetailedAdvice, setShowDetailedAdvice] = useState(false);
  const [showSavingsPlanModal, setShowSavingsPlanModal] = useState(false);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  
  // Handle applying savings plan
  const handleApplySavingsPlan = () => {
    setFeedback({
      message: "Savings plan applied successfully! Your goals have been updated.",
      type: "success"
    });
    setShowSavingsPlanModal(false);
    
    // In a real app, this would update the financial data in the context
    setTimeout(() => setFeedback(null), 5000); // Clear feedback after 5 seconds
  };
  
  // Handle adding new goal
  const handleAddNewGoal = () => {
    setFeedback({
      message: "New goal creation feature will be available in the next update.",
      type: "info"
    });
    
    setTimeout(() => setFeedback(null), 5000); // Clear feedback after 5 seconds
  };
  
  // Handle updating goals
  const handleUpdateGoals = () => {
    setFeedback({
      message: "Goals updated successfully based on your latest financial data.",
      type: "success"
    });
    
    setTimeout(() => setFeedback(null), 5000); // Clear feedback after 5 seconds
  };
  
  // Generate automatic savings plan based on financial data
  const automaticSavingsPlan = useMemo(() => {
    // Calculate monthly income
    const monthlyIncome = parseFloat(financialData.income.salary) + 
                          parseFloat(financialData.income.additionalIncome || '0');
    
    // Calculate monthly expenses (use recent spending or expense data)
    const monthlyExpenses = Object.values(financialData.expenses)
      .reduce((sum, expense) => sum + parseFloat(expense || '0'), 0);
    
    // Calculate available amount for savings (income - expenses)
    const availableForSavings = Math.max(0, monthlyIncome - monthlyExpenses);
    
    // If no real data available, provide reasonable defaults
    if (availableForSavings === 0 || isNaN(availableForSavings)) {
      return {
        monthlyIncome: 4000, // Sample income
        monthlyExpenses: 3000, // Sample expenses
        availableForSavings: 1000, // Sample available for savings
        recommendedSavings: 800, // Sample recommended savings
        emergencyFundTarget: 18000, // 6 months of expenses
        emergencyFundMonthly: 300, // Monthly contribution to emergency fund
        retirementMonthly: 400, // Monthly contribution to retirement
        shortTermGoalsMonthly: 100, // Monthly contribution to short-term goals
        debtPaymentMonthly: 0, // Monthly extra debt payment
        savingsRate: 20, // Savings rate as percentage of income
        monthsToEmergencyFund: 60, // Months to fully funded emergency fund
        savingsAllocation: [
          { name: 'Emergency Fund', percentage: 37.5, amount: 300 },
          { name: 'Retirement', percentage: 50, amount: 400 },
          { name: 'Short-term Goals', percentage: 12.5, amount: 100 }
        ]
      };
    }
    
    // Calculate recommended savings (20-30% of income is ideal)
    const idealSavingsRate = 0.2; // 20% savings rate
    const recommendedSavings = monthlyIncome * idealSavingsRate;
    const actualSavingsRate = availableForSavings > 0 ? 
      Math.min(recommendedSavings, availableForSavings) / monthlyIncome * 100 : 0;
    
    // Calculate emergency fund target (3-6 months of expenses)
    const emergencyFundTarget = monthlyExpenses * 6;
    const currentEmergencyFund = parseFloat(financialData.savings.emergencyFund || '0');
    const emergencyFundGap = Math.max(0, emergencyFundTarget - currentEmergencyFund);
    
    // Calculate retirement savings
    const currentRetirementSavings = parseFloat(financialData.savings.retirement || '0');
    
    // Calculate debt payments
    // (In a real app, you would get this from a debt section in financialData)
    const debtPayment = 0; // Placeholder
    
    // Allocate available savings
    let emergencyFundMonthly = 0;
    let retirementMonthly = 0;
    let shortTermGoalsMonthly = 0;
    let debtPaymentMonthly = 0;
    
    // Available amount for allocation
    const toAllocate = Math.min(availableForSavings, recommendedSavings);
    
    // Prioritize emergency fund if it's not fully funded
    if (emergencyFundGap > 0) {
      // Allocate 50% to emergency fund until it's fully funded
      emergencyFundMonthly = toAllocate * 0.5;
    }
    
    // Allocate to retirement (at least 30% of savings)
    retirementMonthly = toAllocate * (emergencyFundGap > 0 ? 0.3 : 0.6);
    
    // Allocate to short-term goals (at least 10% of savings)
    shortTermGoalsMonthly = toAllocate * (emergencyFundGap > 0 ? 0.1 : 0.3);
    
    // Allocate to extra debt payment if there's still money left
    debtPaymentMonthly = toAllocate * (emergencyFundGap > 0 ? 0.1 : 0.1);
    
    // Calculate months to fully funded emergency fund
    const monthsToEmergencyFund = emergencyFundGap > 0 ? 
      Math.ceil(emergencyFundGap / emergencyFundMonthly) : 0;
    
    // Create savings allocation array for visualization
    const savingsAllocation = [
      { 
        name: 'Emergency Fund', 
        percentage: (emergencyFundMonthly / toAllocate) * 100,
        amount: emergencyFundMonthly
      },
      { 
        name: 'Retirement', 
        percentage: (retirementMonthly / toAllocate) * 100,
        amount: retirementMonthly
      },
      { 
        name: 'Short-term Goals', 
        percentage: (shortTermGoalsMonthly / toAllocate) * 100,
        amount: shortTermGoalsMonthly
      }
    ];
    
    if (debtPaymentMonthly > 0) {
      savingsAllocation.push({
        name: 'Extra Debt Payment',
        percentage: (debtPaymentMonthly / toAllocate) * 100,
        amount: debtPaymentMonthly
      });
    }
    
    return {
      monthlyIncome,
      monthlyExpenses,
      availableForSavings,
      recommendedSavings,
      emergencyFundTarget,
      emergencyFundMonthly,
      retirementMonthly,
      shortTermGoalsMonthly,
      debtPaymentMonthly,
      savingsRate: actualSavingsRate,
      monthsToEmergencyFund,
      savingsAllocation
    };
  }, [financialData]);
  
  // Sample financial goals with progress for demonstration
  const financialGoals = useMemo(() => {
    // Use real goals if available, otherwise use sample goals
    if (financialData.goals && financialData.goals.length > 0) {
      return financialData.goals;
    }
    
    // Calculate realistic goals based on financial data
    const monthlyIncome = parseFloat(financialData.income.salary) + 
                          parseFloat(financialData.income.additionalIncome || '0');
    
    // If we have income data, use it to create realistic goals
    if (monthlyIncome > 0) {
      const emergencyFundTarget = automaticSavingsPlan.emergencyFundTarget;
      const currentEmergencyFund = parseFloat(financialData.savings.emergencyFund || '0');
      
      return [
        {
          id: 'goal1',
          name: 'Emergency Fund',
          targetAmount: emergencyFundTarget,
          currentAmount: currentEmergencyFund,
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + automaticSavingsPlan.monthsToEmergencyFund)).toISOString(),
        },
        {
          id: 'goal2',
          name: 'New Car Down Payment',
          targetAmount: monthlyIncome * 3, // 3 months of income for car down payment
          currentAmount: parseFloat(financialData.savings.goals || '0') * 0.5, // Assume 50% of goals savings is for car
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString(),
        },
        {
          id: 'goal3',
          name: 'Vacation Fund',
          targetAmount: monthlyIncome * 0.75, // 75% of monthly income for vacation
          currentAmount: parseFloat(financialData.savings.goals || '0') * 0.3, // Assume 30% of goals savings is for vacation
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        }
      ];
    }
    
    // Sample goals for demonstration if no income data
    return [
      {
        id: 'goal1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 3500,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString(),
      },
      {
        id: 'goal2',
        name: 'New Car Down Payment',
        targetAmount: 5000,
        currentAmount: 2200,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
      },
      {
        id: 'goal3',
        name: 'Vacation Fund',
        targetAmount: 3000,
        currentAmount: 750,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 8)).toISOString(),
      }
    ];
  }, [financialData, automaticSavingsPlan]);

  // Get current month and year (stable reference)
  const currentDateInfo = useMemo(() => {
    const date = new Date();
    return {
      date,
      month: date.getMonth(),
      year: date.getFullYear(),
      day: date.getDate()
    };
  }, []); // Empty dependency array means this only runs once

  const { date: currentDate, month: currentMonth, year: currentYear } = currentDateInfo;

  // Calculate spending by category for last 30 days (based on most recent transaction)
  const recentSpending = useMemo(() => {
    const spending: Record<string, number> = {};

    // Check if there are any transactions
    if (!financialData.transactions || financialData.transactions.length === 0) {
      // Return sample data for demonstration if no transactions exist
      return {
        'Housing': 950,
        'Food': 275,
        'Transport': 220,
        'Shopping': 350,
        'Subscriptions': 150,
        'Healthcare': 325
      };
    }

    // Find the most recent transaction date
    let mostRecentDate: Date | null = null;
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date);
        if (!mostRecentDate || txDate > mostRecentDate) {
          mostRecentDate = txDate;
        }
      }
    });

    // If no transactions, use today as fallback
    const referenceDate = mostRecentDate || new Date();
    const thirtyDaysAgo = new Date(referenceDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('AI Coach Debug - Most recent transaction date:', mostRecentDate);
    console.log('AI Coach Debug - Reference date for 30-day period:', referenceDate);
    console.log('AI Coach Debug - Thirty days ago from reference:', thirtyDaysAgo);

    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date);
        if (txDate >= thirtyDaysAgo && txDate <= referenceDate) {
          spending[tx.category] = (spending[tx.category] || 0) + Math.abs(tx.amount);
          console.log('AI Coach Debug - Including transaction:', tx.category, tx.amount, txDate);
        }
      }
    });

    console.log('AI Coach Debug - Final spending calculation:', spending);
    return spending;
  }, [financialData.transactions]);

  // Calculate total recent spending (last 30 days)
  const totalRecentSpending = useMemo(() => {
    const values = Object.values(recentSpending);
    return values.length > 0 ? values.reduce((sum, amount) => sum + amount, 0) : 0;
  }, [recentSpending]);

  // Calculate average monthly spending from last 3 months
  const averageMonthlySpending = useMemo(() => {
    // Check if there are any transactions
    if (!financialData.transactions || financialData.transactions.length === 0) {
      // Return a reasonable sample value if no transactions exist
      return 2270; // Sum of the sample spending categories
    }

    const monthlyTotals: number[] = [];

    // Get last 3 months
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      let monthlyTotal = 0;

      financialData.transactions.forEach(tx => {
        if (tx.type === 'expense') {
          const txDate = new Date(tx.date);
          if (txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear()) {
            monthlyTotal += Math.abs(tx.amount);
          }
        }
      });

      monthlyTotals.push(monthlyTotal);
    }

    const total = monthlyTotals.reduce((sum, amount) => sum + amount, 0);
    return monthlyTotals.length > 0 ? total / monthlyTotals.length : 0;
  }, [financialData.transactions, currentDateInfo]);

  // Project monthly spending based on recent 30-day average and spending trends
  const projectedSpending = useMemo(() => {
    // Calculate daily average from recent spending
    const dailyAverage = totalRecentSpending / 30;
    // Project for a full month (30 days)
    const baseProjection = dailyAverage * 30;
    
    // If no transactions, return sample projections
    if (!financialData.transactions || financialData.transactions.length === 0) {
      return {
        currentMonth: baseProjection || 2270,
        nextMonth: (baseProjection || 2270) * 1.05,
        threeMonths: (baseProjection || 2270) * 1.1,
        sixMonths: (baseProjection || 2270) * 1.15,
        categories: {
          'Housing': { current: 950, projected: 950 },
          'Food': { current: 275, projected: 290 },
          'Transport': { current: 220, projected: 235 },
          'Shopping': { current: 350, projected: 380 },
          'Subscriptions': { current: 150, projected: 165 },
          'Healthcare': { current: 325, projected: 325 }
        }
      };
    }
    
    // Calculate spending growth rate from past transactions
    const monthlyTotals: Record<string, number> = {};
    let monthsWithData = 0;
    
    // Group transactions by month
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
          monthsWithData++;
        }
        
        monthlyTotals[monthKey] += Math.abs(tx.amount);
      }
    });
    
    // Calculate month-over-month growth rate if we have at least 2 months of data
    let growthRate = 0;
    if (monthsWithData >= 2) {
      const sortedMonths = Object.keys(monthlyTotals).sort();
      const recentMonths = sortedMonths.slice(-Math.min(3, sortedMonths.length));
      
      if (recentMonths.length >= 2) {
        const oldestMonth = recentMonths[0];
        const newestMonth = recentMonths[recentMonths.length - 1];
        
        const oldestSpending = monthlyTotals[oldestMonth];
        const newestSpending = monthlyTotals[newestMonth];
        
        // Monthly growth rate
        growthRate = (newestSpending - oldestSpending) / oldestSpending / recentMonths.length;
        
        // Cap growth rate to reasonable bounds
        growthRate = Math.max(Math.min(growthRate, 0.1), -0.1);
      }
    } else {
      // Default modest growth if not enough data
      growthRate = 0.02;
    }
    
    // Project category spending
    const categoryProjections: Record<string, { current: number, projected: number }> = {};
    
    Object.entries(recentSpending).forEach(([category, amount]) => {
      // Apply category-specific growth rates based on patterns
      let categoryGrowthRate = growthRate;
      
      // Adjust growth rates for specific categories
      if (category === 'Subscriptions') {
        // Subscriptions tend to be stable
        categoryGrowthRate = Math.max(0, growthRate * 0.5);
      } else if (category === 'Shopping' || category === 'Dining') {
        // Discretionary spending tends to fluctuate more
        categoryGrowthRate = growthRate * 1.5;
      } else if (category === 'Housing' || category === 'Utilities') {
        // Essential fixed expenses tend to be stable
        categoryGrowthRate = Math.max(0, growthRate * 0.3);
      }
      
      categoryProjections[category] = {
        current: amount,
        projected: amount * (1 + categoryGrowthRate)
      };
    });
    
    return {
      currentMonth: baseProjection,
      nextMonth: baseProjection * (1 + growthRate),
      threeMonths: baseProjection * Math.pow(1 + growthRate, 3),
      sixMonths: baseProjection * Math.pow(1 + growthRate, 6),
      categories: categoryProjections
    };
  }, [financialData.transactions, totalRecentSpending, recentSpending]);
  
  // Get the simple projected monthly spending for backward compatibility
  const projectedMonthlySpending = projectedSpending.currentMonth;

  // Detect money leaks (small recurring expenses) with advanced pattern detection
  const moneyLeaks = useMemo(() => {
    const leaks: Array<{
      category: string;
      amount: number;
      frequency: string;
      monthlyCost: number;
      yearlyCost: number;
      description: string;
      action: string;
      severity: 'high' | 'medium' | 'low';
      icon?: React.ReactElement;
    }> = [];

    // If no transactions, provide sample insights
    if (!financialData.transactions || financialData.transactions.length === 0) {
      return [
        {
          category: 'Sample: Coffee Habits',
          amount: 120,
          frequency: 'Daily',
          monthlyCost: 120,
          yearlyCost: 1440,
          description: 'Daily coffee purchases add up to $120/month, which is 5% of your monthly spending.',
          action: 'Consider brewing at home to save $80 monthly or $960 annually.',
          severity: 'medium',
          icon: <LocalCafeIcon />
        },
        {
          category: 'Sample: Subscription Overload',
          amount: 85,
          frequency: 'Monthly',
          monthlyCost: 85,
          yearlyCost: 1020,
          description: 'You have multiple overlapping streaming services that could be consolidated.',
          action: 'Rotate subscriptions monthly instead of keeping all active at once.',
          severity: 'low',
          icon: <AttachMoneyIcon />
        },
        {
          category: 'Sample: Ride-sharing',
          amount: 225,
          frequency: 'Weekly',
          monthlyCost: 225,
          yearlyCost: 2700,
          description: 'Frequent ride-sharing services are costing you significantly more than public transit.',
          action: 'Use public transportation for regular commutes to save $150/month.',
          severity: 'high',
          icon: <DirectionsCarIcon />
        }
      ];
    }

    // Calculate total monthly income and spending for percentage comparisons
    const monthlyIncome = parseFloat(financialData.income.salary) + 
                          parseFloat(financialData.income.additionalIncome || '0');
    const monthlySpending = totalRecentSpending;
    
    // Advanced pattern detection: Analyze transaction frequency and amounts
    
    // 1. Coffee/Dining comparison with income percentage analysis
    const coffeeSpending = recentSpending['Coffee'] || 0;
    const diningSpending = recentSpending['Dining'] || recentSpending['Food'] || 0;
    const coffeePercentOfIncome = monthlyIncome > 0 ? (coffeeSpending / monthlyIncome) * 100 : 0;
    const coffeePercentOfSpending = monthlySpending > 0 ? (coffeeSpending / monthlySpending) * 100 : 0;

    if ((coffeeSpending > 50 && coffeePercentOfSpending > 3) || 
        (coffeeSpending > diningSpending && coffeeSpending > 50)) {
      leaks.push({
        category: 'Coffee Spending',
        amount: coffeeSpending,
        frequency: 'Daily',
        monthlyCost: coffeeSpending,
        yearlyCost: coffeeSpending * 12,
        description: `You're spending $${coffeeSpending.toFixed(0)} on coffee (${coffeePercentOfSpending.toFixed(1)}% of monthly spending), ${coffeeSpending > diningSpending ? 'more than you spend on dining out' : 'a significant discretionary expense'}.`,
        action: 'Make coffee at home 3-4 days a week to save $75-100 monthly.',
        severity: coffeePercentOfSpending > 5 ? 'high' : 'medium',
        icon: <LocalCafeIcon />
      });
    }

    // 2. Subscription analysis with overlap detection
    const subscriptionSpending = recentSpending['Subscriptions'] || 0;
    const subscriptionPercentOfSpending = monthlySpending > 0 ? (subscriptionSpending / monthlySpending) * 100 : 0;
    
    if (subscriptionSpending > 0) {
      // Detect if subscriptions are a significant portion of spending
      const severity = subscriptionPercentOfSpending > 8 ? 'high' : 
                       subscriptionPercentOfSpending > 5 ? 'medium' : 'low';
      
      leaks.push({
        category: 'Subscription Audit',
        amount: subscriptionSpending,
        frequency: 'Monthly',
        monthlyCost: subscriptionSpending,
        yearlyCost: subscriptionSpending * 12,
        description: `Subscriptions account for ${subscriptionPercentOfSpending.toFixed(1)}% of your monthly spending at $${subscriptionSpending.toFixed(0)}/month.`,
        action: 'Audit all subscriptions and cancel unused services to save up to 50% on this category.',
        severity,
        icon: <AttachMoneyIcon />
      });
    }

    // 3. Transportation analysis with alternative options
    const transportSpending = recentSpending['Transport'] || recentSpending['Transportation'] || 0;
    const transportPercentOfSpending = monthlySpending > 0 ? (transportSpending / monthlySpending) * 100 : 0;
    
    if (transportSpending > 100 && transportPercentOfSpending > 8) {
      leaks.push({
        category: 'Transportation Optimization',
        amount: transportSpending,
        frequency: 'Weekly',
        monthlyCost: transportSpending,
        yearlyCost: transportSpending * 12,
        description: `Transportation costs account for ${transportPercentOfSpending.toFixed(1)}% of your spending at $${transportSpending.toFixed(0)}/month.`,
        action: 'Consider carpooling, public transit, or remote work options to reduce costs by 30-40%.',
        severity: transportPercentOfSpending > 15 ? 'high' : 'medium',
        icon: <DirectionsCarIcon />
      });
    }
    
    // 4. Detect frequent small purchases that add up
    const smallPurchaseCategories = ['Shopping', 'Entertainment', 'Dining'];
    let smallPurchasesTotal = 0;
    
    smallPurchaseCategories.forEach(category => {
      smallPurchasesTotal += recentSpending[category] || 0;
    });
    
    const smallPurchasesPercentOfSpending = monthlySpending > 0 ? (smallPurchasesTotal / monthlySpending) * 100 : 0;
    
    if (smallPurchasesTotal > 200 && smallPurchasesPercentOfSpending > 15) {
      leaks.push({
        category: 'Small Purchase Accumulation',
        amount: smallPurchasesTotal,
        frequency: 'Frequent',
        monthlyCost: smallPurchasesTotal,
        yearlyCost: smallPurchasesTotal * 12,
        description: `Small discretionary purchases total $${smallPurchasesTotal.toFixed(0)}/month (${smallPurchasesPercentOfSpending.toFixed(1)}% of spending).`,
        action: 'Implement a 24-hour rule before making non-essential purchases to reduce impulse spending.',
        severity: smallPurchasesPercentOfSpending > 25 ? 'high' : 'medium',
        icon: <ShoppingCartIcon />
      });
    }
    
    // 5. Housing cost analysis
    const housingSpending = recentSpending['Housing'] || recentSpending['Rent'] || recentSpending['Mortgage'] || 0;
    const housingPercentOfIncome = monthlyIncome > 0 ? (housingSpending / monthlyIncome) * 100 : 0;
    
    if (housingPercentOfIncome > 35) {
      leaks.push({
        category: 'Housing Cost Burden',
        amount: housingSpending,
        frequency: 'Monthly',
        monthlyCost: housingSpending,
        yearlyCost: housingSpending * 12,
        description: `Housing costs are ${housingPercentOfIncome.toFixed(1)}% of your income, above the recommended 30%.`,
        action: 'Consider roommates, negotiating rent, or relocating to reduce this major expense.',
        severity: housingPercentOfIncome > 40 ? 'high' : 'medium',
        icon: <HomeIcon />
      });
    }
    
    // 6. Detect potential forgotten subscriptions (very small amounts)
    const transactions = financialData.transactions || [];
    const smallRecurringCharges = transactions
      .filter(tx => tx.type === 'expense' && tx.amount < 20 && tx.amount > 0)
      .reduce((acc, tx) => {
        const key = `${tx.description}-${tx.amount.toFixed(2)}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const potentialForgottenSubscriptions = Object.entries(smallRecurringCharges)
      .filter(([, count]) => count >= 2)
      .map(([key]) => key.split('-')[0]);
    
    if (potentialForgottenSubscriptions.length > 0) {
      leaks.push({
        category: 'Forgotten Subscriptions',
        amount: potentialForgottenSubscriptions.length * 10, // Estimate
        frequency: 'Monthly',
        monthlyCost: potentialForgottenSubscriptions.length * 10,
        yearlyCost: potentialForgottenSubscriptions.length * 10 * 12,
        description: `Found ${potentialForgottenSubscriptions.length} potential forgotten small subscriptions.`,
        action: 'Review your bank statements for these small recurring charges and cancel if unused.',
        severity: 'medium',
        icon: <AttachMoneyIcon />
      });
    }

    return leaks;
  }, [recentSpending, financialData.transactions, financialData.income, totalRecentSpending]);

  // Generate behavior insights
  const behaviorInsights = useMemo(() => {
    const insights: Array<{
      title: string;
      description: string;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
      action: string;
      icon: React.ReactElement;
    }> = [];

    // If there's no data, provide sample insights
    if (!financialData.transactions || financialData.transactions.length === 0) {
      insights.push({
        title: 'Sample: Housing Cost Analysis',
        description: `Housing represents 40% of your monthly expenses, which is higher than the recommended 30%.`,
        confidence: 90,
        trend: 'stable',
        action: 'Consider roommates or a less expensive area when your lease ends.',
        icon: <WarningIcon />
      });

      insights.push({
        title: 'Sample: Savings Opportunity',
        description: 'Your spending is lower than usual this month, creating a great opportunity to boost savings.',
        confidence: 75,
        trend: 'down',
        action: 'Consider transferring the difference to savings or paying down debt.',
        icon: <LightbulbIcon />
      });

      return insights;
    }

    // Spending trend analysis
    const spendingChange = ((projectedMonthlySpending - averageMonthlySpending) / averageMonthlySpending) * 100;

    if (Math.abs(spendingChange) > 10 || insights.length === 0) {
      insights.push({
        title: spendingChange > 0 ? 'Spending Increase Detected' : 'Spending Decrease Detected',
        description: `Your projected spending for ${currentDate.toLocaleString('default', { month: 'long' })} is ${Math.abs(spendingChange).toFixed(0)}% ${spendingChange > 0 ? 'higher' : 'lower'} than your 3-month average of $${averageMonthlySpending.toFixed(0)}.`,
        confidence: 85,
        trend: spendingChange > 0 ? 'up' : 'down',
        action: spendingChange > 0 ? 'Review recent purchases and set category limits.' : 'Great job! Consider increasing savings rate.',
        icon: spendingChange > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />
      });
    }

    // Category dominance
    const spendingEntries = Object.entries(recentSpending);
    const topCategory = spendingEntries.length > 0 ? spendingEntries.reduce((a, b) =>
      recentSpending[a[0]] > recentSpending[b[0]] ? a : b
    ) : null;

    if (topCategory && topCategory[1] > totalRecentSpending * 0.3) {
      insights.push({
        title: 'Category Dominance',
        description: `${topCategory[0]} represents ${(topCategory[1] / totalRecentSpending * 100).toFixed(0)}% of your recent spending.`,
        confidence: 95,
        trend: 'stable',
        action: `Set a budget limit for ${topCategory[0]} and explore ways to reduce this category.`,
        icon: <WarningIcon />
      });
    }

    // Budget adherence
    const budgetOverruns = financialData.budgets.filter(budget => {
      const spent = recentSpending[budget.category] || 0;
      return spent > budget.budget;
    });

    if (budgetOverruns.length > 0) {
      insights.push({
        title: 'Budget Alert',
        description: `You're over budget in ${budgetOverruns.length} categorie${budgetOverruns.length > 1 ? 's' : ''}: ${budgetOverruns.map(b => b.category).join(', ')}.`,
        confidence: 100,
        trend: 'up',
        action: 'Immediately reduce spending in these categories or adjust your budget limits.',
        icon: <WarningIcon />
      });
    }

    // Savings opportunity
    if (totalRecentSpending < averageMonthlySpending * 0.9) {
      insights.push({
        title: 'Savings Opportunity',
        description: 'Your spending is lower than usual this month, creating a great opportunity to boost savings.',
        confidence: 75,
        trend: 'down',
        action: 'Consider transferring the difference to savings or paying down debt.',
        icon: <LightbulbIcon />
      });
    }

    return insights;
  }, [recentSpending, totalRecentSpending, projectedMonthlySpending, averageMonthlySpending, financialData.budgets, financialData.transactions]);

  // Generate personalized financial advice based on spending patterns
  const personalizedAdvice = useMemo(() => {
    const advice: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      timeframe: 'short' | 'medium' | 'long';
      steps: string[];
      icon: React.ReactElement;
    }> = [];

    // If no transactions, provide generic advice
    if (!financialData.transactions || financialData.transactions.length === 0) {
      return [
        {
          title: "Build an Emergency Fund",
          description: "An emergency fund is your financial safety net for unexpected expenses.",
          impact: "high",
          timeframe: "short",
          steps: [
            "Start with a goal of $1,000 for immediate emergencies",
            "Gradually build to 3-6 months of essential expenses",
            "Keep in a high-yield savings account for easy access"
          ],
          icon: <SavingsIcon />
        },
        {
          title: "Follow the 50/30/20 Budget Rule",
          description: "A simple framework to balance needs, wants, and financial goals.",
          impact: "high",
          timeframe: "short",
          steps: [
            "Allocate 50% of income to needs (housing, food, utilities)",
            "Limit 30% to wants (entertainment, dining out)",
            "Dedicate 20% to savings and debt repayment"
          ],
          icon: <AccountBalanceIcon />
        }
      ];
    }

    // Calculate income vs. expenses
    const monthlyIncome = parseFloat(financialData.income.salary) + 
                          parseFloat(financialData.income.additionalIncome || '0');
    
    const monthlyExpenses = Object.values(recentSpending).reduce((sum, amount) => sum + amount, 0);
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome * 100 : 0;

    // Analyze spending patterns
    const topCategories = Object.entries(recentSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    const hasHighHousing = (recentSpending['Housing'] || 0) > (monthlyIncome * 0.3);
    const hasHighTransport = (recentSpending['Transport'] || recentSpending['Transportation'] || 0) > (monthlyIncome * 0.15);
    const hasHighFood = (recentSpending['Food'] || recentSpending['Dining'] || 0) > (monthlyIncome * 0.15);
    const hasLowSavings = savingsRate < 10;
    
    // Generate advice based on patterns
    if (hasHighHousing) {
      advice.push({
        title: "Optimize Housing Costs",
        description: `Your housing expenses are ${((recentSpending['Housing'] || 0) / monthlyIncome * 100).toFixed(0)}% of your income, above the recommended 30%.`,
        impact: "high",
        timeframe: "medium",
        steps: [
          "Consider a roommate to split costs",
          "Negotiate rent at renewal time",
          "Evaluate moving to a more affordable area when possible",
          "Check if you qualify for any housing assistance programs"
        ],
        icon: <HomeIcon />
      });
    }

    if (hasHighTransport) {
      advice.push({
        title: "Reduce Transportation Expenses",
        description: `You're spending ${((recentSpending['Transport'] || recentSpending['Transportation'] || 0) / monthlyIncome * 100).toFixed(0)}% of your income on transportation.`,
        impact: "medium",
        timeframe: "short",
        steps: [
          "Use public transportation when possible",
          "Consider carpooling or ride-sharing",
          "Evaluate if you can work remotely some days",
          "Compare auto insurance rates annually"
        ],
        icon: <DirectionsCarIcon />
      });
    }

    if (hasHighFood) {
      advice.push({
        title: "Optimize Food Spending",
        description: `Your food expenses are ${((recentSpending['Food'] || recentSpending['Dining'] || 0) / monthlyIncome * 100).toFixed(0)}% of your income.`,
        impact: "medium",
        timeframe: "short",
        steps: [
          "Meal plan and prepare food at home",
          "Use grocery store loyalty programs",
          "Buy staples in bulk when on sale",
          "Limit dining out to once per week"
        ],
        icon: <RestaurantIcon />
      });
    }

    if (hasLowSavings) {
      advice.push({
        title: "Increase Your Savings Rate",
        description: `Your current savings rate is approximately ${savingsRate.toFixed(0)}%, below the recommended 15-20%.`,
        impact: "high",
        timeframe: "medium",
        steps: [
          "Set up automatic transfers to savings on payday",
          "Save any windfalls (tax refunds, bonuses)",
          "Try the 30-day rule for non-essential purchases",
          "Incrementally increase savings by 1% each month"
        ],
        icon: <SavingsIcon />
      });
    }

    // Add debt management advice if applicable
    if (monthlyExpenses > monthlyIncome) {
      advice.push({
        title: "Debt Management Strategy",
        description: "Your expenses currently exceed your income, which may lead to debt accumulation.",
        impact: "high",
        timeframe: "short",
        steps: [
          "List all debts with interest rates and minimum payments",
          "Consider the debt avalanche method (highest interest first)",
          "Contact creditors to negotiate lower rates",
          "Look into debt consolidation options"
        ],
        icon: <AttachMoneyIcon />
      });
    }

    // Always include a positive reinforcement
    if (advice.length > 0) {
      advice.push({
        title: "Track Your Progress",
        description: "Monitoring your financial progress keeps you motivated and on track.",
        impact: "medium",
        timeframe: "long",
        steps: [
          "Review your budget weekly",
          "Celebrate small financial wins",
          "Adjust your goals as your situation changes",
          "Use the AI Coach regularly for personalized insights"
        ],
        icon: <AssignmentTurnedInIcon />
      });
    }

    // If we still don't have enough advice, add general advice
    if (advice.length < 3) {
      advice.push({
        title: "Diversify Your Income",
        description: "Multiple income streams provide financial security and accelerate wealth building.",
        impact: "medium",
        timeframe: "long",
        steps: [
          "Develop a skill that can generate side income",
          "Explore passive income opportunities",
          "Consider freelance work in your field",
          "Invest in dividend-paying stocks or funds"
        ],
        icon: <BarChartIcon />
      });
    }

    return advice;
  }, [financialData, recentSpending]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      'Coffee': <LocalCafeIcon />,
      'Food': <RestaurantIcon />,
      'Dining': <RestaurantIcon />,
      'Groceries': <RestaurantIcon />,
      'Shopping': <ShoppingCartIcon />,
      'Transportation': <DirectionsCarIcon />,
      'Transport': <DirectionsCarIcon />,
      'Housing': <HomeIcon />,
      'Rent': <HomeIcon />,
      'Mortgage': <HomeIcon />,
      'Subscriptions': <AttachMoneyIcon />,
      'Healthcare': <LocalCafeIcon />
    };

    return iconMap[category] || <ShoppingCartIcon />;
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <PsychologyIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2.5rem' }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            AI Financial Coach
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personalized insights to help you optimize your spending and reach your financial goals
          </Typography>
        </Box>
      </Box>

      {/* Current Month Overview */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <Box>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Spending (30 Days)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  ${totalRecentSpending.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  spent in last 30 days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimelineIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="body2">
                  Projected monthly: ${projectedMonthlySpending.toFixed(0)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                3-month average: ${averageMonthlySpending.toFixed(0)}/month
              </Typography>
              
              {/* Spending forecast */}
              <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1, fontSize: '1rem' }} /> Spending Forecast
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Next Month</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${projectedSpending.nextMonth.toFixed(0)}
                    </Typography>
                    {projectedSpending.nextMonth > projectedSpending.currentMonth ? (
                      <ArrowUpwardIcon sx={{ color: theme.palette.error.main, ml: 0.5, fontSize: '1rem' }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ color: theme.palette.success.main, ml: 0.5, fontSize: '1rem' }} />
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">3 Months</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${projectedSpending.threeMonths.toFixed(0)}
                    </Typography>
                    {projectedSpending.threeMonths > projectedSpending.currentMonth ? (
                      <ArrowUpwardIcon sx={{ color: theme.palette.error.main, ml: 0.5, fontSize: '1rem' }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ color: theme.palette.success.main, ml: 0.5, fontSize: '1rem' }} />
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">6 Months</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${projectedSpending.sixMonths.toFixed(0)}
                    </Typography>
                    {projectedSpending.sixMonths > projectedSpending.currentMonth ? (
                      <ArrowUpwardIcon sx={{ color: theme.palette.error.main, ml: 0.5, fontSize: '1rem' }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ color: theme.palette.success.main, ml: 0.5, fontSize: '1rem' }} />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Spending by Category
              </Typography>
              <Box sx={{ maxHeight: '320px', overflowY: 'auto' }}>
                {Object.entries(recentSpending)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([category, amount]) => {
                    const projectedAmount = projectedSpending.categories[category]?.projected || amount;
                    const isIncreasing = projectedAmount > amount;
                    
                    return (
                      <Box key={category} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.primary.main }}>
                        {getCategoryIcon(category)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {category}
                          </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${amount.toFixed(0)}
                          </Typography>
                              {isIncreasing && (
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                  <Typography variant="caption" color="error.main">
                                    ${projectedAmount.toFixed(0)}
                                  </Typography>
                                  <ArrowUpwardIcon sx={{ color: theme.palette.error.main, ml: 0.2, fontSize: '0.8rem' }} />
                                </Box>
                              )}
                            </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((amount / totalRecentSpending) * 100, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            mt: 0.5,
                            bgcolor: alpha(theme.palette.grey[300], 0.3)
                          }}
                        />
                      </Box>
                    </Box>
                    );
                  })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* AI Insights */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        💡 AI Insights & Recommendations
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        {behaviorInsights.map((insight, index) => (
          <Box key={index}>
            <Card sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(
                insight.trend === 'up' ? theme.palette.error.main :
                insight.trend === 'down' ? theme.palette.success.main :
                theme.palette.warning.main, 0.3
              )}`
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{
                    bgcolor: insight.trend === 'up' ? theme.palette.error.main :
                             insight.trend === 'down' ? theme.palette.success.main :
                             theme.palette.warning.main,
                    mr: 2
                  }}>
                    {insight.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {insight.title}
                    </Typography>
                    <Chip
                      label={`${insight.confidence}% confidence`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {insight.description}
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    💡 Action: {insight.action}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Money Leaks Detector */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        🚨 Money Leaks Detector
      </Typography>

      {moneyLeaks.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3
        }}>
          {moneyLeaks.map((leak, index) => {
            // Determine color based on severity
            const severityColor = 
              leak.severity === 'high' ? theme.palette.error.main :
              leak.severity === 'medium' ? theme.palette.warning.main :
              theme.palette.info.main;
            
            // Determine alert severity
            const alertSeverity = 
              leak.severity === 'high' ? "error" :
              leak.severity === 'medium' ? "warning" :
              "info";
              
            return (
            <Box key={index}>
              <Card sx={{
                borderRadius: 3,
                  border: `1px solid ${alpha(severityColor, 0.3)}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: severityColor, mr: 2 }}>
                        {leak.icon || <WarningIcon />}
                      </Avatar>
                      <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {leak.category}
                    </Typography>
                        <Chip 
                          size="small" 
                          label={`${leak.frequency} expense`}
                          sx={{ mt: 0.5 }}
                          color={
                            leak.severity === 'high' ? 'error' :
                            leak.severity === 'medium' ? 'warning' :
                            'info'
                          }
                        />
                      </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {leak.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Cost
                      </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: severityColor }}>
                        ${leak.monthlyCost.toFixed(0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Yearly Cost
                      </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: severityColor }}>
                        ${leak.yearlyCost.toFixed(0)}
                      </Typography>
                    </Box>
                  </Box>
                    <Alert severity={alertSeverity} sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      💰 {leak.action}
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Box>
            );
          })}
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: '3rem', color: theme.palette.success.main, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No Major Money Leaks Detected!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Great job! Your spending patterns don't show any obvious areas for significant savings.
              Keep monitoring your expenses to maintain this healthy financial position.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Personalized Financial Advice */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            🧠 Personalized Financial Advice
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => setShowDetailedAdvice(!showDetailedAdvice)}
          >
            {showDetailedAdvice ? 'Show Less' : 'Show More'}
          </Button>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: showDetailedAdvice ? '1fr' : 'repeat(3, 1fr)' },
          gap: 3
        }}>
          {personalizedAdvice.slice(0, showDetailedAdvice ? personalizedAdvice.length : 3).map((advice, index) => (
            <Card key={index} sx={{ 
              borderRadius: 3, 
              height: '100%',
              border: `1px solid ${
                advice.impact === 'high' ? alpha(theme.palette.error.main, 0.3) :
                advice.impact === 'medium' ? alpha(theme.palette.warning.main, 0.3) :
                alpha(theme.palette.info.main, 0.3)
              }`
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: 
                      advice.impact === 'high' ? theme.palette.error.main :
                      advice.impact === 'medium' ? theme.palette.warning.main :
                      theme.palette.info.main,
                    mr: 2 
                  }}>
                    {advice.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {advice.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={`Impact: ${advice.impact}`} 
                        sx={{ mr: 1 }}
                        color={
                          advice.impact === 'high' ? 'error' :
                          advice.impact === 'medium' ? 'warning' :
                          'info'
                        }
                      />
                      <Chip 
                        size="small" 
                        label={`${advice.timeframe}-term`}
                        color="secondary"
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {advice.description}
                </Typography>
                
                {showDetailedAdvice && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Action Steps:
                    </Typography>
                    <List dense disablePadding>
                      {advice.steps.map((step, stepIndex) => (
                        <ListItem key={stepIndex} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <AssignmentTurnedInIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Actionable Savings Recommendations */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          💰 Actionable Savings Recommendations
        </Typography>

        <Card sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SavingsIcon sx={{ mr: 2, color: theme.palette.success.main, fontSize: '2rem' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Potential Monthly Savings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on your spending patterns, here are personalized opportunities to save money
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              {/* Quick Savings Card */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Coffee & Dining
                  </Typography>
                  <Chip 
                    size="small" 
                    label="Easy Win" 
                    sx={{ bgcolor: theme.palette.success.main, color: 'white' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Make coffee at home 3x/week and bring lunch 2x/week
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                  Save $120/mo
                </Typography>
              </Paper>

              {/* Subscription Optimization */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Subscriptions
                  </Typography>
                  <Chip 
                    size="small" 
                    label="One-time" 
                    sx={{ bgcolor: theme.palette.info.main, color: 'white' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Audit and cancel unused streaming/app subscriptions
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                  Save $35/mo
                </Typography>
              </Paper>

              {/* Transportation Savings */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Transportation
                  </Typography>
                  <Chip 
                    size="small" 
                    label="Habit Change" 
                    sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Use public transit or carpool 2 days/week
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                  Save $85/mo
                </Typography>
              </Paper>

              {/* Grocery Shopping */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Groceries
                  </Typography>
                  <Chip 
                    size="small" 
                    label="Easy Win" 
                    sx={{ bgcolor: theme.palette.success.main, color: 'white' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Meal plan, use store brands, and buy in bulk
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                  Save $70/mo
                </Typography>
              </Paper>

              {/* Entertainment */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Entertainment
                  </Typography>
                  <Chip 
                    size="small" 
                    label="One-time" 
                    sx={{ bgcolor: theme.palette.info.main, color: 'white' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Look for free events and use entertainment discounts
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                  Save $50/mo
                </Typography>
              </Paper>

              {/* Shopping */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Shopping
                  </Typography>
                  <Chip 
                    size="small" 
                    label="Habit Change" 
                    sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Implement 48-hour rule before non-essential purchases
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                  Save $95/mo
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  Total Potential Monthly Savings: $455
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  That's $5,460 per year you could be saving!
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<SavingsIcon />}
                onClick={() => setShowSavingsPlanModal(true)}
              >
                Create Savings Plan
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Financial Goals & Targets */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          🎯 Financial Goals & Targets
        </Typography>

        {/* Goal Progress Tracking */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TipsAndUpdatesIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2rem' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Financial Goal Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track your progress toward your financial goals
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="small"
                  startIcon={<PriorityHighIcon />}
                  onClick={handleAddNewGoal}
                >
                  Add New Goal
                </Button>
              </Box>

              {financialGoals.map((goal, index) => {
                // Calculate progress percentage
                const progressPercent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                
                // Calculate days remaining
                const targetDate = new Date(goal.targetDate);
                const today = new Date();
                const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                // Calculate monthly contribution needed
                const monthsRemaining = Math.ceil(daysRemaining / 30);
                const amountRemaining = goal.targetAmount - goal.currentAmount;
                const monthlyContribution = monthsRemaining > 0 ? Math.ceil(amountRemaining / monthsRemaining) : amountRemaining;
                
                // Determine status color
                const isOnTrack = progressPercent >= (100 - (daysRemaining / 365) * 100);
                const statusColor = isOnTrack ? theme.palette.success.main : theme.palette.warning.main;
                
                return (
                  <Box key={goal.id} sx={{ mb: index < financialGoals.length - 1 ? 4 : 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {goal.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
                          ${goal.currentAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          of ${goal.targetAmount.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progressPercent} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: alpha(statusColor, 0.2),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: statusColor,
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {progressPercent}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {daysRemaining} days remaining
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          Need to save:
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`$${monthlyContribution}/month`} 
                          color={isOnTrack ? "success" : "warning"}
                          sx={{ height: 24 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Recommended Next Steps
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Increase your monthly contributions to stay on track
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleUpdateGoals}
                >
                  Update Goals
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Financial Targets */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3
        }}>
          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                💸 Emergency Fund
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Based on your spending patterns, you should aim to save 3-6 months of expenses in an emergency fund.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Target: ${Math.round(projectedMonthlySpending * 4).toLocaleString()}
              </Typography>
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📈 Savings Rate
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your optimal savings rate should be 20-30% of your income for long-term financial success.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Aim to save $500-750 monthly
              </Typography>
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🎯 Next Goal
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Consider setting up automatic transfers to savings on payday to build consistent habits.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Action: Set up automatic savings transfers
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
  
  return (
    <>
      {/* Feedback Alert */}
      {feedback && (
        <Alert 
          severity={feedback?.type || 'info'}
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            boxShadow: 3,
            minWidth: 300,
            maxWidth: 400
          }}
          onClose={() => setFeedback(null)}
        >
          {feedback?.message || ''}
        </Alert>
      )}
      
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
        {/* All existing content */}
        
        {/* Automatic Savings Plan Modal */}
        <Dialog 
          open={showSavingsPlanModal} 
          onClose={() => setShowSavingsPlanModal(false)}
          fullWidth
          maxWidth="md"
        >
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <SavingsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6">AI-Generated Savings Plan</Typography>
      </Box>
      <IconButton onClick={() => setShowSavingsPlanModal(false)}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This personalized savings plan is automatically generated based on your financial data, spending patterns, and goals.
        </Typography>
      </Alert>
      
      {/* Financial Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Your Financial Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Monthly Income</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              ${automaticSavingsPlan.monthlyIncome.toFixed(0)}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Monthly Expenses</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
              ${automaticSavingsPlan.monthlyExpenses.toFixed(0)}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Available for Savings</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              ${automaticSavingsPlan.availableForSavings.toFixed(0)}
            </Typography>
          </Paper>
        </Box>
      </Box>
      
      {/* Recommended Savings Plan */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
          <AutorenewIcon sx={{ mr: 1 }} /> Recommended Monthly Savings Plan
        </Typography>
        
        <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell>Category</TableCell>
                <TableCell align="right">Monthly Amount</TableCell>
                <TableCell align="right">Allocation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {automaticSavingsPlan.savingsAllocation.map((allocation, index) => (
                <TableRow key={index}>
                  <TableCell>{allocation.name}</TableCell>
                  <TableCell align="right">${allocation.amount.toFixed(0)}</TableCell>
                  <TableCell align="right">{allocation.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Total Monthly Savings</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  ${automaticSavingsPlan.savingsAllocation.reduce((sum, item) => sum + item.amount, 0).toFixed(0)}
                </TableCell>
                <TableCell align="right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PieChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="subtitle2">Savings Allocation Visualization</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 2, height: 30 }}>
          {automaticSavingsPlan.savingsAllocation.map((allocation, index) => (
            <Tooltip key={index} title={`${allocation.name}: $${allocation.amount.toFixed(0)} (${allocation.percentage.toFixed(1)}%)`}>
              <Box 
                sx={{ 
                  width: `${allocation.percentage}%`, 
                  bgcolor: index === 0 ? theme.palette.primary.main : 
                          index === 1 ? theme.palette.secondary.main : 
                          index === 2 ? theme.palette.success.main : 
                          theme.palette.warning.main,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              >
                {allocation.percentage > 15 ? `${allocation.percentage.toFixed(0)}%` : ''}
              </Box>
            </Tooltip>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {automaticSavingsPlan.savingsAllocation.map((allocation, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: index === 0 ? theme.palette.primary.main : 
                          index === 1 ? theme.palette.secondary.main : 
                          index === 2 ? theme.palette.success.main : 
                          theme.palette.warning.main,
                  mr: 0.5 
                }} 
              />
              <Typography variant="caption">{allocation.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Financial Goals */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
          <TipsAndUpdatesIcon sx={{ mr: 1 }} /> Recommended Financial Goals
        </Typography>
        
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell>Goal</TableCell>
                <TableCell align="right">Target Amount</TableCell>
                <TableCell align="right">Monthly Contribution</TableCell>
                <TableCell align="right">Timeline</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Emergency Fund</TableCell>
                <TableCell align="right">${automaticSavingsPlan.emergencyFundTarget.toFixed(0)}</TableCell>
                <TableCell align="right">${automaticSavingsPlan.emergencyFundMonthly.toFixed(0)}</TableCell>
                <TableCell align="right">{automaticSavingsPlan.monthsToEmergencyFund} months</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Retirement</TableCell>
                <TableCell align="right">Ongoing</TableCell>
                <TableCell align="right">${automaticSavingsPlan.retirementMonthly.toFixed(0)}</TableCell>
                <TableCell align="right">Long-term</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Short-term Goals</TableCell>
                <TableCell align="right">Varies</TableCell>
                <TableCell align="right">${automaticSavingsPlan.shortTermGoalsMonthly.toFixed(0)}</TableCell>
                <TableCell align="right">6-12 months</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button 
        variant="outlined" 
        onClick={() => setShowSavingsPlanModal(false)}
      >
        Close
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<CheckIcon />}
        onClick={handleApplySavingsPlan}
      >
        Apply This Plan
      </Button>
    </DialogActions>
  </Dialog>
      </Box>
    </>
  );
};

export default AICoachPage;
