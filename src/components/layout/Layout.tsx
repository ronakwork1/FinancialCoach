import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Drawer, 
  List, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Toolbar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from './Header';
import PrivacyBanner from './PrivacyBanner';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentPage }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'Insights', icon: <InsightsIcon />, page: 'insights' },
    { text: 'Budget', icon: <AccountBalanceWalletIcon />, page: 'budget' },
    { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
    // Hidden item for welcome screen
    { text: 'Welcome', icon: <DashboardIcon />, page: 'welcome', hidden: true },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    if (isMobile) {
      toggleDrawer();
    }
  };

  // Drawer width
  const drawerWidth = 240;

  const drawer = (
    <Box
      sx={{ 
        width: drawerWidth,
        height: '100%',
        background: alpha(theme.palette.primary.main, 0.03)
      }}
      role="presentation"
    >
      <Toolbar /> {/* This creates space for the fixed app bar */}
      <Box sx={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        px: 2,
        background: alpha(theme.palette.primary.main, 0.08)
      }}>
        <Box component="span" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Navigation
        </Box>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {drawerItems.filter(item => !item.hidden).map((item) => (
          <ListItemButton 
            key={item.text}
            onClick={() => handleNavigation(item.page)}
            selected={currentPage === item.page}
            sx={{
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.18),
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: currentPage === item.page ? theme.palette.primary.main : 'inherit',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: currentPage === item.page ? 'medium' : 'regular',
                color: currentPage === item.page ? theme.palette.primary.main : 'inherit'
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Header toggleDrawer={toggleDrawer} onNavigate={onNavigate} />
      
      {/* Fixed sidebar for desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
      
      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={isMobile && drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': { width: drawerWidth },
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed app bar */}
        <PrivacyBanner />
        
        <Container
          maxWidth="xl"
          sx={{
            mt: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 64px - 120px)', // Account for header and footer
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{
            flex: 1,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            {children}
          </Box>
        </Container>
        
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;