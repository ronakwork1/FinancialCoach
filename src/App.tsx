import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Tab, Tabs, Typography, Paper, Button } from '@mui/material';
import theme from './theme/theme';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import TransactionPage from './components/pages/TransactionPage';
import BudgetPage from './components/pages/BudgetPage';
import AICoachPage from './components/pages/AICoachPage';
import { FinancialProvider } from './context/FinancialContext';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Component to redirect users to transactions page for data entry
interface EnterDataRedirectProps {
  onNavigate: (page: string) => void;
}

const EnterDataRedirect: React.FC<EnterDataRedirectProps> = ({ onNavigate }) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
      Enter Your Financial Data
    </Typography>
    <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
      To add new transactions and financial data, please navigate to the Transactions page.
      This ensures all your data entry happens in one centralized location for better organization.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={() => onNavigate('transactions')}
      sx={{
        px: 4,
        py: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600
      }}
    >
      Go to Transactions Page
    </Button>
  </Box>
);

// Placeholder components for other pages
const InsightsPage: React.FC = () => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <InsightsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        Financial Insights
      </Typography>
    </Box>
    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <Typography variant="h6" gutterBottom>
        Advanced AI Analysis
      </Typography>
      <Typography paragraph>
        This page will provide in-depth analysis of your financial data using artificial intelligence.
        You'll receive personalized recommendations to improve your financial health based on your
        spending patterns, savings habits, and financial goals.
      </Typography>
      <Typography>
        Enter your financial data in the "Enter Data" tab to get started with personalized insights.
      </Typography>
    </Paper>
  </Box>
);

const SettingsPage: React.FC = () => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <SettingsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        Settings
      </Typography>
    </Box>
    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <Typography variant="h6" gutterBottom>
        App Preferences
      </Typography>
      <Typography paragraph>
        This page will allow you to customize your experience with Smart Financial Coach.
        You'll be able to manage your profile, adjust notification settings, and control how your data is stored locally.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Remember: All your financial data is stored securely on your device and never leaves it.
      </Typography>
    </Paper>
  </Box>
);

const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [currentPage, setCurrentPage] = useState('welcome');

  
  // Always show welcome screen on refresh
  useEffect(() => {
    // Remove this line to always show welcome screen
    // const hasVisited = localStorage.getItem('hasVisitedBefore');
    // if (hasVisited) {
    //   setIsFirstVisit(false);
    //   setCurrentPage('dashboard');
    // }
    setCurrentPage('welcome');
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // If navigating to dashboard, set tab to 0
    if (page === 'dashboard') {
      setTabValue(0);
    }
  };
  
  // Handle navigating to transactions page for entering data
  const handleEnterData = () => {
    handleNavigate('transactions');
  };

  // Handle welcome screen completion
  const handleWelcomeComplete = (page: string) => {
    // Mark that user has visited before
    localStorage.setItem('hasVisitedBefore', 'true');
    setCurrentPage(page);
  };

  // Render content based on current page
  const renderContent = () => {
    // Show welcome screen for first visit or if explicitly navigated to
    if (currentPage === 'welcome') {
      return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }
    
    switch (currentPage) {
      case 'dashboard':
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="financial coach tabs"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    minWidth: 100,
                  }
                }}
              >
                <Tab 
                  label="Dashboard" 
                  id="tab-0" 
                  aria-controls="tabpanel-0" 
                />
                <Tab 
                  label="Enter Data" 
                  id="tab-1" 
                  aria-controls="tabpanel-1" 
                />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Dashboard onEnterData={handleEnterData} onNavigate={handleNavigate} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <EnterDataRedirect onNavigate={handleNavigate} />
            </TabPanel>
          </Box>
        );
      case 'insights':
        return <InsightsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'ai-coach':
        return <AICoachPage />;
      case 'transactions':
        return <TransactionPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onEnterData={handleEnterData} onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FinancialProvider>
        <Layout onNavigate={handleNavigate} currentPage={currentPage}>
          {renderContent()}
        </Layout>
      </FinancialProvider>
    </ThemeProvider>
  );
};

export default App;