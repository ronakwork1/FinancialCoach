import React from 'react';
import { 
  Typography, 
  Paper, 
  Box,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import FinancialSummary from './FinancialSummary';
import SpendingChart from './SpendingChart';
import InsightsCard from './InsightsCard';
import BudgetOverview from './BudgetOverview';
import FinancialHealthScore from './FinancialHealthScore';
import { useFinancial } from '../../context/FinancialContext';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface DashboardProps {
  onEnterData?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEnterData }) => {
  const theme = useTheme();
  const { financialData, calculateFinancialHealth, getInsights } = useFinancial();
  
  // Calculate financial health score
  const healthScore = calculateFinancialHealth();
  
  // Get AI insights
  const insights = getInsights();
  
  // Check if user has entered any financial data
  const hasFinancialData = parseFloat(financialData.income.salary) > 0;
  
  const handleEnterData = () => {
    if (onEnterData) {
      onEnterData();
    }
  };
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 4
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            mb: { xs: 2, sm: 0 }
          }}
        >
          Financial Dashboard
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          }}
        >
          Add Transaction
        </Button>
      </Box>
      
      {!hasFinancialData ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4,
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            background: `linear-gradient(to right bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
            textAlign: 'center',
            mb: 3
          }}
        >
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
                py: 1.5,
                boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              Enter Your Financial Data
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3 
        }}>
          {/* Financial Summary */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%',
              width: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0px 6px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <FinancialSummary />
          </Paper>
          
          {/* Financial Health Score */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%',
              width: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0px 6px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <FinancialHealthScore score={healthScore} />
          </Paper>
          
          {/* Spending Chart - Full width */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              width: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              gridColumn: '1 / -1', // Span all columns
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0px 6px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <SpendingChart />
          </Paper>
          
          {/* Budget Overview - 2/3 width */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              width: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              gridColumn: { xs: '1 / -1', md: '1 / span 1' },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0px 6px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <BudgetOverview />
          </Paper>
          
          {/* AI Insights - 1/3 width */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              width: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0px 6px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <InsightsCard insights={insights} />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;