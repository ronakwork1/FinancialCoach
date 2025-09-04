import React, { useMemo } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useFinancial } from '../../context/FinancialContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyTrendsChart: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    financialData.transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    // If no data, return empty
    if (sortedMonths.length === 0) {
      return {
        labels: [],
        datasets: [],
        trend: 'neutral' as const,
        trendPercentage: 0
      };
    }

    // Calculate trend (compare last 2 months)
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    let trendPercentage = 0;

    if (sortedMonths.length >= 2) {
      const lastMonth = sortedMonths[sortedMonths.length - 1];
      const previousMonth = sortedMonths[sortedMonths.length - 2];

      const lastMonthExpenses = monthlyData[lastMonth].expenses;
      const previousMonthExpenses = monthlyData[previousMonth].expenses;

      if (previousMonthExpenses > 0) {
        trendPercentage = ((lastMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
        trend = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'neutral';
      }
    }

    // Format labels
    const labels = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleString('default', { month: 'short', year: '2-digit' });
    });

    const incomeData = sortedMonths.map(month => monthlyData[month].income);
    const expenseData = sortedMonths.map(month => monthlyData[month].expenses);

    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: alpha(theme.palette.success.main, 0.8),
          borderColor: theme.palette.success.main,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: alpha(theme.palette.error.main, 0.8),
          borderColor: theme.palette.error.main,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
      trend,
      trendPercentage
    };
  }, [financialData.transactions, theme.palette]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: alpha(theme.palette.divider, 0.2),
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(theme.palette.divider, 0.3),
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  if (chartData.labels.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Monthly Trends
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Typography variant="body2" color="text.secondary">
            No transaction data available to show trends
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 2, sm: 3 },
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}>
            <TrendingUpIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 18, sm: 20 } }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.2,
                color: theme.palette.text.primary
              }}
            >
              Monthly Trends
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              Income vs Expenses Over Time
            </Typography>
          </Box>
        </Box>

        {chartData.trend !== 'neutral' && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 3,
            bgcolor: chartData.trend === 'up' ? alpha(theme.palette.error.main, 0.1) :
                    alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${chartData.trend === 'up' ? alpha(theme.palette.error.main, 0.2) :
                            alpha(theme.palette.success.main, 0.2)}`
          }}>
            {chartData.trend === 'up' ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: chartData.trend === 'up' ? theme.palette.error.main : theme.palette.success.main
              }}
            >
              {chartData.trend === 'up' ? '+' : ''}{Math.abs(chartData.trendPercentage).toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Trend Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '0.8rem', sm: '0.875rem' },
          lineHeight: 1.5,
          maxWidth: '600px'
        }}
      >
        {chartData.trend === 'up'
          ? `Spending increased by ${Math.abs(chartData.trendPercentage).toFixed(1)}% compared to last month. Consider reviewing your budget.`
          : chartData.trend === 'down'
          ? `Spending decreased by ${Math.abs(chartData.trendPercentage).toFixed(1)}% compared to last month. Great job on expense management!`
          : 'Spending trend is stable. Continue monitoring your financial habits.'
        }
      </Typography>

      {/* Chart */}
      <Box sx={{
        flex: 1,
        minHeight: { xs: 250, sm: 300 },
        mb: { xs: 2, sm: 3 },
        position: 'relative'
      }}>
        <Bar data={chartData} options={options} />
      </Box>

      {/* Summary Stats */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: { xs: 1.5, sm: 2 },
        flexShrink: 0,
        maxWidth: '600px',
        mx: 'auto',
        width: '100%'
      }}>
        <Box sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          bgcolor: alpha(theme.palette.success.main, 0.08),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha(theme.palette.success.main, 0.15)}`
          }
        }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            Avg Monthly Income
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: theme.palette.success.main,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              lineHeight: 1,
              mb: 0.5
            }}
          >
            ${Math.round(chartData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0) / Math.max(chartData.labels.length, 1)).toLocaleString()}
          </Typography>
          <Box sx={{
            width: '100%',
            height: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.2),
            mt: 1,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.success.main,
              borderRadius: 2
            }
          }} />
        </Box>

        <Box sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          bgcolor: alpha(theme.palette.error.main, 0.08),
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha(theme.palette.error.main, 0.15)}`
          }
        }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            Avg Monthly Expenses
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: theme.palette.error.main,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              lineHeight: 1,
              mb: 0.5
            }}
          >
            ${Math.round(chartData.datasets[1].data.reduce((sum: number, val: number) => sum + val, 0) / Math.max(chartData.labels.length, 1)).toLocaleString()}
          </Typography>
          <Box sx={{
            width: '100%',
            height: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.2),
            mt: 1,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.error.main,
              borderRadius: 2
            }
          }} />
        </Box>
      </Box>
    </Box>
  );
};

export default MonthlyTrendsChart;
