import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,

  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import { useFinancial } from '../../context/FinancialContext';

const BudgetPage: React.FC = () => {
  const theme = useTheme();
  const { financialData, updateBudget } = useFinancial();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newBudgetLimit, setNewBudgetLimit] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  // Get the most recent transaction date from the data
  const getMostRecentTransactionDate = useMemo(() => {
    if (financialData.transactions.length === 0) return new Date();

    const sortedTransactions = [...financialData.transactions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return new Date(sortedTransactions[0].date);
  }, [financialData.transactions]);

  // Helper function to filter transactions based on selected period
  const getFilteredTransactions = (transactions: any[], period: string) => {
    const referenceDate = getMostRecentTransactionDate;
    const currentMonth = referenceDate.getMonth();
    const currentYear = referenceDate.getFullYear();

    switch (period) {
      case 'current':
        return transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });
      case 'lastMonth':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
        });
      case 'last3Months':
        const threeMonthsAgo = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 3, 1);
        return transactions.filter(tx => new Date(tx.date) >= threeMonthsAgo);
      case 'all':
        return transactions;
      default:
        return transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });
    }
  };

  // Extract unique categories from transaction data and assign icons/colors
  const budgetCategories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    // Map transaction categories to standard budget categories
    const categoryMapping: Record<string, string> = {
      'groceries': 'Food',
      'dining': 'Food',
      'food': 'Food',
      'transport': 'Transportation',
      'transportation': 'Transportation',
      'housing': 'Housing',
      'subscriptions': 'Entertainment',
      'entertainment': 'Entertainment',
      'shopping': 'Shopping',
      'utilities': 'Utilities',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'medical': 'Healthcare',
      'gas': 'Transportation',
      'car': 'Transportation',
      'rent': 'Housing',
      'mortgage': 'Housing',
      'electricity': 'Utilities',
      'water': 'Utilities',
      'internet': 'Utilities'
    };

    // Get all unique expense categories from transactions (exclude income) and map them
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const rawCategory = tx.category.toLowerCase();
        const mappedCategory = categoryMapping[rawCategory] || tx.category;
        uniqueCategories.add(mappedCategory);
      }
    });

    // If no transactions, show some default categories
    if (uniqueCategories.size === 0) {
      return [
        { name: 'Housing', icon: <HomeIcon />, color: theme.palette.primary.main },
        { name: 'Food', icon: <RestaurantIcon />, color: theme.palette.secondary.main },
        { name: 'Transportation', icon: <DirectionsCarIcon />, color: theme.palette.success.main },
        { name: 'Entertainment', icon: <CheckCircleIcon />, color: theme.palette.info.main }
      ];
    }

    // Define icon mapping for common categories
    const categoryIcons: Record<string, { icon: React.ReactElement, color: string }> = {
      'Housing': { icon: <HomeIcon />, color: theme.palette.primary.main },
      'Rent': { icon: <HomeIcon />, color: theme.palette.primary.main },
      'Mortgage': { icon: <HomeIcon />, color: theme.palette.primary.main },
      'Food': { icon: <RestaurantIcon />, color: theme.palette.secondary.main },
      'Groceries': { icon: <RestaurantIcon />, color: theme.palette.secondary.main },
      'Dining': { icon: <RestaurantIcon />, color: theme.palette.secondary.main },
      'Coffee': { icon: <LocalCafeIcon />, color: theme.palette.warning.main },
      'Transportation': { icon: <DirectionsCarIcon />, color: theme.palette.success.main },
      'Gas': { icon: <DirectionsCarIcon />, color: theme.palette.success.main },
      'Car': { icon: <DirectionsCarIcon />, color: theme.palette.success.main },
      'Healthcare': { icon: <LocalHospitalIcon />, color: theme.palette.error.main },
      'Medical': { icon: <LocalHospitalIcon />, color: theme.palette.error.main },
      'Education': { icon: <SchoolIcon />, color: theme.palette.info.main },
      'Entertainment': { icon: <CheckCircleIcon />, color: theme.palette.info.main },
      'Shopping': { icon: <ShoppingCartIcon />, color: theme.palette.primary.dark },
      'Utilities': { icon: <HomeIcon />, color: theme.palette.secondary.dark },
      'Electricity': { icon: <HomeIcon />, color: theme.palette.secondary.dark },
      'Water': { icon: <HomeIcon />, color: theme.palette.secondary.dark },
      'Internet': { icon: <HomeIcon />, color: theme.palette.secondary.dark },
      'Other': { icon: <CheckCircleIcon />, color: theme.palette.grey[500] }
    };

    // Available colors for categories not in the mapping
    const availableColors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
      theme.palette.primary.dark,
      theme.palette.secondary.dark,
      theme.palette.grey[500],
      theme.palette.primary.light
    ];

    // Create categories array with icons and colors
    const categories = Array.from(uniqueCategories).map((categoryName, index) => {
      // Try to find exact match first
      if (categoryIcons[categoryName]) {
        return {
          name: categoryName,
          icon: categoryIcons[categoryName].icon,
          color: categoryIcons[categoryName].color
        };
      }

      // Try partial matching
      const lowerCategoryName = categoryName.toLowerCase();
      for (const [key, value] of Object.entries(categoryIcons)) {
        if (lowerCategoryName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategoryName)) {
          return {
            name: categoryName,
            icon: value.icon,
            color: value.color
          };
        }
      }

      // Use default icon and cycle through colors for unknown categories
      return {
        name: categoryName,
        icon: <CheckCircleIcon />,
        color: availableColors[index % availableColors.length]
      };
    });

    // Sort categories alphabetically for consistent display
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }, [financialData.transactions, theme]);

  // Calculate spending by category based on selected period
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    const filteredTransactions = getFilteredTransactions(financialData.transactions, selectedPeriod);

    // Map transaction categories to standard budget categories
    const categoryMapping: Record<string, string> = {
      'groceries': 'Food',
      'dining': 'Food',
      'food': 'Food',
      'transport': 'Transportation',
      'transportation': 'Transportation',
      'housing': 'Housing',
      'subscriptions': 'Entertainment',
      'entertainment': 'Entertainment',
      'shopping': 'Shopping',
      'utilities': 'Utilities',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'medical': 'Healthcare',
      'gas': 'Transportation',
      'car': 'Transportation',
      'rent': 'Housing',
      'mortgage': 'Housing',
      'electricity': 'Utilities',
      'water': 'Utilities',
      'internet': 'Utilities'
    };

    filteredTransactions.forEach(tx => {
      if (tx.type === 'expense') {
        const rawCategory = tx.category.toLowerCase();
        const mappedCategory = categoryMapping[rawCategory] || tx.category;
        spending[mappedCategory] = (spending[mappedCategory] || 0) + Math.abs(tx.amount);
      }
    });

    return spending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData.transactions, selectedPeriod, getMostRecentTransactionDate]);

  // Calculate budget forecasting for current month
  const budgetForecasting = useMemo(() => {
    if (selectedPeriod !== 'current') return {};

    const referenceDate = getMostRecentTransactionDate;
    const currentMonth = referenceDate.getMonth();
    const currentYear = referenceDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get transactions for the current month to calculate days passed
    const currentMonthTransactions = getFilteredTransactions(financialData.transactions, 'current');
    const uniqueDays = new Set(currentMonthTransactions.map(tx => new Date(tx.date).getDate()));
    const daysPassed = Math.max(uniqueDays.size, 1);

    const forecasts: Record<string, number> = {};

    financialData.budgets.forEach(budget => {
      const category = budget.category;
      const currentSpent = categorySpending[category] || 0;

      // Calculate daily spending rate based on actual days with transactions
      const dailyRate = currentSpent / daysPassed;
      const projectedTotal = dailyRate * daysInMonth;

      forecasts[category] = projectedTotal;
    });

    return forecasts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData.budgets, categorySpending, selectedPeriod, getMostRecentTransactionDate, financialData.transactions]);

  // Get budget data with spending and forecasting
  const budgetData = useMemo(() => {
    return financialData.budgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = budget.budget > 0 ? (spent / budget.budget) * 100 : 0;
      const projected = budgetForecasting[budget.category] || 0;
      const projectedPercentage = budget.budget > 0 ? (projected / budget.budget) * 100 : 0;

      let status: 'good' | 'warning' | 'danger' = 'good';
      if (projectedPercentage >= 100 && selectedPeriod === 'current') {
        status = 'danger';
      } else if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 80 || (projectedPercentage >= 80 && selectedPeriod === 'current')) {
        status = 'warning';
      }

      return {
        ...budget,
        spent,
        percentage,
        projected,
        projectedPercentage,
        status,
        remaining: Math.max(0, budget.budget - spent)
      };
    });
  }, [financialData.budgets, categorySpending, budgetForecasting, selectedPeriod]);

  // Generate actionable advice
  const actionableAdvice = useMemo(() => {
    const advice: Array<{ category: string, tip: string, savings: number }> = [];

    budgetData.forEach(budget => {
      if (budget.status === 'warning' || budget.status === 'danger') {
        const overAmount = budget.spent - budget.budget;

        // Category-specific advice
        switch (budget.category.toLowerCase()) {
          case 'coffee':
            advice.push({
              category: budget.category,
              tip: `Skip 2 coffee runs per week to save $10/week`,
              savings: 40
            });
            break;
          case 'food':
          case 'dining':
            advice.push({
              category: budget.category,
              tip: `Cook 3 meals at home per week instead of eating out`,
              savings: 75
            });
            break;
          case 'shopping':
            advice.push({
              category: budget.category,
              tip: `Wait 24 hours before non-essential purchases`,
              savings: Math.min(overAmount * 0.3, 100)
            });
            break;
          case 'transportation':
            advice.push({
              category: budget.category,
              tip: `Use public transport twice per week`,
              savings: 30
            });
            break;
          case 'entertainment':
            advice.push({
              category: budget.category,
              tip: `Cancel one streaming service subscription`,
              savings: 15
            });
            break;
          default:
            advice.push({
              category: budget.category,
              tip: `Reduce spending by 20% in ${budget.category.toLowerCase()}`,
              savings: Math.max(overAmount * 0.2, 20)
            });
        }
      }
    });

    return advice.sort((a, b) => b.savings - a.savings);
  }, [budgetData]);

  const handleEditBudget = (category: string, currentBudget: number) => {
    setSelectedCategory(category);
    setNewBudgetLimit(currentBudget.toString());
    setEditDialogOpen(true);
  };

  const handleSaveBudget = () => {
    const newLimit = parseFloat(newBudgetLimit);
    if (!isNaN(newLimit) && newLimit > 0) {
      const existingBudget = financialData.budgets.find(b => b.category === selectedCategory);
      if (existingBudget) {
        updateBudget({
          ...existingBudget,
          budget: newLimit
        });
      }
    }
    setEditDialogOpen(false);
    setSelectedCategory('');
    setNewBudgetLimit('');
  };

  // Reset all budgets for new month
  const handleResetBudgets = () => {
    // Reset spent amounts for all budgets
    financialData.budgets.forEach(budget => {
      updateBudget({
        ...budget,
        spent: 0
      });
    });

    // Update the selected period to current to refresh the view
    setSelectedPeriod('current');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.success.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  // Calculate total budget based on income
  const totalBudget = useMemo(() => {
    if (selectedPeriod === 'all') {
      // For all time, use total income from all sources
      const salary = parseFloat(financialData.income.salary) || 0;
      const additionalIncome = parseFloat(financialData.income.additionalIncome) || 0;
      const incomeFromTransactions = financialData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      return salary + additionalIncome + incomeFromTransactions;
    } else {
      // For current/last month/last 3 months, use income from that period
      const filteredTransactions = getFilteredTransactions(financialData.transactions, selectedPeriod === 'current' ? 'current' : selectedPeriod);
      const incomeFromTransactions = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      // Also include monthly salary if it's the current month
      const salary = parseFloat(financialData.income.salary) || 0;
      const additionalIncome = parseFloat(financialData.income.additionalIncome) || 0;

      if (selectedPeriod === 'current') {
        // For current month, include monthly salary and additional income
        return salary + additionalIncome + incomeFromTransactions;
      } else {
        // For other periods, only use transaction-based income
        return incomeFromTransactions;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData.income, financialData.transactions, selectedPeriod]);

  // Calculate total spent - use same method as real-time dashboard for consistency
  const totalSpent = useMemo(() => {
    if (selectedPeriod === 'all') {
      // For all time, sum all expense transactions (same as real-time dashboard)
      return financialData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    } else {
      // For other periods, sum expenses from filtered transactions
      const filteredTransactions = getFilteredTransactions(financialData.transactions, selectedPeriod);
      return filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData.transactions, selectedPeriod]);

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            💰 Budget Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your spending progress and get personalized savings advice
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Time Period Selector */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Time Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <MenuItem value="current">{getMostRecentTransactionDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</MenuItem>
              <MenuItem value="lastMonth">{new Date(getMostRecentTransactionDate.getFullYear(), getMostRecentTransactionDate.getMonth() - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</MenuItem>
              <MenuItem value="last3Months">Last 3 Months</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>

          {/* Reset Budgets Button */}
          <Tooltip title="Reset all budgets for new month">
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetBudgets}
              sx={{
                borderRadius: 2,
                borderColor: alpha(theme.palette.warning.main, 0.5),
                color: theme.palette.warning.main,
                '&:hover': {
                  borderColor: theme.palette.warning.main,
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }
              }}
            >
              Reset Budgets
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Overall Budget Summary */}
      <Card sx={{ mb: 4, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)` }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Overall Budget Progress
              {selectedPeriod === 'current' && ` (${getMostRecentTransactionDate.toLocaleString('default', { month: 'long', year: 'numeric' })})`}
              {selectedPeriod === 'lastMonth' && ` (${new Date(getMostRecentTransactionDate.getFullYear(), getMostRecentTransactionDate.getMonth() - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })})`}
              {selectedPeriod === 'last3Months' && ' (Last 3 Months)'}
              {selectedPeriod === 'all' && ' (All Time)'}
            </Typography>
            <Chip
              label={`${Math.round(overallPercentage)}% Used`}
              color={overallPercentage > 90 ? 'error' : overallPercentage > 75 ? 'warning' : 'success'}
              sx={{ borderRadius: 2 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(overallPercentage, 100)}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  bgcolor: overallPercentage > 90 ? theme.palette.error.main :
                          overallPercentage > 75 ? theme.palette.warning.main :
                          theme.palette.success.main
                }
              }}
            />
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            justifyContent: 'space-between'
          }}>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                ${totalBudget.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPeriod === 'all' ? 'Total Income' : 'Monthly Income'}
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05)
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                ${totalSpent.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPeriod === 'current' && `Spent in ${getMostRecentTransactionDate.toLocaleString('default', { month: 'long' })}`}
                {selectedPeriod === 'lastMonth' && `Spent in ${new Date(getMostRecentTransactionDate.getFullYear(), getMostRecentTransactionDate.getMonth() - 1, 1).toLocaleString('default', { month: 'long' })}`}
                {selectedPeriod === 'last3Months' && 'Spent Last 3 Months'}
                {selectedPeriod === 'all' && 'Total Spent'}
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(totalRemaining >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.05)
            }}>
              <Typography variant="h5" sx={{
                fontWeight: 700,
                color: totalRemaining >= 0 ? theme.palette.success.main : theme.palette.error.main
              }}>
                ${Math.abs(totalRemaining).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalRemaining >= 0 ? 'Remaining' : 'Over Budget'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Category Budget Cards */}
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Category Breakdown
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        {budgetCategories.map((categoryInfo) => {
          const budget = budgetData.find(b => b.category === categoryInfo.name) || {
            category: categoryInfo.name,
            budget: 0,
            spent: 0,
            percentage: 0,
            status: 'good',
            remaining: 0
          };

          return (
            <Box key={categoryInfo.name}>
              <Card sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(getStatusColor(budget.status), 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 25px ${alpha(theme.palette.grey[400], 0.2)}`,
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{
                        bgcolor: alpha(categoryInfo.color, 0.1),
                        color: categoryInfo.color,
                        width: 40,
                        height: 40
                      }}>
                        {categoryInfo.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          {categoryInfo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(budget.percentage)}% used
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(budget.status)}
                      <Tooltip title="Edit Budget">
                        <IconButton
                          size="small"
                          onClick={() => handleEditBudget(budget.category, budget.budget)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budget.percentage, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.grey[300], 0.3),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: getStatusColor(budget.status)
                        }
                      }}
                    />
                    {/* Projected spending overlay for current month */}
                    {selectedPeriod === 'current' && 'projected' in budget && budget.projected > budget.spent && (
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.max(budget.projectedPercentage - budget.percentage, 0), 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mt: -1,
                          position: 'relative',
                          bgcolor: 'transparent',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: budget.projectedPercentage > 100 ? alpha(theme.palette.error.main, 0.5) : alpha(theme.palette.warning.main, 0.5),
                            marginLeft: `${Math.min(budget.percentage, 100)}%`
                          }
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Spent: ${budget.spent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Budget: ${budget.budget.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Projected spending for current month */}
                  {selectedPeriod === 'current' && 'projected' in budget && budget.projected > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: budget.projectedPercentage > 100 ? theme.palette.error.main : theme.palette.warning.main, fontSize: '0.75rem' }}>
                        Projected: ${budget.projected.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: budget.projectedPercentage > 100 ? theme.palette.error.main : theme.palette.warning.main, fontSize: '0.75rem' }}>
                        {Math.round(budget.projectedPercentage)}%
                      </Typography>
                    </Box>
                  )}

                  {budget.status !== 'good' && (
                    <Alert
                      severity={budget.status === 'danger' ? 'error' : 'warning'}
                      sx={{ mt: 2, borderRadius: 2 }}
                      icon={budget.status === 'danger' ? <ErrorIcon /> : <WarningIcon />}
                    >
                      <Typography variant="body2">
                        {budget.status === 'danger'
                          ? selectedPeriod === 'current' && 'projected' in budget && budget.projected > budget.budget
                            ? `Projected to exceed budget by $${Math.abs(budget.projected - budget.budget).toLocaleString()}`
                            : `$${Math.abs(budget.remaining).toLocaleString()} over budget!`
                          : selectedPeriod === 'current' && 'projected' in budget && budget.projected > budget.budget * 0.8
                          ? `$${budget.remaining.toLocaleString()} remaining, but projected to exceed`
                          : `$${budget.remaining.toLocaleString()} remaining`
                        }
                      </Typography>
                    </Alert>
                  )}

                  {/* Legend for projected spending */}
                  {selectedPeriod === 'current' && 'projected' in budget && budget.projected > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                        Actual spending
                      </Typography>
                      {'projected' in budget && budget.projected > budget.spent && (
                        <>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: budget.projectedPercentage > 100 ? theme.palette.error.main : theme.palette.warning.main, opacity: 0.5 }} />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                            Projected
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Actionable Advice */}
      {actionableAdvice.length > 0 && (
        <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.3)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingDownIcon sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                💡 Actionable Savings Advice
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Here are personalized suggestions to help you stay within your budget:
            </Typography>

            <List sx={{ p: 0 }}>
              {actionableAdvice.map((advice, index) => (
                <ListItem key={index} sx={{
                  borderRadius: 2,
                  mb: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <ListItemIcon>
                    <Avatar sx={{
                      bgcolor: theme.palette.info.main,
                      width: 32,
                      height: 32
                    }}>
                      <TrendingDownIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {advice.category}: {advice.tip}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        Save ${advice.savings.toLocaleString()}/month
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Edit Budget Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Edit Budget for {selectedCategory}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Monthly Budget Limit"
            type="number"
            value={newBudgetLimit}
            onChange={(e) => setNewBudgetLimit(e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            inputProps={{
              min: 0,
              step: 10
            }}
            sx={{ mt: 1 }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Setting a budget helps you track spending and get personalized advice when you're approaching your limits.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveBudget}
            variant="contained"
            disabled={!newBudgetLimit || parseFloat(newBudgetLimit) <= 0}
          >
            Save Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetPage;
