import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import InsightsIcon from '@mui/icons-material/Insights';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

const AboutPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <InfoIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 2 }} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            About Smart Financial Coach
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Take control of your financial future with AI-powered insights
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          mb: 4
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main, textAlign: 'center' }}>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, textAlign: 'center', maxWidth: 800, mx: 'auto', fontSize: '1.1rem' }}>
          Smart Financial Coach empowers individuals to take control of their financial future through
          intelligent analysis, personalized insights, and user-friendly tools. We believe that everyone
          deserves access to powerful financial management tools without compromising their privacy or security.
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4
        }}
      >
        <Card
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 32, color: theme.palette.success.main, mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                Financial Freedom
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              We help you track expenses, create budgets, and set achievable financial goals.
              Our AI-powered insights provide personalized recommendations to optimize your spending
              and increase your savings rate.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Privacy First
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Your financial data stays on your device. We never collect, store, or transmit your
              personal information. You have complete control over your data with no external dependencies
              or tracking.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InsightsIcon sx={{ fontSize: 32, color: theme.palette.info.main, mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                AI-Powered Insights
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Get intelligent analysis of your spending patterns, budget adherence, and financial health.
              Our algorithms provide actionable recommendations to help you make better financial decisions.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PrivacyTipIcon sx={{ fontSize: 32, color: theme.palette.secondary.main, mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                Free & Accessible
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Smart Financial Coach is completely free with no hidden costs or premium features.
              Works offline and doesn't require any account creation or personal information.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main, textAlign: 'center' }}>
          Key Features
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3
          }}
        >
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                💰 Expense Tracking
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                Easily categorize and track all your expenses with intuitive forms and visual charts.
                Understand where your money goes with detailed spending breakdowns.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                📊 Budget Management
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                Create custom budgets for different expense categories and track your progress
                towards financial goals with visual indicators and alerts.
              </Typography>
            </Box>
          </Box>

          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                🎯 Financial Health Score
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                Get a comprehensive score based on your income vs expenses ratio, savings rate,
                budget adherence, and spending consistency patterns.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                📈 Visual Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                Interactive charts and graphs help you visualize your financial data and trends
                over time, making it easy to spot patterns and opportunities.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Start Your Financial Journey Today
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            Take the first step towards financial freedom. Smart Financial Coach gives you the tools
            and insights you need to make informed decisions about your money, all while keeping your
            data completely private and secure.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
