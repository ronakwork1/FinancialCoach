import React, { useMemo } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { useFinancial } from '../../context/FinancialContext';

interface InsightType {
  text: string;
  type: 'positive' | 'warning' | 'info';
}

interface InsightsCardProps {
  insights: InsightType[];
}

const InsightsCard: React.FC<InsightsCardProps> = ({ insights: propInsights }) => {
  const theme = useTheme();
  const { financialData } = useFinancial();

  // Simple insight generation
  const transactionInsights = useMemo(() => {
    const transactions = financialData.transactions;

    if (transactions.length === 0) {
      return propInsights;
    }

    const insights: InsightType[] = [];

    // Basic spending analysis
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses > 0) {
      insights.push({
        text: `Total spending: $${totalExpenses.toLocaleString()}`,
        type: 'info'
      });
    }

    if (totalIncome > 0) {
      insights.push({
        text: `Total income: $${totalIncome.toLocaleString()}`,
        type: 'positive'
      });
    }

    if (totalIncome > 0 && totalExpenses > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      if (savingsRate > 0) {
        insights.push({
          text: `Savings rate: ${Math.round(savingsRate)}%`,
          type: 'positive'
        });
      } else {
        insights.push({
          text: 'You are spending more than you earn',
          type: 'warning'
        });
      }
    }

    return insights.slice(0, 4);
  }, [financialData.transactions, propInsights]);

  // Get icon based on insight type
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUpIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />;
      case 'info':
      default:
        return <LightbulbIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />;
    }
  };

  const displayInsights = transactionInsights.length > 0 ? transactionInsights : propInsights;

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <LightbulbIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          AI Insights
        </Typography>
        <Chip
          label={`${displayInsights.length} insights`}
          size="small"
          sx={{
            bgcolor: 'rgba(25, 118, 210, 0.1)',
            color: theme.palette.primary.main
          }}
        />
      </Box>

      {/* Insights List */}
      {displayInsights.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
        }}>
          {displayInsights.map((insight, index) => (
            <Box key={index} sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2
            }}>
              <Box sx={{
                flexShrink: 0,
                p: 1,
                borderRadius: 1,
                bgcolor: insight.type === 'positive' ? 'rgba(76, 175, 80, 0.1)' :
                         insight.type === 'warning' ? 'rgba(255, 152, 0, 0.1)' :
                         'rgba(33, 150, 243, 0.1)'
              }}>
                {getIcon(insight.type)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
                  {insight.text}
                </Typography>
                <Chip
                  label={insight.type}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    bgcolor: insight.type === 'positive' ? 'rgba(76, 175, 80, 0.1)' :
                             insight.type === 'warning' ? 'rgba(255, 152, 0, 0.1)' :
                             'rgba(33, 150, 243, 0.1)',
                    color: insight.type === 'positive' ? theme.palette.success.main :
                           insight.type === 'warning' ? theme.palette.warning.main :
                           theme.palette.info.main
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <Box>
            <LightbulbIcon sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
              No Insights Yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
              Add transactions to see AI-powered insights
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default InsightsCard;