import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import SecurityIcon from '@mui/icons-material/Security';
import DataUsageIcon from '@mui/icons-material/DataUsage';

const PrivacyPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <PrivacyTipIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 2 }} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Privacy Policy
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
          Your financial data privacy and security are our top priorities
        </Typography>
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            <SecurityIcon sx={{ mr: 1, fontSize: 28 }} />
            Data Security First
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Smart Financial Coach is designed with privacy in mind. All your financial data is stored
            securely on your device and never transmitted to external servers. Your personal information
            and transaction history remain completely private and under your control.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            <DataUsageIcon sx={{ mr: 1, fontSize: 28 }} />
            What We Don't Collect
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, mb: 2 }}>
            We do not collect, store, or transmit any of your personal information:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.secondary }}>
            <li>Personal identifiable information (name, email, phone, etc.)</li>
            <li>Bank account details or login credentials</li>
            <li>Transaction data or financial information</li>
            <li>Location data or device information</li>
            <li>Usage analytics or tracking data</li>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Local Storage Only
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            All data you enter into Smart Financial Coach is stored locally on your device using
            browser's local storage. This means:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.secondary }}>
            <li>Your data never leaves your device</li>
            <li>No internet connection required for basic functionality</li>
            <li>You have complete control over your data</li>
            <li>Data can be easily cleared by clearing browser storage</li>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Smart Financial Coach does not integrate with any third-party services or APIs that could
            access your financial data. The app works entirely offline and independently.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Your Rights
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Since all your data is stored locally on your device, you have complete control over it:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.secondary }}>
            <li>View and manage your data at any time</li>
            <li>Export your data for backup purposes</li>
            <li>Delete all data by clearing browser storage</li>
            <li>Use the app without providing any personal information</li>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Updates to This Policy
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            This privacy policy may be updated occasionally to reflect changes in our practices or
            for legal reasons. Any updates will be communicated through the app or our website.
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;
