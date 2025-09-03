import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  useTheme,
  Tooltip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useFinancial } from '../../context/FinancialContext';

interface BudgetCategoryProps {
  category: string;
  spent: number;
  budget: number;
  icon?: React.ReactNode;
}

const BudgetCategory: React.FC<BudgetCategoryProps> = ({ 
  category, 
  spent, 
  budget,
  icon
}) => {
  const theme = useTheme();
  const percentage = (spent / budget) * 100;
  
  let color = theme.palette.success.main;
  if (percentage > 90) {
    color = theme.palette.error.main;
  } else if (percentage > 75) {
    color = theme.palette.warning.main;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 0.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="body2" sx={{ fontWeight: 'medium', ml: icon ? 1 : 0 }}>
            {category}
          </Typography>
        </Box>
        <Tooltip 
          title={`$${spent.toLocaleString()} of $${budget.toLocaleString()}`} 
          arrow
        >
          <Typography variant="body2" color="text.secondary">
            ${spent.toLocaleString()} / ${budget.toLocaleString()}
          </Typography>
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: color,
              },
            }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minWidth: 35 }}
        >
          {Math.round(percentage)}%
        </Typography>
      </Box>
    </Box>
  );
};

const BudgetOverview: React.FC = () => {
  const theme = useTheme();
  const { financialData, updateBudget } = useFinancial();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountBalanceWalletIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Budget Overview
        </Typography>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box>
          {financialData.budgets.slice(0, 3).map((item) => (
            <BudgetCategory
              key={item.category}
              category={item.category}
              spent={item.spent}
              budget={item.budget}
            />
          ))}
        </Box>
        <Box>
          {financialData.budgets.slice(3, 6).map((item) => (
            <BudgetCategory
              key={item.category}
              category={item.category}
              spent={item.spent}
              budget={item.budget}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default BudgetOverview;