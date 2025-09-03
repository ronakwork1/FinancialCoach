import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useFinancial } from '../../context/FinancialContext';

const FinancialSummary: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  
  // Calculate financial summary data
  const summaryData = useMemo(() => {
    // Calculate total income
    const salary = parseFloat(financialData.income.salary) || 0;
    const additionalIncome = parseFloat(financialData.income.additionalIncome) || 0;
    const totalIncome = salary + additionalIncome;
    
    // Calculate total expenses
    const totalExpenses = Object.values(financialData.expenses).reduce(
      (sum, value) => sum + (parseFloat(value) || 0), 
      0
    );
    
    // Calculate total savings
    const savings = totalIncome - totalExpenses;
    
    // Calculate total balance (all savings accounts)
    const emergencyFund = parseFloat(financialData.savings.emergencyFund) || 0;
    const retirement = parseFloat(financialData.savings.retirement) || 0;
    const investments = parseFloat(financialData.savings.investments) || 0;
    const savingsGoals = parseFloat(financialData.savings.goals) || 0;
    const totalBalance = emergencyFund + retirement + investments + savingsGoals;
    
    return {
      totalBalance,
      income: totalIncome,
      expenses: totalExpenses,
      savings,
    };
  }, [financialData]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountBalanceIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Financial Summary
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Balance
        </Typography>
        <Typography 
          variant="h4" 
          component="p" 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.dark
          }}
        >
          ${summaryData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon 
              fontSize="small" 
              sx={{ color: theme.palette.success.main, mr: 0.5 }} 
            />
            <Typography variant="body2" color="text.secondary">
              Income
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ fontWeight: 'medium' }}>
            ${summaryData.income.toLocaleString()}
          </Typography>
        </Box>
        
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingDownIcon 
              fontSize="small" 
              sx={{ color: theme.palette.error.main, mr: 0.5 }} 
            />
            <Typography variant="body2" color="text.secondary">
              Expenses
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ fontWeight: 'medium' }}>
            ${summaryData.expenses.toLocaleString()}
          </Typography>
        </Box>
        
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon 
              fontSize="small" 
              sx={{ color: theme.palette.secondary.main, mr: 0.5 }} 
            />
            <Typography variant="body2" color="text.secondary">
              Savings
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ 
              fontWeight: 'medium',
              color: summaryData.savings < 0 ? theme.palette.error.main : 'inherit'
            }}
          >
            ${summaryData.savings.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FinancialSummary;