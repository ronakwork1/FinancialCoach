import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Avatar,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useFinancial } from '../../context/FinancialContext';

interface BudgetCategoryProps {
  category: string;
  spent: number;
  budget: number;
  icon?: React.ReactNode;
  color?: string;
}

const BudgetCategory: React.FC<BudgetCategoryProps> = ({
  category,
  spent,
  budget,
  icon,
  color: propColor
}) => {
  const theme = useTheme();
  const percentage = (spent / budget) * 100;

  let color = propColor || theme.palette.success.main;
  if (!propColor) {
    if (percentage > 90) {
      color = theme.palette.error.main;
    } else if (percentage > 75) {
      color = theme.palette.warning.main;
    } else if (percentage > 50) {
      color = theme.palette.info.main;
    }
  }

  return (
    <Box sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: { xs: 2, sm: 3 },
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
      border: `1px solid ${alpha(color, 0.15)}`,
      boxShadow: `0 2px 8px ${alpha(color, 0.08)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: `0 4px 16px ${alpha(color, 0.12)}`,
        transform: 'translateY(-1px)'
      }
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: { xs: 1.5, sm: 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(color, 0.1),
                border: `1px solid ${alpha(color, 0.2)}`,
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                  color: color
                }
              }}
            >
              {icon}
            </Avatar>
          )}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              color: theme.palette.text.primary,
              textTransform: 'capitalize'
            }}
          >
            {category}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              color: color
            }}
          >
            {percentage.toFixed(0)}%
          </Typography>
          <Typography variant="caption" sx={{ color: color, fontSize: '0.7rem' }}>
            {percentage > 90 ? '🚨' : percentage > 75 ? '⚠️' : '✅'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        width: '100%',
        bgcolor: alpha(theme.palette.grey[200], 0.5),
        height: { xs: 8, sm: 10 },
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: `inset 0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
        mb: 1.5
      }}>
        <Box
          sx={{
            width: `${Math.min(percentage, 100)}%`,
            bgcolor: color,
            height: '100%',
            borderRadius: 5,
            transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: percentage > 90 ? `0 0 8px ${alpha(color, 0.4)}` : 'none'
          }}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500
          }}
        >
          ${spent.toLocaleString()} / ${budget.toLocaleString()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: color,
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}
        >
          {percentage > 90 ? 'Over Budget' : percentage > 75 ? 'Watch Out' : 'Good'}
        </Typography>
      </Box>
    </Box>
  );
};

const BudgetOverview: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const categoryIcons: Record<string, React.ReactNode> = {
      'Food': <RestaurantIcon />,
      'Transportation': <DirectionsCarIcon />,
      'Housing': <HomeIcon />,
      'Healthcare': <LocalHospitalIcon />,
      'Education': <SchoolIcon />,
      'Entertainment': <SportsSoccerIcon />,
      'Shopping': <ShoppingCartIcon />,
      'Utilities': <AccountBalanceWalletIcon />,
      'Other': <AccountBalanceWalletIcon />
    };
    return categoryIcons[category] || <AccountBalanceWalletIcon />;
  };

  // Get color for category
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Food': '#FF6B6B',
      'Transportation': '#4ECDC4',
      'Housing': '#45B7D1',
      'Healthcare': '#FFA726',
      'Education': '#AB47BC',
      'Entertainment': '#66BB6A',
      'Shopping': '#26A69A',
      'Utilities': '#EC407A',
      'Other': '#78909C'
    };
    return categoryColors[category] || theme.palette.primary.main;
  };

  // Calculate budget data from transactions
  const budgetData = useMemo(() => {
    const transactions = financialData.transactions;
    const existingBudgets = financialData.budgets;
    
    // If no transactions, use existing budget data
    if (transactions.length === 0) {
      return existingBudgets;
    }
    
    // Get current month and year
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Group expenses by category for current month
    const categorySpending: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        
        // Only include current month transactions
        if (transactionMonth === currentMonth && transactionYear === currentYear) {
          const category = transaction.category;
          if (!categorySpending[category]) {
            categorySpending[category] = 0;
          }
          categorySpending[category] += transaction.amount;
        }
      }
    });
    
    // Get all unique categories from transactions
    const allCategories = new Set<string>();
    transactions.forEach(t => {
      if (t.type === 'expense') {
        allCategories.add(t.category);
      }
    });
    
    // Map categories to standard budget categories
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
      'education': 'Education'
    };
    
    // Calculate spending by standard categories
    const standardCategorySpending: Record<string, number> = {};
    
    Object.entries(categorySpending).forEach(([category, amount]) => {
      const standardCategory = categoryMapping[category.toLowerCase()] || 'Other';
      if (!standardCategorySpending[standardCategory]) {
        standardCategorySpending[standardCategory] = 0;
      }
      standardCategorySpending[standardCategory] += amount;
    });
    
    // Create or update budget items
    const updatedBudgets = [...existingBudgets];
    
    // Update existing budget categories with actual spending
    updatedBudgets.forEach(budget => {
      const spent = standardCategorySpending[budget.category] || 0;
      budget.spent = spent;
      
      // If no budget set but we have spending, set a reasonable budget
      if (budget.budget === 0 && spent > 0) {
        budget.budget = Math.ceil(spent * 1.2 / 100) * 100; // 20% more than current spending, rounded to nearest 100
      }
    });
    
    // Add any missing categories from transactions
    Object.entries(standardCategorySpending).forEach(([category, spent]) => {
      if (!updatedBudgets.some(b => b.category === category)) {
        const budget = Math.ceil(spent * 1.2 / 100) * 100; // 20% more than current spending, rounded to nearest 100
        updatedBudgets.push({
          category,
          spent,
          budget
        });
      }
    });
    
    // Sort budgets by spending (highest first)
    updatedBudgets.sort((a, b) => b.spent - a.spent);
    
    return updatedBudgets;
  }, [financialData.transactions, financialData.budgets]);
  

  
  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 3, sm: 4 }
    }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        gap: { xs: 2, sm: 3 },
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <Box sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            thickness={4}
            sx={{
              color: alpha(theme.palette.primary.main, 0.2)
            }}
          />
          <CircularProgress
            variant="determinate"
            value={budgetData.length > 0 ? Math.min((budgetData.reduce((sum, b) => sum + b.spent, 0) / budgetData.reduce((sum, b) => sum + b.budget, 0)) * 100, 100) : 0}
            size={120}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              position: 'absolute',
              filter: `drop-shadow(0 0 12px ${alpha(theme.palette.primary.main, 0.3)})`
            }}
          />
          <Box sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.25rem' },
                color: theme.palette.primary.main,
                lineHeight: 1,
                textShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
            >
              ${budgetData.length > 0 ? Math.round(budgetData.reduce((sum, b) => sum + b.spent, 0) / 1000) : 0}K
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              This Month
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Budget Overview
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip
              label={`${budgetData.length} categories`}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={`$${budgetData.reduce((sum, b) => sum + b.budget, 0).toLocaleString()} total budget`}
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Track your spending against budgets to stay financially disciplined and achieve your savings goals.
          </Typography>
        </Box>
      </Box>

      {/* Budget Categories */}
      {budgetData.length > 0 ? (
        <Card sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{
              display: 'grid',
              gap: { xs: 2, sm: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(2, 1fr)'
              }
            }}>
              {budgetData.map((item) => (
                <BudgetCategory
                  key={item.category}
                  category={item.category}
                  spent={item.spent}
                  budget={item.budget}
                  icon={getCategoryIcon(item.category)}
                  color={getCategoryColor(item.category)}
                />
              ))}
            </Box>

            {/* Summary Stats */}
            <Box sx={{
              mt: 3,
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                Budget Summary
              </Typography>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.success.main,
                      fontSize: '1.5rem'
                    }}
                  >
                    ${budgetData.reduce((sum, b) => sum + b.budget, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Budget
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.primary.main,
                      fontSize: '1.5rem'
                    }}
                  >
                    ${budgetData.reduce((sum, b) => sum + b.spent, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Spent This Month
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: budgetData.reduce((sum, b) => sum + b.spent, 0) > budgetData.reduce((sum, b) => sum + b.budget, 0) * 0.9 ? theme.palette.error.main : theme.palette.success.main,
                      fontSize: '1.5rem'
                    }}
                  >
                    ${Math.max(0, budgetData.reduce((sum, b) => sum + b.budget, 0) - budgetData.reduce((sum, b) => sum + b.spent, 0)).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Remaining
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <CardContent sx={{
            p: { xs: 4, sm: 6 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 300
          }}>
            <Box>
              <AccountBalanceWalletIcon sx={{
                fontSize: { xs: 64, sm: 80 },
                color: alpha(theme.palette.text.secondary, 0.3),
                mb: 3
              }} />
              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                No Budget Data Yet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  opacity: 0.8,
                  maxWidth: 400,
                  mx: 'auto'
                }}
              >
                Add some transactions to automatically generate budget recommendations, or manually create budgets to start tracking your spending.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BudgetOverview;