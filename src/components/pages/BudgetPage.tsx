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
import { useFinancial } from '../../context/FinancialContext';

const BudgetPage: React.FC = () => {
  const theme = useTheme();
  const { financialData, updateBudget } = useFinancial();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newBudgetLimit, setNewBudgetLimit] = useState<string>('');

  // Extract unique categories from transaction data and assign icons/colors
  const budgetCategories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    // Get all unique expense categories from transactions (exclude income)
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        uniqueCategories.add(tx.category);
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

  // Calculate spending by category
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};

    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const category = tx.category;
        spending[category] = (spending[category] || 0) + Math.abs(tx.amount);
      }
    });

    return spending;
  }, [financialData.transactions]);

  // Get budget data with spending
  const budgetData = useMemo(() => {
    return financialData.budgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = budget.budget > 0 ? (spent / budget.budget) * 100 : 0;

      let status: 'good' | 'warning' | 'danger' = 'good';
      if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        ...budget,
        spent,
        percentage,
        status,
        remaining: Math.max(0, budget.budget - spent)
      };
    });
  }, [financialData.budgets, categorySpending]);

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

  const totalBudget = budgetData.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = budgetData.reduce((sum, budget) => sum + budget.spent, 0);
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
      </Box>

      {/* Overall Budget Summary */}
      <Card sx={{ mb: 4, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)` }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Overall Budget Progress
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
                Total Budget
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
                Total Spent
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
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Spent: ${budget.spent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Budget: ${budget.budget.toLocaleString()}
                    </Typography>
                  </Box>

                  {budget.status !== 'good' && (
                    <Alert
                      severity={budget.status === 'danger' ? 'error' : 'warning'}
                      sx={{ mt: 2, borderRadius: 2 }}
                      icon={budget.status === 'danger' ? <ErrorIcon /> : <WarningIcon />}
                    >
                      <Typography variant="body2">
                        {budget.status === 'danger'
                          ? `$${Math.abs(budget.remaining).toLocaleString()} over budget!`
                          : `$${budget.remaining.toLocaleString()} remaining`
                        }
                      </Typography>
                    </Alert>
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
