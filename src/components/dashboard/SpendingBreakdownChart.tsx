import React, { useMemo, useState } from 'react';
import { Box, Typography, useTheme, alpha, Chip, ButtonGroup, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useFinancial } from '../../context/FinancialContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingBreakdownChart: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  const [timeframe, setTimeframe] = useState<'all'>('all');
  const [chartType, setChartType] = useState<'pie' | 'doughnut'>('doughnut');

  const chartData = useMemo(() => {
    // Get all expense transactions (no filtering needed since we only support 'all' timeframe)
    const filteredTransactions = financialData.transactions.filter(transaction => transaction.type === 'expense');

    // Group expenses by category
    const categoryTotals: Record<string, number> = {};

    filteredTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += transaction.amount;
    });

    // Sort by amount and take top 8 categories
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // Calculate total for percentages
    const totalExpenses = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0);

    // Enhanced color palette with gradients
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA726', // Orange
      '#AB47BC', // Purple
      '#66BB6A', // Green
      '#26A69A', // Cyan
      '#EC407A', // Pink
    ];

    const backgroundColors = colors.map(color => alpha(color, 0.85));
    const borderColors = colors.map(color => alpha(color, 0.9));
    const hoverColors = colors.map(color => alpha(color, 0.95));

    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [{
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverBackgroundColor: hoverColors,
        hoverBorderWidth: 3,
        hoverBorderColor: colors,
      }],
      totalExpenses,
      categoryCount: sortedCategories.length,
      timeframe: 'All Time'
    };
  }, [financialData.transactions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
            weight: 'normal' as const,
            family: theme.typography.fontFamily
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const ds = data.datasets[0];
                return {
                  text: `${label} (${Math.round((ds.data[i] / chartData.totalExpenses) * 100)}%)`,
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: ds.borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: alpha(theme.palette.divider, 0.3),
        borderWidth: 2,
        cornerRadius: 12,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13,
          weight: 'normal' as const
        },
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed;
            const percentage = Math.round((value / chartData.totalExpenses) * 100);
            return [
              `Amount: $${value.toLocaleString()}`,
              `Percentage: ${percentage}% of total spending`
            ];
          }
        }
      }
    },
    cutout: chartType === 'doughnut' ? '65%' : '0%',
    elements: {
      arc: {
        borderRadius: 6,
        borderWidth: 2,
      }
    },

  };



  if (chartData.labels.length === 0) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
        p: 4
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
            thickness={3}
            sx={{
              color: alpha(theme.palette.grey[200], 0.4)
            }}
          />
          <Box sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <PieChartIcon sx={{ fontSize: 32, color: alpha(theme.palette.text.secondary, 0.3), mb: 1 }} />
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Spending Breakdown
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              mb: 2
            }}
          >
            No expense data available for the selected timeframe.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              opacity: 0.7,
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Add more transactions to see your spending breakdown analysis.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2.5, sm: 3 }
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
            value={Math.min((chartData.totalExpenses / 10000) * 100, 100)} // Progress based on spending
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
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                color: theme.palette.primary.main,
                lineHeight: 1,
                textShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                mb: 0.5
              }}
            >
              ${Math.round(chartData.totalExpenses / 1000)}K
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Total Spent
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
            Spending Breakdown
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip
              label={chartData.timeframe}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={`${chartData.categoryCount} categories`}
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
            Analyze your spending patterns across different categories to identify opportunities for savings.
          </Typography>
        </Box>
      </Box>

      {/* Time Filter Controls */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 3 },
        alignItems: 'stretch',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        flexWrap: 'wrap'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
          alignItems: { xs: 'flex-start', sm: 'center' },
          flex: { xs: '1 1 100%', sm: '1 1 auto' },
          minWidth: 0
        }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              flexShrink: 0
            }}
          >
            Time Period:
          </Typography>
          <ButtonGroup
            size="small"
            variant="outlined"
            sx={{
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              '& .MuiButton-root': {
                minWidth: { xs: 'auto', sm: '80px' }
              }
            }}
          >
            <Button
              onClick={() => setTimeframe('all')}
              variant={timeframe === 'all' ? 'contained' : 'outlined'}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1,
                flex: { xs: '1 1 auto', sm: 'none' }
              }}
            >
              All Time
            </Button>
          </ButtonGroup>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
          alignItems: { xs: 'flex-start', sm: 'center' },
          flex: { xs: '1 1 100%', sm: '1 1 auto' },
          minWidth: 0
        }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              flexShrink: 0
            }}
          >
            Chart Type:
          </Typography>
          <ButtonGroup
            size="small"
            variant="outlined"
            sx={{
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              '& .MuiButton-root': {
                minWidth: { xs: 'auto', sm: '80px' }
              }
            }}
          >
            <Button
              onClick={() => setChartType('doughnut')}
              variant={chartType === 'doughnut' ? 'contained' : 'outlined'}
              startIcon={<PieChartIcon />}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1,
                flex: { xs: '1 1 auto', sm: 'none' }
              }}
            >
              Donut
            </Button>
            <Button
              onClick={() => setChartType('pie')}
              variant={chartType === 'pie' ? 'contained' : 'outlined'}
              startIcon={<PieChartIcon />}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1,
                flex: { xs: '1 1 auto', sm: 'none' }
              }}
            >
              Pie
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Chart Container */}
      <Card sx={{
        flex: 1,
        borderRadius: 3,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
          <Box sx={{
            height: { xs: 240, sm: 280, md: 320 },
            position: 'relative',
            mb: { xs: 2, sm: 3 }
          }}>
            {chartType === 'doughnut' ? (
              <Doughnut data={chartData} options={options} />
            ) : (
              <Pie data={chartData} options={options} />
            )}
          </Box>

          {/* Summary Stats */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: alpha(chartData.datasets[0]?.backgroundColor[0] || theme.palette.primary.main, 0.1),
              border: `2px solid ${alpha(chartData.datasets[0]?.backgroundColor[0] || theme.palette.primary.main, 0.2)}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Top Category
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                {chartData.labels[0] || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{
                color: chartData.datasets[0]?.backgroundColor[0] || theme.palette.primary.main,
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}>
                ${chartData.datasets[0]?.data[0]?.toLocaleString() || '0'}
              </Typography>
            </Box>

            <Box sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Average per Category
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                ${Math.round(chartData.totalExpenses / Math.max(chartData.categoryCount, 1)).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                {chartData.categoryCount || 0} categories
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SpendingBreakdownChart;
