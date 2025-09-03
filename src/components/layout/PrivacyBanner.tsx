import React, { useState } from 'react';
import { 
  Box, 
  Alert, 
  AlertTitle, 
  IconButton, 
  Collapse,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';

const PrivacyBanner: React.FC = () => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  return (
    <Collapse in={open}>
      <Container maxWidth="lg">
        <Box sx={{ mt: 2 }}>
          <Alert
            severity="info"
            icon={<SecurityIcon fontSize="inherit" sx={{ color: theme.palette.secondary.main }} />}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setOpen(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{
              borderRadius: 3,
              background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.secondary.main,
              },
              py: 1,
              px: 2
            }}
          >
            <AlertTitle sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              Your financial data stays on your device
            </AlertTitle>
            We prioritize your privacy. All your financial information is processed locally and never leaves your device.
            No data is sent to any servers, ensuring complete confidentiality of your sensitive financial information.
          </Alert>
        </Box>
      </Container>
    </Collapse>
  );
};

export default PrivacyBanner;