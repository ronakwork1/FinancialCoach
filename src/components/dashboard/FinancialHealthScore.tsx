import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useFinancial } from '../../context/FinancialContext';

interface FinancialHealthScoreProps {
  score: number;
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ score }) => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  
  // Calculate financial health score based on transactions
  const healthData = useMemo(() => {
    const transactions = financialData.transactions;
    
    // If no transactions, use provided score
    if (transactions.length === 0) {
      return {
        score,
        factors: [
          { name: 'Income vs Expenses', value: 0 },
          { name: 'Savings Rate', value: 0 },
          { name: 'Budget Adherence', value: 0 },
          { name: 'Spending Patterns', value: 0 }
        ]
      };
    }
    
    // Get all dates from transactions (not currently used in calculations)
    
    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });
    
    // If no income from transactions, use income from form data
    if (totalIncome === 0) {
      const salary = parseFloat(financialData.income.salary) || 0;
      const additionalIncome = parseFloat(financialData.income.additionalIncome) || 0;
      totalIncome = salary + additionalIncome;
    }
    
    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    
    // Calculate budget adherence
    const budgetAdherence = financialData.budgets.reduce((sum, budget) => {
      const adherenceScore = budget.budget > 0 ? Math.min(1, budget.budget / Math.max(1, budget.spent)) : 0;
      return sum + adherenceScore;
    }, 0) / Math.max(1, financialData.budgets.length);
    
    // Calculate spending consistency
    // Group expenses by category
    const expensesByCategory: Record<string, number[]> = {};
    const monthlyExpenses: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Initialize if needed
        if (!expensesByCategory[transaction.category]) {
          expensesByCategory[transaction.category] = [];
        }
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = 0;
        }
        
        // Add to category and monthly totals
        expensesByCategory[transaction.category].push(transaction.amount);
        monthlyExpenses[monthKey] += transaction.amount;
      }
    });
    
    // Calculate spending consistency (lower variance is better)
    const monthlyValues = Object.values(monthlyExpenses);
    const avgMonthlyExpense = monthlyValues.reduce((sum, val) => sum + val, 0) / Math.max(1, monthlyValues.length);
    
    const variance = monthlyValues.reduce((sum, val) => sum + Math.pow(val - avgMonthlyExpense, 2), 0) / 
                    Math.max(1, monthlyValues.length);
    
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = avgMonthlyExpense > 0 ? standardDeviation / avgMonthlyExpense : 1;
    
    // Higher score for lower variation
    const consistencyScore = Math.max(0, Math.min(1, 1 - coefficientOfVariation));
    
    // Calculate factor scores (0-25 each)
    const incomeVsExpensesFactor = totalIncome > 0 ? Math.min(25, 25 * (totalIncome / Math.max(totalExpenses, 1))) : 0;
    const savingsRateFactor = Math.min(25, savingsRate * 100);
    const budgetAdherenceFactor = budgetAdherence * 25;
    const consistencyFactor = consistencyScore * 25;
    
    // Calculate total score
    const calculatedScore = Math.min(100, Math.round(
      incomeVsExpensesFactor + 
      savingsRateFactor + 
      budgetAdherenceFactor + 
      consistencyFactor
    ));
    
    return {
      score: calculatedScore,
      factors: [
        { name: 'Income vs Expenses', value: Math.round(incomeVsExpensesFactor) },
        { name: 'Savings Rate', value: Math.round(savingsRateFactor) },
        { name: 'Budget Adherence', value: Math.round(budgetAdherenceFactor) },
        { name: 'Spending Patterns', value: Math.round(consistencyFactor) }
      ]
    };
  }, [financialData.transactions, financialData.income, financialData.budgets, score]);
  
  // Determine score color
  const getScoreColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.info.main;
    if (value >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const scoreColor = getScoreColor(healthData.score);
  
  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 3, sm: 4 },
      width: '100%',
      minWidth: 0
    }}>
      {/* Main Score Display */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        gap: { xs: 2, sm: 3 },
        textAlign: { xs: 'center', sm: 'left' },
        mb: { xs: 2, sm: 3 }
      }}>
        <Box sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: { xs: 120, sm: 140 },
          height: { xs: 120, sm: 140 },
          minWidth: { xs: 120, sm: 140 },
          minHeight: { xs: 120, sm: 140 }
        }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            thickness={5}
            sx={{
              color: alpha(theme.palette.grey[200], 0.4),
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}
          />
          <CircularProgress
            variant="determinate"
            value={healthData.score}
            size={120}
            thickness={5}
            sx={{
              color: scoreColor,
              position: 'absolute',
              width: '100%',
              height: '100%',
              filter: `drop-shadow(0 0 16px ${alpha(scoreColor, 0.4)})`
            }}
          />
          <Box sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
          }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                color: scoreColor,
                lineHeight: 1,
                textShadow: `0 3px 12px ${alpha(scoreColor, 0.5)}`,
                mb: 0.5,
                textAlign: 'center'
              }}
            >
              {healthData.score}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center'
              }}
            >
              Health Score
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Box sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: scoreColor,
              boxShadow: `0 0 16px ${alpha(scoreColor, 0.4)}`
            }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: scoreColor,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              {healthData.score >= 80 ? 'Excellent' :
               healthData.score >= 60 ? 'Good' :
               healthData.score >= 40 ? 'Fair' :
               'Needs Attention'}
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Financial Health Score
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              maxWidth: 500
            }}
          >
            {healthData.score >= 80 ? 'Outstanding financial management! Your score indicates excellent habits across all key areas.' :
             healthData.score >= 60 ? 'Good progress! You\'re on the right track with solid financial practices.' :
             healthData.score >= 40 ? 'Room for improvement. Focus on budgeting and expense tracking to boost your score.' :
             'Action needed. Start by creating a budget and tracking your spending to improve your financial health.'}
          </Typography>
        </Box>
      </Box>

      {/* Factors Breakdown */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Score Breakdown
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, sm: 2.5 }
        }}>
          {healthData.factors.map((factor, index) => (
            <Box key={index} sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
              border: `2px solid ${alpha(getScoreColor(factor.value * 4), 0.25)}`,
              boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.08)}`,
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': {
                boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                transform: 'translateY(-3px)',
                borderColor: alpha(getScoreColor(factor.value * 4), 0.4)
              }
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 2.5 }
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flex: 1
                  }}
                >
                  {factor.name}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexShrink: 0
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: getScoreColor(factor.value * 4),
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {factor.value}/25
                  </Typography>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getScoreColor(factor.value * 4),
                    boxShadow: `0 0 8px ${alpha(getScoreColor(factor.value * 4), 0.6)}`
                  }} />
                </Box>
              </Box>

              <Box sx={{
                width: '100%',
                bgcolor: alpha(theme.palette.grey[200], 0.4),
                height: { xs: 6, sm: 8 },
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: `inset 0 2px 4px ${alpha(theme.palette.common.black, 0.15)}`
              }}>
                <Box
                  sx={{
                    width: `${(factor.value / 25) * 100}%`,
                    bgcolor: getScoreColor(factor.value * 4),
                    height: '100%',
                    borderRadius: 5,
                    transition: 'width 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: `0 0 12px ${alpha(getScoreColor(factor.value * 4), 0.5)}`,
                    position: 'relative',
                    '&::after': factor.value > 20 ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 5,
                      boxShadow: `0 0 20px ${alpha(getScoreColor(factor.value * 4), 0.7)}`,
                      animation: 'pulse 3s infinite'
                    } : {}
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default FinancialHealthScore;
