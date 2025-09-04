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
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';

const TermsPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <GavelIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 2 }} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Terms of Service
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
          Terms and conditions for using Smart Financial Coach
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
            <DescriptionIcon sx={{ mr: 1, fontSize: 28 }} />
            Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            By accessing and using Smart Financial Coach, you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Service Description
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Smart Financial Coach is a personal financial management tool that helps you track expenses,
            manage budgets, and gain insights into your spending patterns. The service is provided free
            of charge and operates entirely on your local device.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, mb: 2 }}>
            As a user of Smart Financial Coach, you agree to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: theme.palette.text.secondary }}>
            <li>Provide accurate and honest financial information</li>
            <li>Use the application for personal, non-commercial purposes only</li>
            <li>Not attempt to reverse engineer or modify the application</li>
            <li>Respect the privacy of your own financial data</li>
            <li>Not use the service for any illegal or fraudulent activities</li>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Data Storage and Privacy
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            All financial data entered into Smart Financial Coach is stored locally on your device.
            We do not collect, store, or transmit any of your personal information to external servers.
            Your privacy is completely protected as outlined in our Privacy Policy.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            <WarningIcon sx={{ mr: 1, fontSize: 28 }} />
            Disclaimer
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Smart Financial Coach is provided "as is" without any warranties, expressed or implied.
            While we strive to provide accurate financial insights and recommendations, the information
            provided should not be considered as professional financial advice.
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Always consult with qualified financial professionals for personalized financial planning
            and investment advice. Smart Financial Coach is a tool to help you organize and understand
            your personal finances, but it does not guarantee financial success or outcomes.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            In no event shall Smart Financial Coach or its creators be liable for any indirect,
            incidental, special, consequential, or punitive damages, including without limitation,
            loss of profits, data, use, goodwill, or other intangible losses, resulting from your
            use of the service.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Service Availability
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            Smart Financial Coach is provided as a free service and may be discontinued at any time
            without prior notice. We reserve the right to modify or discontinue the service at our
            discretion. However, your data will always remain accessible on your local device.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            Updates to Terms
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
            These terms of service may be updated occasionally to reflect changes in our practices
            or for legal reasons. Continued use of the service after any such changes constitutes
            your acceptance of the new terms.
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsPage;
