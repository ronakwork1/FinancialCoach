import React from 'react';
import { Box, Container, Typography, Link, Divider, useTheme, alpha } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: alpha(theme.palette.primary.main, 0.03),
      }}
    >
      <Divider sx={{ mb: 4, opacity: 0.5 }} />
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 1 }}>
              <SecurityIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
              >
                Smart Financial Coach
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350 }}>
              Take control of your finances with AI-powered insights. Your data stays on your device.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Link href="#" underline="none" sx={{ color: theme.palette.primary.main }}>
                Privacy
              </Link>
              <Link href="#" underline="none" sx={{ color: theme.palette.primary.main }}>
                Terms
              </Link>
              <Link href="#" underline="none" sx={{ color: theme.palette.primary.main }}>
                About
              </Link>
            </Box>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 3, sm: 5 },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: theme.palette.text.primary }}>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" color="text.secondary" underline="hover">Dashboard</Link>
                <Link href="#" color="text.secondary" underline="hover">Insights</Link>
                <Link href="#" color="text.secondary" underline="hover">Budget</Link>
                <Link href="#" color="text.secondary" underline="hover">Goals</Link>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: theme.palette.text.primary }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" color="text.secondary" underline="hover">Help Center</Link>
                <Link href="#" color="text.secondary" underline="hover">Financial Tips</Link>
                <Link href="#" color="text.secondary" underline="hover">Blog</Link>
                <Link href="#" color="text.secondary" underline="hover">Contact Us</Link>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Smart Financial Coach. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;