import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  useTheme,
  Tooltip,
  Paper
} from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

interface FinancialHealthScoreProps {
  score: number;
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ score }) => {
  const theme = useTheme();
  
  // Determine score details
  const scoreDetails = [
    { category: 'Savings', score: Math.min(score + 7, 100) },
    { category: 'Debt', score: Math.min(score - 8, 100) },
    { category: 'Spending', score: Math.min(score - 13, 100) },
    { category: 'Investments', score: Math.min(score + 12, 100) },
  ];
  
  // Determine color based on score
  let scoreColor = theme.palette.error.main;
  if (score >= 80) {
    scoreColor = theme.palette.success.main;
  } else if (score >= 60) {
    scoreColor = theme.palette.warning.main;
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HealthAndSafetyIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Financial Health
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-around',
        mb: 2
      }}>
        <Box sx={{ 
          position: 'relative', 
          display: 'inline-flex',
          mb: { xs: 3, sm: 0 }
        }}>
          <CircularProgress
            variant="determinate"
            value={score}
            size={120}
            thickness={5}
            sx={{
              color: scoreColor,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="div"
              color="text.primary"
              sx={{ fontWeight: 'bold' }}
            >
              {score}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your financial health score is
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ 
              fontWeight: 'bold',
              color: scoreColor,
              mb: 1
            }}
          >
            {score >= 80 ? 'Excellent' : 
             score >= 60 ? 'Good' : 
             score >= 40 ? 'Fair' : 'Needs Attention'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Based on your savings, debt, spending habits, and investments
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Score Breakdown
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {scoreDetails.map((detail) => (
            <Tooltip 
              key={detail.category}
              title={`${detail.category}: ${detail.score}/100`}
              arrow
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  width: '22%',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                  {detail.category}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: detail.score >= 80 ? theme.palette.success.main :
                           detail.score >= 60 ? theme.palette.warning.main :
                           theme.palette.error.main
                  }}
                >
                  {detail.score}
                </Typography>
              </Paper>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FinancialHealthScore;