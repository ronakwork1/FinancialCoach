import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import { useFinancial } from '../../context/FinancialContext';

const SavingsGoalTracker: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  const savingsData = useMemo(() => {
    const emergencyFund = parseFloat(financialData.savings.emergencyFund) || 0;
    const retirement = parseFloat(financialData.savings.retirement) || 0;
    const investments = parseFloat(financialData.savings.investments) || 0;
    const goals = parseFloat(financialData.savings.goals) || 0;

    const totalSaved = emergencyFund + retirement + investments + goals;

    // Calculate monthly income for goal recommendations
    const monthlyIncome = parseFloat(financialData.income.salary) || 0;

    // Define savings goals with recommendations
    const goalsList = [
      {
        id: 'emergency',
        name: 'Emergency Fund',
        current: emergencyFund,
        target: monthlyIncome * 6, // 6 months of expenses
        description: '6 months of living expenses',
        priority: 'high',
        color: theme.palette.warning.main
      },
      {
        id: 'retirement',
        name: 'Retirement',
        current: retirement,
        target: monthlyIncome * 12, // 1 year of income
        description: '1 year of annual income',
        priority: 'high',
        color: theme.palette.primary.main
      },
      {
        id: 'investments',
        name: 'Investments',
        current: investments,
        target: monthlyIncome * 3, // 3 months of income
        description: '3 months of annual income',
        priority: 'medium',
        color: theme.palette.success.main
      },
      {
        id: 'goals',
        name: 'Financial Goals',
        current: goals,
        target: monthlyIncome * 2, // 2 months of income
        description: '2 months of annual income',
        priority: 'medium',
        color: theme.palette.info.main
      }
    ];

    // Calculate overall progress
    const totalTarget = goalsList.reduce((sum, goal) => sum + goal.target, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      goalsList,
      totalSaved,
      totalTarget,
      overallProgress,
      monthlyIncome
    };
  }, [financialData, theme.palette]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      default: return theme.palette.success.main;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SavingsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Savings Goals
          </Typography>
        </Box>

        <Tooltip title="Edit savings goals">
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Overall Progress */}
      <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Overall Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(savingsData.overallProgress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(savingsData.overallProgress, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              bgcolor: theme.palette.primary.main,
              borderRadius: 4
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ${savingsData.totalSaved.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ${savingsData.totalTarget.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Individual Goals */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {savingsData.goalsList.map((goal) => {
          const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
          const remaining = goal.target - goal.current;
          const isCompleted = progress >= 100;

          return (
            <Box
              key={goal.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(goal.color, 0.2)}`,
                bgcolor: alpha(goal.color, 0.02),
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(goal.color, 0.05),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(goal.color, 0.1)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {goal.name}
                    </Typography>
                    <Chip
                      label={goal.priority}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: alpha(getPriorityColor(goal.priority), 0.1),
                        color: getPriorityColor(goal.priority),
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {goal.description}
                  </Typography>
                </Box>

                {isCompleted && (
                  <FlagIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: goal.color }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(goal.color, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: goal.color,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              {!isCompleted && remaining > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(remaining)} remaining to reach goal
                </Typography>
              )}

              {isCompleted && (
                <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
                  🎉 Goal achieved!
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Update Savings
        </Button>
      </Box>
    </Box>
  );
};

export default SavingsGoalTracker;
