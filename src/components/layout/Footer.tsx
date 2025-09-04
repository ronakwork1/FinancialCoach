import React from 'react';
import { Box, Container, Typography, Link, Divider, useTheme, alpha } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <SecurityIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
            >
              Smart Financial Coach
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
            Take control of your finances with AI-powered insights. Your data stays on your device.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Link
              component="button"
              onClick={() => onNavigate?.('privacy')}
              underline="none"
              sx={{
                color: theme.palette.primary.main,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Privacy
            </Link>
            <Link
              component="button"
              onClick={() => onNavigate?.('terms')}
              underline="none"
              sx={{
                color: theme.palette.primary.main,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Terms
            </Link>
            <Link
              component="button"
              onClick={() => onNavigate?.('about')}
              underline="none"
              sx={{
                color: theme.palette.primary.main,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              About
            </Link>
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