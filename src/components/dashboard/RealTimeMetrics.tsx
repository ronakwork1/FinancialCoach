import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
// Using Box components instead of Grid for layout
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useFinancial } from '../../context/FinancialContext';

const RealTimeMetrics: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  const metrics = useMemo(() => {
    // Calculate total income from both form data and transactions
    const salary = parseFloat(financialData.income.salary) || 0;
    const additionalIncome = parseFloat(financialData.income.additionalIncome) || 0;
    const incomeFromTransactions = financialData.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = salary + additionalIncome + incomeFromTransactions;

    // Calculate total expenses from transactions
    const totalExpenses = financialData.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total savings
    const savings = totalIncome - totalExpenses;

    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Calculate monthly averages
    const months = new Set(
      financialData.transactions.map(t => {
        const date = new Date(t.date);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      })
    ).size || 1;

    const avgMonthlyIncome = totalIncome / months;
    const avgMonthlyExpenses = totalExpenses / months;

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      months
    };
  }, [financialData]);

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    progress
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    progress?: number;
  }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(color, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.04)} 100%)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 28px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3),
        },
        '&:active': {
          transform: 'translateY(-1px)',
          transition: 'all 0.1s ease'
        }
      }}
    >
      <CardContent sx={{
        p: { xs: 2, sm: 3 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 1.5 },
        position: 'relative',
        zIndex: 1,
        height: '100%'
      }}>
        {/* Header with icon and trend */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 1, sm: 1.5 }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 }
          }}>
            <Box sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: '50%',
              bgcolor: alpha(color, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(color, 0.2)}`,
              boxShadow: `0 2px 8px ${alpha(color, 0.1)}`,
            }}>
              <Box sx={{
                color: color,
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: 16, sm: 18 }
                }
              }}>
                {icon}
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                opacity: 0.9
              }}
            >
              {title}
            </Typography>
          </Box>

          {trend && trend !== 'neutral' && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              bgcolor: trend === 'up' ? alpha(theme.palette.success.main, 0.1) :
                      alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${trend === 'up' ? alpha(theme.palette.success.main, 0.2) :
                              alpha(theme.palette.error.main, 0.2)}`
            }}>
              {trend === 'up' ? (
                <TrendingUpIcon sx={{ fontSize: 12, color: theme.palette.success.main }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 12, color: theme.palette.error.main }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main
                }}
              >
                {trend === 'up' ? 'UP' : 'DOWN'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Main value */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          mb: { xs: 1, sm: 1.5 }
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
              lineHeight: 1,
              color: theme.palette.text.primary,
              mb: { xs: 0.5, sm: 1 },
              letterSpacing: '-0.02em'
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: theme.palette.text.secondary,
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Progress bar if provided */}
        {progress !== undefined && (
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Progress
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: theme.palette.text.primary
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(color, 0.15),
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 2,
                  boxShadow: `0 0 6px ${alpha(color, 0.3)}`
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2.5, sm: 3.5 }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: { xs: 2, sm: 3 },
        flexShrink: 0,
        p: { xs: 2, sm: 2.5 },
        borderRadius: { xs: 2, sm: 3 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            mr: { xs: 1.5, sm: 2 },
            width: { xs: 36, sm: 44 },
            height: { xs: 36, sm: 44 },
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <AnalyticsIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              lineHeight: 1.2,
              color: theme.palette.text.primary,
              mb: 0.5,
              letterSpacing: '-0.02em'
            }}
          >
            Real-Time Financial Metrics
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 500,
              opacity: 0.8
            }}
          >
            Live dashboard with key financial indicators
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: '1fr 1fr',
          lg: '1fr 1fr'
        },
        gap: { xs: 2, sm: 2.5, md: 3 },
        flex: 1,
        alignItems: 'stretch',
        maxWidth: '800px',
        mx: 'auto',
        width: '100%'
      }}>
        <MetricCard
          title="Total Income"
          value={`$${metrics.totalIncome.toLocaleString()}`}
          subtitle={`Avg: $${Math.round(metrics.avgMonthlyIncome)}/month`}
          icon={<TrendingUpIcon />}
          color={theme.palette.success.main}
          trend={metrics.totalIncome > metrics.totalExpenses ? 'up' : 'neutral'}
        />

        <MetricCard
          title="Total Expenses"
          value={`$${metrics.totalExpenses.toLocaleString()}`}
          subtitle={`Avg: $${Math.round(metrics.avgMonthlyExpenses)}/month`}
          icon={<CreditCardIcon />}
          color={theme.palette.error.main}
          trend={metrics.totalExpenses > metrics.totalIncome * 0.8 ? 'down' : 'neutral'}
        />

        <MetricCard
          title="Net Savings"
          value={`$${metrics.savings.toLocaleString()}`}
          subtitle={`${metrics.savings >= 0 ? 'Positive' : 'Negative'} cash flow`}
          icon={<SavingsIcon />}
          color={metrics.savings >= 0 ? theme.palette.success.main : theme.palette.error.main}
          trend={metrics.savings >= 0 ? 'up' : 'down'}
          progress={Math.abs(metrics.savingsRate)}
        />

        <MetricCard
          title="Savings Rate"
          value={`${Math.round(metrics.savingsRate)}%`}
          subtitle={`${metrics.savingsRate >= 20 ? 'Excellent' : metrics.savingsRate >= 10 ? 'Good' : 'Needs improvement'}`}
          icon={<AccountBalanceIcon />}
          color={
            metrics.savingsRate >= 20 ? theme.palette.success.main :
            metrics.savingsRate >= 10 ? theme.palette.warning.main :
            theme.palette.error.main
          }
          trend={metrics.savingsRate >= 15 ? 'up' : metrics.savingsRate >= 5 ? 'neutral' : 'down'}
          progress={Math.min(metrics.savingsRate * 5, 100)}
        />
      </Box>

      {/* Live Update Indicator */}
      <Box sx={{
        mt: 'auto',
        p: { xs: 2, sm: 2.5 },
        borderRadius: { xs: 2, sm: 3 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
        border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
        boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.1)}`,
        flexShrink: 0
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box
              sx={{
                width: { xs: 8, sm: 10 },
                height: { xs: 8, sm: 10 },
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                animation: 'pulse 2s infinite',
                boxShadow: `0 0 12px ${alpha(theme.palette.success.main, 0.4)}`,
                flexShrink: 0
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: theme.palette.success.main,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Live
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              lineHeight: 1.4,
              flex: 1,
              minWidth: 0
            }}
          >
            Updates every 30 seconds • {metrics.months} month{metrics.months !== 1 ? 's' : ''} of data tracked
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RealTimeMetrics;
