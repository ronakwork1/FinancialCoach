import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  useTheme,
  alpha,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
// Using Box components instead of Grid for layout
import SpendingChart from './SpendingChart';
import FinancialHealthScore from './FinancialHealthScore';
import TransactionList from './TransactionList';
import SpendingBreakdownChart from './SpendingBreakdownChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import RealTimeMetrics from './RealTimeMetrics';
import Top3ExpenseCategories from './Top3ExpenseCategories';
import MoneyLeaks from './MoneyLeaks';
import { useFinancial } from '../../context/FinancialContext';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface DashboardProps {
  onEnterData?: () => void;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEnterData, onNavigate }) => {
  const theme = useTheme();
  const { financialData, calculateFinancialHealth } = useFinancial();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate financial health score
  const healthScore = calculateFinancialHealth();

  // AI insights functionality removed from dashboard

  // Check if user has entered any financial data
  const hasFinancialData = financialData.transactions.length > 0 || parseFloat(financialData.income.salary) > 0;

  // Loading state for better UX (can be used later for skeleton components)
  // const isLoading = financialData.transactions.length === 0 && parseFloat(financialData.income.salary) === 0;

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleEnterData = () => {
    if (onEnterData) {
      onEnterData();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAddTransaction = () => {
    if (onNavigate) {
      onNavigate('transactions');
    }
  };
  
  return (
    <Box sx={{
      maxWidth: '1200px',
      mx: 'auto',
      p: 3,
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Enhanced Header with Real-time Status */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DashboardIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2.5rem' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Financial Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your financial health and track your progress toward your goals
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
            <Tooltip title="Refresh data">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 16,
                    color: isRefreshing ? theme.palette.primary.main : theme.palette.text.secondary,
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTransaction}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>
      
      {!hasFinancialData ? (
        <Card sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TrendingUpIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.7), mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Welcome to Smart Financial Coach
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                Start your journey to better financial health by entering your income, expenses, and savings information.
                Get personalized insights and track your progress over time.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleEnterData}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5
                }}
              >
                Enter Your Financial Data
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 4,
          width: '100%'
        }}>
          {/* Hero Metrics Row */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            mb: 4,
            width: '100%'
          }}>
            <Card sx={{
              borderRadius: 3,
              flex: { xs: 'none', sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 3, sm: 0 }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <RealTimeMetrics />
              </CardContent>
            </Card>

            <Card sx={{
              borderRadius: 3,
              flex: { xs: 'none', sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              overflow: 'visible'
            }}>
              <CardContent sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <FinancialHealthScore score={healthScore} />
              </CardContent>
            </Card>
          </Box>

          {/* Main Analytics Row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 2
          }}>
            <Card sx={{ borderRadius: 3, height: '100%', width: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <MonthlyTrendsChart />
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, height: '100%', width: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Top3ExpenseCategories />
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, height: '100%', width: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <MoneyLeaks />
              </CardContent>
            </Card>
          </Box>

          {/* Charts Row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 4
          }}>
            <Card sx={{ borderRadius: 3, height: '100%', width: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SpendingChart />
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, height: '100%', width: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SpendingBreakdownChart />
              </CardContent>
            </Card>
          </Box>

          {/* Recent Transactions */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <TransactionList />
            </CardContent>
          </Card>
        </Box>
      )}

    </Box>
  );
};

export default Dashboard;