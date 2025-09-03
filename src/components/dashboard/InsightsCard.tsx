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
  Divider
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';

interface InsightsCardProps {
  insights: {
    text: string;
    type: 'positive' | 'warning' | 'info';
  }[];
}

const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
  const theme = useTheme();

  // Get icon based on insight type
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'info':
      default:
        return <LightbulbIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LightbulbIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          AI Insights
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Personalized financial insights based on your spending patterns
      </Typography>
      
      <List sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 1,
        '& .MuiListItem-root': {
          px: 2,
          py: 1.5,
        }
      }}>
        {insights.map((insight, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getIcon(insight.type)}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" component="span">
                      {insight.text}
                    </Typography>
                    <Chip
                      label={insight.type}
                      size="small"
                      color={
                        insight.type === 'positive' ? 'success' :
                        insight.type === 'warning' ? 'warning' : 'info'
                      }
                      sx={{ 
                        height: 20,
                        '& .MuiChip-label': { px: 1, fontSize: '0.625rem' }
                      }}
                    />
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default InsightsCard;