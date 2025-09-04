import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
  alpha
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface HeaderProps {
  toggleDrawer?: () => void;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleDrawer, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: 'linear-gradient(90deg, #1976d2 0%, #2e7d32 100%)',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ padding: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => onNavigate('dashboard')}
            >
              <Box 
                component="img" 
                src="/logo192.png" 
                alt="Logo" 
                sx={{ 
                  height: 32, 
                  mr: 1,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              Smart Financial Coach
              <LockIcon 
                sx={{ 
                  ml: 1, 
                  fontSize: '1rem',
                  color: theme.palette.secondary.light
                }} 
                aria-label="Your data is secure"
                titleAccess="Your data is secure"
              />
            </Box>
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1)
                  }
                }}
                onClick={() => onNavigate('dashboard')}
                startIcon={
                  <DashboardIcon
                    sx={{
                      color: '#FFD700', // Gold/yellow for dashboard
                      fontSize: '1.2rem'
                    }}
                  />
                }
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1)
                  }
                }}
                onClick={() => onNavigate('transactions')}
                startIcon={
                  <BookIcon
                    sx={{
                      color: '#FF6B6B', // Coral/red for transactions
                      fontSize: '1.2rem'
                    }}
                  />
                }
              >
                Transactions
              </Button>
                            <Button
                color="inherit"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1)
                  }
                }}
                onClick={() => onNavigate('budget')}
                startIcon={
                  <AccountBalanceWalletIcon
                    sx={{
                      color: '#4ECDC4', // Teal for budget
                      fontSize: '1.2rem'
                    }}
                  />
                }
              >
                Budget
              </Button>
              <Button
                color="inherit"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1)
                  }
                }}
                onClick={() => onNavigate('ai-coach')}
                startIcon={
                  <PsychologyIcon
                    sx={{
                      color: '#9B59B6', // Purple for AI Coach
                      fontSize: '1.2rem'
                    }}
                  />
                }
              >
                AI Coach
              </Button>
            </Box>
          )}
          
          
          
          
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;