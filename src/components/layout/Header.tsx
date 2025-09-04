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
  Avatar,
  alpha,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface HeaderProps {
  toggleDrawer?: () => void;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleDrawer, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

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
                startIcon={<AccountBalanceWalletIcon />}
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
                startIcon={<PsychologyIcon />}
              >
                AI Coach
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
                onClick={() => onNavigate('insights')}
              >
                Insights
              </Button>
            </Box>
          )}
          
          <IconButton 
            color="inherit" 
            aria-label="notifications" 
            sx={{ ml: 1 }}
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            color="inherit" 
            aria-label="account" 
            edge="end"
            sx={{ ml: 1 }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: theme.palette.secondary.main,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              US
            </Avatar>
          </IconButton>
          
          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 2,
              sx: { 
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  py: 1,
                }
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); }}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1.5 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onNavigate('settings'); }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
              Logout
            </MenuItem>
          </Menu>
          
          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 2,
              sx: { 
                mt: 1.5,
                minWidth: 280,
                maxWidth: 320,
                borderRadius: 2,
                p: 1
              }
            }}
          >
            <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight="medium">Budget Alert</Typography>
                <Typography variant="caption" color="text.secondary">
                  You've reached 90% of your Entertainment budget
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight="medium">New Feature</Typography>
                <Typography variant="caption" color="text.secondary">
                  Try our new AI insights for better financial planning
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight="medium">Tip of the Day</Typography>
                <Typography variant="caption" color="text.secondary">
                  Save 20% of your income for long-term financial security
                </Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;