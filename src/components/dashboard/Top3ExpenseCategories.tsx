import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useFinancial } from '../../context/FinancialContext';

const Top3ExpenseCategories: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  // Calculate top 3 expense categories from transactions
  const calculateTopCategories = () => {
    const categoryTotals: Record<string, number> = {};

    // Sum up expenses by category from transactions
    financialData.transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = 0;
        }
        categoryTotals[tx.category] += tx.amount;
      });

    // Also include expense data from the manual form
    Object.entries(financialData.expenses).forEach(([category, amount]) => {
      const expenseAmount = parseFloat(amount) || 0;
      if (expenseAmount > 0) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0;
        }
        categoryTotals[categoryName] += expenseAmount;
      }
    });

    // Convert to array and sort by amount descending
    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return sortedCategories;
  };

  const topCategories = calculateTopCategories();

  // Get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes('food') || lowerCategory.includes('grocer')) {
      return <LocalDiningIcon sx={{ color: theme.palette.primary.main }} />;
    } else if (lowerCategory.includes('transport') || lowerCategory.includes('car')) {
      return <DirectionsCarIcon sx={{ color: theme.palette.secondary.main }} />;
    } else if (lowerCategory.includes('shop') || lowerCategory.includes('other')) {
      return <ShoppingCartIcon sx={{ color: theme.palette.warning.main }} />;
    } else if (lowerCategory.includes('hous') || lowerCategory.includes('rent')) {
      return <HomeIcon sx={{ color: theme.palette.info.main }} />;
    } else if (lowerCategory.includes('health') || lowerCategory.includes('medical')) {
      return <MedicalServicesIcon sx={{ color: theme.palette.error.main }} />;
    }
    return <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />;
  };

  if (topCategories.length === 0) {
    return (
      <Box>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Top 3 Expense Categories
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No expense data available yet. Add some transactions to see your top spending categories.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Top 3 Expense Categories
      </Typography>

      <List sx={{ p: 0 }}>
        {topCategories.map((item, index) => (
          <ListItem
            key={item.category}
            sx={{
              px: 0,
              py: 1.5,
              borderRadius: 1,
              mb: 1,
              backgroundColor: alpha(theme.palette.primary.main, index === 0 ? 0.08 : 0.04),
              border: index === 0 ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getCategoryIcon(item.category)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {item.category}
                  </Typography>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main
                    }}
                  />
                </Box>
              }
              secondary={`$${item.amount.toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.75rem' }}>
        Based on your recent transactions and expense data
      </Typography>
    </Box>
  );
};

export default Top3ExpenseCategories;
