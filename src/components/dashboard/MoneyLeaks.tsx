import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MovieIcon from '@mui/icons-material/Movie';
import { useFinancial } from '../../context/FinancialContext';

interface MoneyLeak {
  category: string;
  monthlyCost: number;
  yearlyCost: number;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

const MoneyLeaks: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  // Identify potential money leaks from transaction patterns
  const identifyMoneyLeaks = (): MoneyLeak[] => {
    const leaks: MoneyLeak[] = [];
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    // Analyze transactions for recurring patterns
    financialData.transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const category = tx.category.toLowerCase();
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
          categoryCounts[category] = 0;
        }
        categoryTotals[category] += tx.amount;
        categoryCounts[category] += 1;
      });

    // Define wasteful categories and thresholds
    const wastefulCategories = {
      'coffee': { threshold: 50, suggestion: 'Consider making coffee at home' },
      'fast food': { threshold: 100, suggestion: 'Try meal prepping to reduce fast food expenses' },
      'dining out': { threshold: 150, suggestion: 'Cook more meals at home' },
      'shopping': { threshold: 200, suggestion: 'Track impulse purchases and set limits' },
      'entertainment': { threshold: 100, suggestion: 'Look for free or low-cost entertainment options' },
      'delivery': { threshold: 75, suggestion: 'Cook at home and plan grocery trips' },
      'subscriptions': { threshold: 50, suggestion: 'Review and cancel unused subscriptions' },
      'alcohol': { threshold: 80, suggestion: 'Consider drinking at home or reducing frequency' },
      'taxi': { threshold: 60, suggestion: 'Use public transport or carpool more' }
    };

    // Check for potential leaks
    Object.entries(categoryTotals).forEach(([category, total]) => {
      const wasteInfo = wastefulCategories[category as keyof typeof wastefulCategories];
      if (wasteInfo && total > wasteInfo.threshold) {
        const monthlyCost = total / Math.max(categoryCounts[category], 1);
        const severity = total > wasteInfo.threshold * 2 ? 'high' : total > wasteInfo.threshold * 1.5 ? 'medium' : 'low';

        leaks.push({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          monthlyCost: Math.round(monthlyCost),
          yearlyCost: Math.round(total),
          severity,
          suggestion: wasteInfo.suggestion
        });
      }
    });

    // Sort by severity and monthly cost
    return leaks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.monthlyCost - a.monthlyCost;
    }).slice(0, 5); // Show top 5 leaks
  };

  const moneyLeaks = identifyMoneyLeaks();

  // Get icon for category
  const getLeakIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes('coffee')) {
      return <LocalCafeIcon sx={{ color: theme.palette.warning.main }} />;
    } else if (lowerCategory.includes('fast') || lowerCategory.includes('food')) {
      return <FastfoodIcon sx={{ color: theme.palette.error.main }} />;
    } else if (lowerCategory.includes('shop')) {
      return <ShoppingBagIcon sx={{ color: theme.palette.secondary.main }} />;
    } else if (lowerCategory.includes('entertainment') || lowerCategory.includes('movie')) {
      return <MovieIcon sx={{ color: theme.palette.info.main }} />;
    }
    return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (moneyLeaks.length === 0) {
    return (
      <Box>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          💰 Money Leaks
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Great job! No significant money leaks detected in your spending patterns.
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Keep tracking your expenses to identify potential savings opportunities.
        </Typography>
      </Box>
    );
  }

  const totalMonthlyLeak = moneyLeaks.reduce((sum, leak) => sum + leak.monthlyCost, 0);
  const totalYearlyLeak = moneyLeaks.reduce((sum, leak) => sum + leak.yearlyCost, 0);

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        💰 Money Leaks
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Potential savings:</strong> ${totalMonthlyLeak.toLocaleString()}/month
          (${totalYearlyLeak.toLocaleString()}/year)
        </Typography>
      </Alert>

      <List sx={{ p: 0 }}>
        {moneyLeaks.map((leak, index) => (
          <ListItem
            key={leak.category}
            sx={{
              px: 0,
              py: 1.5,
              borderRadius: 1,
              mb: 1,
              backgroundColor: alpha(getSeverityColor(leak.severity), 0.08),
              border: `1px solid ${alpha(getSeverityColor(leak.severity), 0.2)}`
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getLeakIcon(leak.category)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {leak.category}
                  </Typography>
                  <Chip
                    label={leak.severity.toUpperCase()}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: alpha(getSeverityColor(leak.severity), 0.2),
                      color: getSeverityColor(leak.severity),
                      fontWeight: 600
                    }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ${leak.monthlyCost}/month • ${leak.yearlyCost}/year
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                    💡 {leak.suggestion}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.75rem' }}>
        Based on recurring spending patterns in your transactions
      </Typography>
    </Box>
  );
};

export default MoneyLeaks;
