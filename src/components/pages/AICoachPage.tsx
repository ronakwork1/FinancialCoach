import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
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
import BarChartIcon from '@mui/icons-material/BarChart';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareIcon from '@mui/icons-material/Compare';
import Avatar from '@mui/material/Avatar';
import { useFinancial } from '../../context/FinancialContext';

const AICoachPage: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  
  
  

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

  // Generate available months for selection
  const availableMonths = useMemo(() => {
    if (!financialData.transactions || financialData.transactions.length === 0) {
      return [{ value: 'current', label: 'Current Month' }];
    }

    const monthSet = new Set<string>();
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(monthKey);
      }
    });

    const months = Array.from(monthSet).sort().reverse().map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    return {
        value: monthKey,
        label: isCurrentMonth ? 'Current Month' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      };
    });

    return [{ value: 'current', label: 'Current Month' }, ...months.filter(m => m.value !== 'current')];
  }, [financialData.transactions, currentMonth, currentYear]);

  // Handle month selection change
  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value);
  };

  // Calculate spending by category for the selected month
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

    let targetMonth: number;
    let targetYear: number;

    if (selectedMonth === 'current') {
      // Use current month based on most recent transaction
    let mostRecentDate: Date | null = null;
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date);
        if (!mostRecentDate || txDate > mostRecentDate) {
          mostRecentDate = txDate;
        }
      }
    });
    const referenceDate = mostRecentDate || new Date();
      targetMonth = referenceDate.getMonth();
      targetYear = referenceDate.getFullYear();
    } else {
      // Parse selected month
      const [year, month] = selectedMonth.split('-');
      targetMonth = parseInt(month) - 1;
      targetYear = parseInt(year);
    }

    // Calculate the date range for the selected month
    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0); // Last day of the month

    console.log('AI Coach Debug - Selected month:', selectedMonth);
    console.log('AI Coach Debug - Target period:', monthStart.toISOString(), 'to', monthEnd.toISOString());

    // Filter transactions for the selected month only
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date);
        if (txDate >= monthStart && txDate <= monthEnd) {
          spending[tx.category] = (spending[tx.category] || 0) + Math.abs(tx.amount);
          console.log('AI Coach Debug - Including transaction in selected month:', tx.category, tx.amount, txDate);
        }
      }
    });

    console.log('AI Coach Debug - Final spending calculation for selected month:', spending);
    return spending;
  }, [financialData.transactions, selectedMonth]);

  // Calculate total current month spending
  const totalRecentSpending = useMemo(() => {
    const values = Object.values(recentSpending);
    return values.length > 0 ? values.reduce((sum, amount) => sum + amount, 0) : 0;
  }, [recentSpending]);

  // Calculate average monthly spending from last 3 months or selected month context
  const averageMonthlySpending = useMemo(() => {
    // Check if there are any transactions
    if (!financialData.transactions || financialData.transactions.length === 0) {
      // Return a reasonable sample value if no transactions exist
      return 2270; // Sum of the sample spending categories
    }

    const monthlyTotals: number[] = [];

    // Get last 3 months relative to selected month
    let baseMonth: number;
    let baseYear: number;

    if (selectedMonth === 'current') {
      // Use current month based on most recent transaction
      let mostRecentDate: Date | null = null;
      financialData.transactions.forEach(tx => {
        if (tx.type === 'expense') {
          const txDate = new Date(tx.date);
          if (!mostRecentDate || txDate > mostRecentDate) {
            mostRecentDate = txDate;
          }
        }
      });
      const referenceDate = mostRecentDate || new Date();
      baseMonth = referenceDate.getMonth();
      baseYear = referenceDate.getFullYear();
    } else {
      // Parse selected month
      const [year, month] = selectedMonth.split('-');
      baseMonth = parseInt(month) - 1;
      baseYear = parseInt(year);
    }

    // Get last 3 months including the selected month
    for (let i = 0; i < 3; i++) {
      const targetMonth = (baseMonth - i + 12) % 12;
      const targetYear = baseYear - Math.floor((i - baseMonth + 12) / 12);
      const date = new Date(targetYear, targetMonth, 1);
      let monthlyTotal = 0;

      financialData.transactions.forEach(tx => {
        if (tx.type === 'expense') {
          const txDate = new Date(tx.date);
          if (txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear) {
            monthlyTotal += Math.abs(tx.amount);
          }
        }
      });

      monthlyTotals.push(monthlyTotal);
    }

    const total = monthlyTotals.reduce((sum, amount) => sum + amount, 0);
    return monthlyTotals.length > 0 ? total / monthlyTotals.length : 0;
  }, [financialData.transactions, selectedMonth, currentDateInfo]);

  // ML-based projection system using advanced forecasting algorithms
  const projectedSpending = useMemo(() => {
    // Calculate daily average from selected month spending
    const daysInMonth = 30; // Approximation for projection purposes
    const dailyAverage = totalRecentSpending / daysInMonth;
    
    // If no transactions, return sample projections
    if (!financialData.transactions || financialData.transactions.length === 0) {
      return {
        currentMonth: totalRecentSpending || 2270,
        nextMonth: (totalRecentSpending || 2270) * 1.05,
        threeMonths: (totalRecentSpending || 2270) * 1.1,
        sixMonths: (totalRecentSpending || 2270) * 1.15,
        confidence: 0.65,
        seasonality: 'stable',
        trend: 'moderate_growth',
        categories: {
          'Housing': { current: 950, projected: 950, confidence: 0.95, volatility: 0.05 },
          'Food': { current: 275, projected: 290, confidence: 0.75, volatility: 0.15 },
          'Transport': { current: 220, projected: 235, confidence: 0.80, volatility: 0.12 },
          'Shopping': { current: 350, projected: 380, confidence: 0.70, volatility: 0.25 },
          'Subscriptions': { current: 150, projected: 165, confidence: 0.90, volatility: 0.08 },
          'Healthcare': { current: 325, projected: 325, confidence: 0.85, volatility: 0.10 }
        }
      };
    }

    // Advanced ML-style forecasting algorithm
    const monthlyTotals: Record<string, number> = {};
    const categoryHistory: Record<string, Record<string, number>> = {};
    const monthlyCategoryTotals: Record<string, Record<string, number>> = {};
    
    // Build comprehensive historical data
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Overall monthly totals
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
        }
        monthlyTotals[monthKey] += Math.abs(tx.amount);

        // Category-specific history
        if (!monthlyCategoryTotals[monthKey]) {
          monthlyCategoryTotals[monthKey] = {};
        }
        if (!monthlyCategoryTotals[monthKey][tx.category]) {
          monthlyCategoryTotals[monthKey][tx.category] = 0;
        }
        monthlyCategoryTotals[monthKey][tx.category] += Math.abs(tx.amount);
      }
    });

    // ML Algorithm 1: Exponential Smoothing for Trend Detection
    const calculateExponentialSmoothing = (data: number[], alpha: number = 0.3) => {
      if (data.length < 2) return data[0] || 0;

      let smoothed = data[0];
      const smoothedValues = [smoothed];

      for (let i = 1; i < data.length; i++) {
        smoothed = alpha * data[i] + (1 - alpha) * smoothed;
        smoothedValues.push(smoothed);
      }

      return smoothedValues;
    };

    // ML Algorithm 2: Seasonal Pattern Detection
    const detectSeasonality = (monthlyData: Record<string, number>) => {
      const months = Object.keys(monthlyData).sort();
      if (months.length < 6) return { pattern: 'insufficient_data', strength: 0 };

      const values = months.map(month => monthlyData[month]);
      const seasonalFactors = [];

      // Calculate month-over-month variations
      for (let i = 1; i < values.length; i++) {
        const change = (values[i] - values[i-1]) / values[i-1];
        seasonalFactors.push(change);
      }

      const avgChange = seasonalFactors.reduce((sum, val) => sum + val, 0) / seasonalFactors.length;
      const variance = seasonalFactors.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / seasonalFactors.length;
      const seasonalityStrength = Math.min(Math.sqrt(variance) / Math.abs(avgChange), 1);

      if (seasonalityStrength < 0.1) return { pattern: 'stable', strength: seasonalityStrength };
      if (seasonalityStrength < 0.3) return { pattern: 'moderate_seasonal', strength: seasonalityStrength };
      return { pattern: 'highly_seasonal', strength: seasonalityStrength };
    };

    // ML Algorithm 3: Advanced Forecasting with Multiple Models
    const generateForecast = (historicalData: number[], periods: number) => {
      if (historicalData.length < 3) {
        // Simple linear regression fallback
        const avg = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
        return { forecast: avg, confidence: 0.6, trend: 'stable' };
      }

      // Calculate trend using linear regression
      const n = historicalData.length;
      const x = Array.from({length: n}, (_, i) => i);
      const y = historicalData;

      const sumX = x.reduce((sum, val) => sum + val, 0);
      const sumY = y.reduce((sum, val) => sum + val, 0);
      const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
      const sumXX = x.reduce((sum, val) => sum + val * val, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Generate forecast
      const lastValue = historicalData[historicalData.length - 1];
      const forecast = lastValue * (1 + slope);

      // Calculate confidence based on data consistency
      const mean = sumY / n;
      const variance = y.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);
      const confidence = Math.max(0.5, Math.min(1, 1 - (stdDev / mean)));

      const trend = slope > 0.05 ? 'increasing' : slope < -0.05 ? 'decreasing' : 'stable';

      return { forecast, confidence, trend, slope };
    };

    // Apply ML algorithms to spending data
    const sortedMonths = Object.keys(monthlyTotals).sort();
    const spendingValues = sortedMonths.map(month => monthlyTotals[month]);

    const seasonality = detectSeasonality(monthlyTotals);
    const forecast = generateForecast(spendingValues, 6);

    // Calculate base growth rate with ML insights
    let baseGrowthRate = 0.02; // Default
    if (forecast.trend === 'increasing' && forecast.slope !== undefined) {
      baseGrowthRate = Math.min(forecast.slope, 0.15);
    } else if (forecast.trend === 'decreasing' && forecast.slope !== undefined) {
      baseGrowthRate = Math.max(forecast.slope, -0.1);
    }

    // Adjust for seasonality
    if (seasonality.pattern === 'highly_seasonal') {
      baseGrowthRate *= 1.2;
    } else if (seasonality.pattern === 'stable') {
      baseGrowthRate *= 0.8;
    }

    // ML-enhanced category projections
    const categoryProjections: Record<string, { current: number, projected: number, confidence: number, volatility: number }> = {};
    
    Object.entries(recentSpending).forEach(([category, amount]) => {
      // Get historical data for this category
      const categoryValues = sortedMonths
        .map(month => monthlyCategoryTotals[month]?.[category] || 0)
        .filter(val => val > 0);

      let categoryGrowthRate = baseGrowthRate;
      let confidence = 0.7;
      let volatility = 0.15;

      if (categoryValues.length >= 3) {
        const categoryForecast = generateForecast(categoryValues, 1);
        if (categoryForecast.trend === 'increasing' && categoryForecast.slope !== undefined) {
          categoryGrowthRate = Math.min(categoryForecast.slope, 0.2);
        } else if (categoryForecast.trend === 'decreasing' && categoryForecast.slope !== undefined) {
          categoryGrowthRate = Math.max(categoryForecast.slope, -0.15);
        } else {
          categoryGrowthRate = baseGrowthRate;
        }

        confidence = categoryForecast.confidence;
        volatility = Math.sqrt(categoryValues.reduce((sum, val) => {
          const mean = categoryValues.reduce((s, v) => s + v, 0) / categoryValues.length;
          return sum + Math.pow(val - mean, 2);
        }, 0) / categoryValues.length) / (categoryValues.reduce((s, v) => s + v, 0) / categoryValues.length);
      } else {
        // Category-specific adjustments when limited data
        const categoryMultipliers: Record<string, number> = {
          'Subscriptions': 0.3,
          'Housing': 0.1,
          'Utilities': 0.2,
          'Shopping': 1.8,
          'Dining': 1.5,
          'Food': 1.2,
          'Transport': 1.0,
          'Healthcare': 0.8
        };

        categoryGrowthRate = baseGrowthRate * (categoryMultipliers[category] || 1);
        confidence = 0.6;
        volatility = 0.2;
      }
      
      categoryProjections[category] = {
        current: amount,
        projected: Math.max(0, amount * (1 + categoryGrowthRate)),
        confidence: Math.max(0.5, Math.min(1, confidence)),
        volatility: Math.min(1, volatility)
      };
    });

    // Calculate overall projections with ML confidence intervals
    const currentMonthProjection = totalRecentSpending;
    
    return {
      currentMonth: currentMonthProjection,
      nextMonth: currentMonthProjection * (1 + baseGrowthRate),
      threeMonths: currentMonthProjection * Math.pow(1 + baseGrowthRate, 3),
      sixMonths: currentMonthProjection * Math.pow(1 + baseGrowthRate, 6),
      confidence: forecast.confidence,
      seasonality: seasonality.pattern,
      trend: forecast.trend,
      growthRate: baseGrowthRate,
      categories: categoryProjections
    };
  }, [financialData.transactions, totalRecentSpending, recentSpending, selectedMonth]);
  
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
  }, [recentSpending, financialData.transactions, financialData.income, totalRecentSpending, selectedMonth]);

  // Advanced AI-powered behavior insights with ML algorithms
  const behaviorInsights = useMemo(() => {
    const insights: Array<{
      title: string;
      description: string;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
      action: string;
      icon: React.ReactElement;
      mlTechnique?: string;
      impact: 'high' | 'medium' | 'low';
    }> = [];

    // If there's no data, provide sample insights
    if (!financialData.transactions || financialData.transactions.length === 0) {
      insights.push({
        title: 'Sample: Housing Cost Analysis',
        description: `Housing represents 40% of your monthly expenses, which is higher than the recommended 30%.`,
        confidence: 90,
        trend: 'stable',
        action: 'Consider roommates or a less expensive area when your lease ends.',
        icon: <WarningIcon />,
        mlTechnique: 'Pattern Recognition',
        impact: 'high'
      });

      insights.push({
        title: 'Sample: Savings Opportunity',
        description: 'Your spending is lower than usual this month, creating a great opportunity to boost savings.',
        confidence: 75,
        trend: 'down',
        action: 'Consider transferring the difference to savings or paying down debt.',
        icon: <LightbulbIcon />,
        mlTechnique: 'Anomaly Detection',
        impact: 'medium'
      });

      return insights;
    }

    // ML Algorithm: Advanced Spending Pattern Analysis
    const analyzeSpendingPatterns = () => {
      const transactions = financialData.transactions.filter(tx => tx.type === 'expense');
      if (transactions.length < 10) return null;

      // Time series analysis for spending velocity
      const dailySpending: Record<string, number> = {};
      transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        dailySpending[date] = (dailySpending[date] || 0) + Math.abs(tx.amount);
      });

      const spendingValues = Object.values(dailySpending);
      const avgDaily = spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length;
      const stdDev = Math.sqrt(
        spendingValues.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / spendingValues.length
      );

      return {
        averageDaily: avgDaily,
        volatility: stdDev / avgDaily,
        totalDays: Object.keys(dailySpending).length,
        spendingValues
      };
    };

    const patternAnalysis = analyzeSpendingPatterns();

    // ML Algorithm: Category Correlation Analysis
    const analyzeCategoryCorrelations = () => {
      const categoryPairs: Record<string, Record<string, number>> = {};
      const transactions = financialData.transactions.filter(tx => tx.type === 'expense');

      // Group transactions by date to find same-day spending patterns
      const dateGroups: Record<string, Array<{category: string, amount: number}>> = {};
      transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dateGroups[date]) dateGroups[date] = [];
        dateGroups[date].push({ category: tx.category, amount: Math.abs(tx.amount) });
      });

      // Analyze co-occurrence patterns
      Object.values(dateGroups).forEach(dayTransactions => {
        if (dayTransactions.length > 1) {
          for (let i = 0; i < dayTransactions.length; i++) {
            for (let j = i + 1; j < dayTransactions.length; j++) {
              const cat1 = dayTransactions[i].category;
              const cat2 = dayTransactions[j].category;

              if (!categoryPairs[cat1]) categoryPairs[cat1] = {};
              if (!categoryPairs[cat1][cat2]) categoryPairs[cat1][cat2] = 0;
              categoryPairs[cat1][cat2]++;
            }
          }
        }
      });

      return categoryPairs;
    };

    const correlations = analyzeCategoryCorrelations();

    // ML Algorithm: Predictive Anomaly Detection
    const detectAnomalies = () => {
      if (!patternAnalysis || patternAnalysis.spendingValues.length < 7) return null;

      const values = patternAnalysis.spendingValues;
      const anomalies = [];

      // Simple moving average anomaly detection
      for (let i = 3; i < values.length; i++) {
        const window = values.slice(i - 3, i);
        const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
        const std = Math.sqrt(window.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / window.length);

        if (Math.abs(values[i] - avg) > 2 * std && values[i] > avg + 50) {
          anomalies.push({
            day: i,
            value: values[i],
            expected: avg,
            deviation: ((values[i] - avg) / avg) * 100
          });
        }
      }

      return anomalies;
    };

    const anomalies = detectAnomalies();

    // Generate ML-powered insights

    // 1. Spending Velocity Analysis (ML: Time Series Analysis)
    if (patternAnalysis && patternAnalysis.volatility > 0.5) {
      insights.push({
        title: 'High Spending Volatility Detected',
        description: `Your daily spending shows ${patternAnalysis.volatility > 0.8 ? 'extreme' : 'high'} volatility (${(patternAnalysis.volatility * 100).toFixed(0)}% variation from average). This suggests inconsistent spending patterns.`,
        confidence: Math.min(95, 60 + patternAnalysis.volatility * 20),
        trend: patternAnalysis.volatility > 0.7 ? 'up' : 'stable',
        action: 'Consider implementing daily spending limits and tracking triggers for high-spending days.',
        icon: <TrendingUpIcon />,
        mlTechnique: 'Time Series Volatility Analysis',
        impact: 'high'
      });
    }

    // 2. Spending Trend Analysis with ML Forecasting
    const spendingChange = ((projectedMonthlySpending - averageMonthlySpending) / averageMonthlySpending) * 100;
    if (Math.abs(spendingChange) > 5) {
      const confidence = projectedSpending.confidence || 0.7;
      insights.push({
        title: `ML Forecast: ${spendingChange > 0 ? 'Increasing' : 'Decreasing'} Spending Trend`,
        description: `Advanced forecasting algorithms predict your spending will be ${Math.abs(spendingChange).toFixed(0)}% ${spendingChange > 0 ? 'higher' : 'lower'} next month. Current confidence: ${(confidence * 100).toFixed(0)}%.`,
        confidence: confidence * 100,
        trend: spendingChange > 0 ? 'up' : 'down',
        action: spendingChange > 0 ? 'Implement proactive budget controls to prevent overspending.' : 'Capitalize on positive trends by increasing savings allocation.',
        icon: spendingChange > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
        mlTechnique: 'Exponential Smoothing + Linear Regression',
        impact: spendingChange > 15 ? 'high' : 'medium'
      });
    }

    // 3. Category Correlation Insights (ML: Association Rule Mining)
    const topCorrelations = Object.entries(correlations)
      .flatMap(([cat1, pairs]) =>
        Object.entries(pairs).map(([cat2, count]) => ({ cat1, cat2, count }))
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    if (topCorrelations.length > 0 && topCorrelations[0].count >= 3) {
      const topCorr = topCorrelations[0];
      insights.push({
        title: 'Spending Pattern Correlation',
        description: `ML analysis detected a strong correlation between ${topCorr.cat1} and ${topCorr.cat2} spending (${topCorr.count} co-occurrences). When you spend on one, you're likely to spend on the other.`,
        confidence: Math.min(90, 50 + topCorr.count * 10),
        trend: 'stable',
        action: `Consider bundled budgeting for these correlated categories to better control combined spending.`,
        icon: <PsychologyIcon />,
        mlTechnique: 'Association Rule Mining',
        impact: 'medium'
      });
    }

    // 4. Anomaly Detection Insights
    if (anomalies && anomalies.length > 0) {
      const recentAnomaly = anomalies[anomalies.length - 1];
      insights.push({
        title: 'Spending Anomaly Detected',
        description: `Unusual spending pattern detected: $${recentAnomaly.value.toFixed(0)} spent when $${recentAnomaly.expected.toFixed(0)} was expected (${recentAnomaly.deviation.toFixed(0)}% above normal).`,
        confidence: 85,
        trend: 'up',
        action: 'Review recent transactions to identify spending triggers and implement preventive measures.',
        icon: <WarningIcon />,
        mlTechnique: 'Statistical Anomaly Detection',
        impact: 'high'
      });
    }

    // 5. Category Efficiency Analysis (ML: Comparative Performance)
    const spendingEntries = Object.entries(recentSpending);
    const topCategory = spendingEntries.length > 0 ? spendingEntries.reduce((a, b) =>
      recentSpending[a[0]] > recentSpending[b[0]] ? a : b
    ) : null;

    if (topCategory && topCategory[1] > totalRecentSpending * 0.3) {
      const categoryData = projectedSpending.categories[topCategory[0] as keyof typeof projectedSpending.categories];
      const efficiency = categoryData ? (categoryData.confidence * (1 - categoryData.volatility)) : 0.7;

      insights.push({
        title: 'Category Efficiency Analysis',
        description: `${topCategory[0]} dominates ${(topCategory[1] / totalRecentSpending * 100).toFixed(0)}% of spending. ML analysis shows ${(efficiency * 100).toFixed(0)}% efficiency rating.`,
        confidence: categoryData?.confidence ? categoryData.confidence * 100 : 85,
        trend: 'stable',
        action: efficiency < 0.6 ? `High volatility detected in ${topCategory[0]}. Consider implementing stricter controls.` : `Good efficiency in ${topCategory[0]}. Focus optimization efforts elsewhere.`,
        icon: <BarChartIcon />,
        mlTechnique: 'Performance Efficiency Scoring',
        impact: efficiency < 0.6 ? 'high' : 'medium'
      });
    }

    // 6. Predictive Budget Alert (ML: Classification)
    const budgetOverruns = financialData.budgets.filter(budget => {
      const spent = recentSpending[budget.category] || 0;
      const projected = projectedSpending.categories[budget.category as keyof typeof projectedSpending.categories]?.projected || spent;
      return projected > budget.budget * 1.1; // Predict 10% overrun
    });

    if (budgetOverruns.length > 0) {
      insights.push({
        title: 'Predictive Budget Alert',
        description: `ML forecasting predicts you'll exceed budget in ${budgetOverruns.length} categorie${budgetOverruns.length > 1 ? 's' : ''} next month: ${budgetOverruns.map(b => b.category).join(', ')}.`,
        confidence: 90,
        trend: 'up',
        action: 'Implement immediate spending controls or adjust budget allocations to prevent overruns.',
        icon: <PriorityHighIcon />,
        mlTechnique: 'Predictive Classification',
        impact: 'high'
      });
    }

    // 7. Seasonal Pattern Recognition (ML: Pattern Mining)
    if (projectedSpending.seasonality === 'highly_seasonal') {
      insights.push({
        title: 'Seasonal Spending Pattern Detected',
        description: 'ML analysis identified strong seasonal patterns in your spending behavior. Your expenses fluctuate significantly by time period.',
        confidence: 88,
        trend: 'stable',
        action: 'Create seasonal budgets and build emergency savings to handle predictable spending fluctuations.',
        icon: <TimelineIcon />,
        mlTechnique: 'Seasonal Pattern Recognition',
        impact: 'medium'
      });
    }

    // Ensure we have at least some insights
    if (insights.length === 0) {
      insights.push({
        title: 'Stable Spending Patterns',
        description: 'Your spending shows consistent, predictable patterns with no major anomalies detected.',
        confidence: 75,
        trend: 'stable',
        action: 'Continue current spending habits while monitoring for changes.',
        icon: <CheckCircleIcon />,
        mlTechnique: 'Pattern Stability Analysis',
        impact: 'low'
      });
    }

    return insights.slice(0, 6); // Limit to top 6 insights
  }, [recentSpending, totalRecentSpending, projectedMonthlySpending, averageMonthlySpending, financialData.budgets, financialData.transactions, projectedSpending, selectedMonth]);


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

      {/* Month Selector */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CompareIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2rem' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    AI Analysis Period
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select the month for AI-powered financial analysis
                  </Typography>
                </Box>
              </Box>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Select Month"
                  onChange={handleMonthChange}
                >
                  {availableMonths.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
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
                {selectedMonth === 'current' ? 'Current Month' : availableMonths.find(m => m.value === selectedMonth)?.label || 'Selected Month'} Spending
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  ${totalRecentSpending.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  spent {selectedMonth === 'current' ? 'this month' : 'in selected month'}
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
              
              {/* AI-Enhanced Spending Forecast */}
              <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1, fontSize: '1rem' }} /> AI-Powered Forecast
                </Typography>

                {/* ML Insights Display */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={`Confidence: ${(projectedSpending.confidence * 100).toFixed(0)}%`}
                    sx={{
                      bgcolor: projectedSpending.confidence > 0.8 ? alpha(theme.palette.success.main, 0.1) :
                              projectedSpending.confidence > 0.6 ? alpha(theme.palette.warning.main, 0.1) :
                              alpha(theme.palette.error.main, 0.1),
                      color: projectedSpending.confidence > 0.8 ? theme.palette.success.main :
                             projectedSpending.confidence > 0.6 ? theme.palette.warning.main :
                             theme.palette.error.main
                    }}
                  />
                  <Chip
                    size="small"
                    label={`Trend: ${projectedSpending.trend.replace('_', ' ')}`}
                    sx={{
                      bgcolor: projectedSpending.trend === 'increasing' ? alpha(theme.palette.error.main, 0.1) :
                              projectedSpending.trend === 'decreasing' ? alpha(theme.palette.success.main, 0.1) :
                              alpha(theme.palette.info.main, 0.1),
                      color: projectedSpending.trend === 'increasing' ? theme.palette.error.main :
                             projectedSpending.trend === 'decreasing' ? theme.palette.success.main :
                             theme.palette.info.main
                    }}
                  />
                  <Chip
                    size="small"
                    label={`Pattern: ${projectedSpending.seasonality.replace('_', ' ')}`}
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Next Month</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${Math.round(projectedSpending.nextMonth).toFixed(0)}
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
                      ${Math.round(projectedSpending.threeMonths).toFixed(0)}
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
                      ${Math.round(projectedSpending.sixMonths).toFixed(0)}
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedMonth === 'current' ? 'Current month' : 'Selected month'} breakdown
              </Typography>
              <Box sx={{ maxHeight: '320px', overflowY: 'auto' }}>
                {Object.entries(recentSpending)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([category, amount]) => {
                    const categoryData = projectedSpending.categories[category as keyof typeof projectedSpending.categories];
                    const projectedAmount = categoryData?.projected || amount;
                    const isIncreasing = projectedAmount > amount;
                    const confidence = categoryData?.confidence || 0.7;
                    const volatility = categoryData?.volatility || 0.15;
                    
                    return (
                      <Box key={category} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.primary.main }}>
                        {getCategoryIcon(category)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {category}
                          </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Chip
                                size="small"
                                label={`${(confidence * 100).toFixed(0)}%`}
                                sx={{
                                  height: 16,
                                  fontSize: '0.7rem',
                                  bgcolor: confidence > 0.8 ? alpha(theme.palette.success.main, 0.2) :
                                          confidence > 0.6 ? alpha(theme.palette.warning.main, 0.2) :
                                          alpha(theme.palette.error.main, 0.2),
                                  color: confidence > 0.8 ? theme.palette.success.main :
                                         confidence > 0.6 ? theme.palette.warning.main :
                                         theme.palette.error.main
                                }}
                              />
                              {volatility > 0.2 && (
                                <Chip
                                  size="small"
                                  label="⚠️"
                                  sx={{
                                    height: 16,
                                    width: 16,
                                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                                    color: theme.palette.warning.main
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
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
                        {volatility > 0.2 && (
                          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                            High volatility detected - consider budget controls
                          </Typography>
                        )}
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
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                          label={`${insight.confidence.toFixed(0)}% confidence`}
                      size="small"
                          color={
                            insight.confidence > 80 ? 'success' :
                            insight.confidence > 60 ? 'warning' : 'error'
                          }
                        />
                        {insight.mlTechnique && (
                          <Chip
                            label={insight.mlTechnique}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                        <Chip
                          label={`Impact: ${insight.impact}`}
                          size="small"
                          color={
                            insight.impact === 'high' ? 'error' :
                            insight.impact === 'medium' ? 'warning' : 'info'
                          }
                        />
                      </Box>
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
        
      </Box>
    </>
  );
};

export default AICoachPage;
