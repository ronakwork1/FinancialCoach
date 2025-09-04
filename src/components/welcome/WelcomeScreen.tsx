import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Chip,
  useTheme,
  TextField,
  InputAdornment
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useFinancial } from '../../context/FinancialContext';
import { loadCSVData, exportToCSV } from '../../utils/csvExport';
import SampleDataTable from './SampleDataTable';
import SampleDataDownloader from './SampleDataDownloader';

// Sample data for the table display
const sampleData = [
  { date: '2025-01-02', merchant: 'Uber', category: 'Transport', amount: '18.50' },
  { date: '2025-01-03', merchant: 'Starbucks', category: 'Dining', amount: '5.75' },
  { date: '2025-01-04', merchant: 'Spotify', category: 'Subscriptions', amount: '9.99' },
  { date: '2025-01-06', merchant: 'Whole Foods', category: 'Groceries', amount: '62.30' },
  { date: '2025-01-07', merchant: 'Apple Store', category: 'Shopping', amount: '129.00' },
  { date: '2025-01-08', merchant: 'DoorDash', category: 'Dining', amount: '24.50' }
];

// Sample profiles
const sampleProfiles = [
  { 
    id: 'student', 
    name: 'Student Profile', 
    description: 'Limited income with frequent food delivery and multiple subscriptions',
    path: '/sample-data/student_finances.csv'
  },
  { 
    id: 'freelancer', 
    name: 'Freelancer Profile', 
    description: 'Variable income with ride-hailing expenses and tech purchases',
    path: '/sample-data/freelancer_finances.csv'
  },
  { 
    id: 'professional', 
    name: 'Professional Profile', 
    description: 'Steady salary with premium subscriptions and weekend dining',
    path: '/sample-data/professional_finances.csv'
  }
];

interface WelcomeScreenProps {
  onComplete: (page: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const theme = useTheme();
  const { setTransactionData, updateIncome, clearAllData } = useFinancial();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [isSampleData, setIsSampleData] = useState(false);
  
  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process the uploaded file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setIsSampleData(false);
    
    try {
      // Read the file
      const text = await file.text();
      
      // Basic validation
      const lines = text.split('\n');
      if (lines.length < 2) {
        throw new Error('File appears to be empty or invalid');
      }
      
      // Check headers
      const headers = lines[0].toLowerCase().split(',');
      const requiredHeaders = ['date', 'merchant', 'category', 'amount'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }
      
      // Parse data
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const entry: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            entry[header] = values[index]?.trim() || '';
          });
          
          return entry;
        });
      
      // Additional validation
      for (const row of parsedData) {
        // Check date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
          throw new Error(`Invalid date format: ${row.date}. Expected YYYY-MM-DD`);
        }
        
        // Check amount is a number
        if (isNaN(parseFloat(row.amount))) {
          throw new Error(`Invalid amount: ${row.amount}. Expected a number`);
        }
      }
      
      // Store the parsed data
      setUploadedData(parsedData);
      setActiveStep(1);
      
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Load sample data
  const handleLoadSample = async (profileId: string) => {
    setLoading(true);
    setError(null);
    setIsSampleData(true);

    try {
      const profile = sampleProfiles.find(p => p.id === profileId);
      if (!profile) {
        throw new Error('Sample profile not found');
      }
      
      // Load the sample data
      const data = await loadCSVData(profile.path);
      setUploadedData(data);
      setActiveStep(1);
      
    } catch (err) {
      setError(`Error loading sample data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle income change
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMonthlyIncome(value);
    }
  };

  // Process the data and move to dashboard
  const handleProcessData = () => {
    if (!uploadedData) return;
    
    setLoading(true);
    
    try {
      // Load the data into the app
      setTransactionData(uploadedData);
      
      // Update income if provided
      if (monthlyIncome) {
        const incomeData = {
          salary: monthlyIncome,
          additionalIncome: '',
          frequency: 'monthly'
        };
        updateIncome(incomeData);
      }
      
      // Navigate to dashboard
      setTimeout(() => {
        setLoading(false);
        onComplete('dashboard');
      }, 1000); // Small delay for better UX
      
    } catch (err) {
      setError(`Error processing data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };
  
  // Go back to step 0 and reset everything
  const handleBack = () => {
    clearAllData();
    setActiveStep(0);
    setUploadedData(null);
    setError(null);
    setIsSampleData(false);
    setMonthlyIncome('');
  };
  
  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2, 
          mb: 4,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome to Smart Financial Coach
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Get started by uploading your financial data or using our sample profiles
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          <Step>
            <StepLabel>Upload Data</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review & Confirm</StepLabel>
          </Step>
          <Step>
            <StepLabel>View Dashboard</StepLabel>
          </Step>
        </Stepper>
        
        {/* Privacy Notice */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: theme.palette.primary.main + '08',
            border: `1px solid ${theme.palette.primary.main}20`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Data Privacy
            </Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Your privacy is our priority. All data is processed locally in your browser and never sent to any server.
            We don't track, store, or share your financial information with anyone.
          </Typography>
          <Typography variant="body2">
            You can safely use this application knowing your sensitive financial data remains completely private.
          </Typography>
        </Paper>
        
        {activeStep === 0 ? (
          <>
            {/* Main Action Cards - Primary Actions First */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2, mb: 3 }}>
              <Box sx={{ width: { xs: '100%', md: '50%' }, px: 2, mb: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-2px)',
                      borderColor: theme.palette.primary.main
                    },
                    border: `2px solid ${theme.palette.primary.main}20`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: theme.palette.primary.main,
                      opacity: 0.8
                    }}
                  />
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: theme.palette.primary.main + '15',
                          color: theme.palette.primary.main,
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          mr: 3
                        }}
                      >
                        <CloudUploadIcon sx={{ fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 0 }}>
                          Upload Your Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                          Import your existing financial records
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                      Upload a CSV file with your financial transactions. We'll automatically validate and import your data for analysis.
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleUploadClick}
                        disabled={loading}
                        sx={{
                          mb: 2,
                          py: 2,
                          px: 4,
                          borderRadius: 3,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {loading ? 'Uploading...' : 'Choose CSV File'}
                      </Button>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 280 }}>
                        Supports CSV files with Date, Merchant, Category, and Amount columns
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ width: { xs: '100%', md: '50%' }, px: 2, mb: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-2px)',
                      borderColor: theme.palette.secondary.main
                    },
                    border: `2px solid ${theme.palette.secondary.main}20`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: theme.palette.secondary.main,
                      opacity: 0.8
                    }}
                  />
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: theme.palette.secondary.main + '15',
                          color: theme.palette.secondary.main,
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          mr: 3
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 0 }}>
                          Try Sample Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                          Explore the app with realistic examples
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                      Don't have your own data? Try our sample profiles to see how the app works and explore all features.
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
                      {sampleProfiles.map((profile) => (
                        <Button
                          key={profile.id}
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleLoadSample(profile.id)}
                          disabled={loading}
                          sx={{
                            mb: 2,
                            py: 2,
                            px: 3,
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            '&:hover': {
                              backgroundColor: theme.palette.secondary.main + '10',
                              borderColor: theme.palette.secondary.main,
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {profile.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                              {profile.description}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Data Format Information - Contextual and Collapsible */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                border: `1px solid ${theme.palette.grey[200]}`,
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 2 }}>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <InfoOutlinedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    CSV Format Requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your CSV file should contain these required columns with the exact format shown below.
                  </Typography>
                </Box>

                {/* Sample Data Preview */}
                <Box sx={{ px: 3, pb: 2 }}>
                  <SampleDataTable data={sampleData} />
                </Box>

                {/* Format Requirements */}
                <Box sx={{ px: 3, pb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Column Specifications:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label="Date = YYYY-MM-DD format"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.main + '15',
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    />
                    <Chip
                      label="Merchant = store/company name"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.secondary.main + '15',
                        color: theme.palette.secondary.main,
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    />
                    <Chip
                      label="Category = transaction type"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.success.main + '15',
                        color: theme.palette.success.main,
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    />
                    <Chip
                      label="Amount = number (e.g., 25.99)"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.info.main + '15',
                        color: theme.palette.info.main,
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    />
                  </Box>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => exportToCSV(sampleData, 'sample_template.csv')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Download Template CSV
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Download & Edit Section - Secondary Action */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                border: `1px solid ${theme.palette.grey[200]}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.grey[100],
                      color: theme.palette.grey[700],
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      mr: 3
                    }}
                  >
                    <GetAppIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
                      Need a Starting Template?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Download sample files to customize with your own data
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
                  Download one of our sample files, edit it in Excel or Google Sheets with your own transaction data,
                  then upload the customized version back to the app.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {sampleProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant="outlined"
                      color="inherit"
                      startIcon={<GetAppIcon />}
                      onClick={async () => {
                        try {
                          const response = await fetch(profile.path);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.style.display = 'none';
                          a.href = url;
                          a.download = `${profile.id}_finances.csv`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (error) {
                          console.error('Error downloading sample data:', error);
                        }
                      }}
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: theme.palette.grey[300],
                        '&:hover': {
                          backgroundColor: theme.palette.grey[50],
                          borderColor: theme.palette.grey[400],
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {profile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Download Template
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.95rem'
                  }
                }}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>Upload Error</AlertTitle>
                {error}
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Review & Confirm */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  Review Your Data
                </Typography>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  variant="outlined"
                  color="primary"
                  size="medium"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Back to Options
                </Button>
              </Box>
              
              {uploadedData && (
                <>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <AlertTitle>Data Validated Successfully</AlertTitle>
                    {uploadedData.length} transactions are ready to be imported
                  </Alert>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Merchant</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadedData.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.merchant}</TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell align="right">${parseFloat(row.amount).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {uploadedData.length > 10 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      Showing 10 of {uploadedData.length} transactions
                    </Typography>
                  )}
                </>
              )}
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Enter your monthly income (optional):
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TextField
                  label="Monthly Income"
                  variant="outlined"
                  value={monthlyIncome}
                  onChange={handleIncomeChange}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ width: { xs: '100%', sm: '300px' } }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
                  onClick={handleProcessData}
                  disabled={loading || !uploadedData}
                  sx={{ py: 1.5, px: 4 }}
                >
                  {loading ? 'Processing...' : 'Continue to Dashboard'}
                </Button>
              </Box>
            </Box>
            
            {/* Sample Data Downloader - only show when user uploaded their own file */}
            {!isSampleData && <SampleDataDownloader />}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default WelcomeScreen;
