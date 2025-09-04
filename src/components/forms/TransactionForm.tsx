import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  useTheme,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useFinancial } from '../../context/FinancialContext';
import { exportToCSV } from '../../utils/csvExport';

// Sample data for the table display
const sampleData = [
  { date: '2025-01-02', merchant: 'Uber', category: 'Transport', amount: '18.50' },
  { date: '2025-01-03', merchant: 'Starbucks', category: 'Dining', amount: '5.75' },
  { date: '2025-01-04', merchant: 'Spotify', category: 'Subscriptions', amount: '9.99' },
  { date: '2025-01-06', merchant: 'Whole Foods', category: 'Groceries', amount: '62.30' },
  { date: '2025-01-07', merchant: 'Apple Store', category: 'Shopping', amount: '129.00' },
  { date: '2025-01-08', merchant: 'DoorDash', category: 'Dining', amount: '24.50' }
];

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
}

// Form validation types
interface FormErrors {
  [key: string]: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { addTransaction } = useFinancial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single transaction form
  const [singleTransaction, setSingleTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    type: 'expense' as 'income' | 'expense'
  });

  // Bulk upload state
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Handle single transaction form changes
  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      // Only allow numbers and decimal points
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setSingleTransaction(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setSingleTransaction(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle category change
  const handleCategoryChange = (e: SelectChangeEvent) => {
    setSingleTransaction(prev => ({
      ...prev,
      category: e.target.value,
    }));

    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: '',
      }));
    }
  };

  // Handle type change
  const handleTypeChange = (e: SelectChangeEvent) => {
    setSingleTransaction(prev => ({
      ...prev,
      type: e.target.value as 'income' | 'expense',
    }));
  };

  // Validate single transaction form
  const validateSingleForm = () => {
    const newErrors: FormErrors = {};

    if (!singleTransaction.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!singleTransaction.category) {
      newErrors.category = 'Category is required';
    }

    if (!singleTransaction.amount || parseFloat(singleTransaction.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Check date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(singleTransaction.date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle single transaction submission
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateSingleForm()) {
      setLoading(true);

      try {
        addTransaction({
          date: singleTransaction.date,
          amount: parseFloat(singleTransaction.amount),
          category: singleTransaction.category,
          description: singleTransaction.description,
          type: singleTransaction.type
        });

        // Reset form
        setSingleTransaction({
          date: new Date().toISOString().split('T')[0],
          description: '',
          category: '',
          amount: '',
          type: 'expense'
        });

        setError(null);
        onClose();
      } catch (err) {
        setError('Failed to add transaction');
      } finally {
        setLoading(false);
      }
    }
  };

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
    setUploadedData(null);

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

  // Process bulk upload data
  const handleBulkSubmit = () => {
    if (!uploadedData) return;

    setLoading(true);

    try {
      // Convert and add each transaction
      uploadedData.forEach((csvTx) => {
        const amount = parseFloat(csvTx.amount);
        const isIncome = csvTx.category.toLowerCase() === 'income';

        addTransaction({
          date: csvTx.date,
          amount: amount,
          category: csvTx.category,
          description: csvTx.merchant,
          type: isIncome ? 'income' : 'expense'
        });
      });

      setUploadedData(null);
      setError(null);
      onClose();

    } catch (err) {
      setError(`Error adding transactions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle download sample template
  const handleDownloadTemplate = () => {
    exportToCSV(sampleData, 'transaction_template.csv');
  };

  // Categories for the dropdown
  const categories = [
    'Income',
    'Housing',
    'Utilities',
    'Groceries',
    'Transport',
    'Dining',
    'Shopping',
    'Subscriptions',
    'Healthcare',
    'Entertainment',
    'Education',
    'Other'
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Add Transaction
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1 }}>
        {/* Tab Selection */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={activeTab === 'single' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('single')}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              flex: 1
            }}
          >
            Add Single Transaction
          </Button>
          <Button
            variant={activeTab === 'bulk' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('bulk')}
            startIcon={<CloudUploadIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              flex: 1
            }}
          >
            Upload CSV File
          </Button>
        </Box>

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
            <AlertTitle sx={{ fontWeight: 600 }}>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {activeTab === 'single' ? (
          /* Single Transaction Form */
          <form onSubmit={handleSingleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  required
                  id="date"
                  name="date"
                  label="Date"
                  type="date"
                  value={singleTransaction.date}
                  onChange={handleSingleChange}
                  error={!!errors.date}
                  helperText={errors.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={singleTransaction.category}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <TextField
                fullWidth
                required
                id="description"
                name="description"
                label="Description"
                value={singleTransaction.description}
                onChange={handleSingleChange}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="e.g., Coffee at Starbucks"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  required
                  id="amount"
                  name="amount"
                  label="Amount"
                  value={singleTransaction.amount}
                  onChange={handleSingleChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  placeholder="0.00"
                />
                <FormControl fullWidth>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    value={singleTransaction.type}
                    label="Type"
                    onChange={handleTypeChange}
                  >
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </form>
        ) : (
          /* Bulk Upload Section */
          <Box>
            {!uploadedData ? (
              <Box>
                {/* CSV Format Information */}
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
                      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: theme.palette.primary.main + '08' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Merchant</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                              <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sampleData.slice(0, 3).map((row, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{row.date}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem' }}>{row.merchant}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem' }}>
                                  <Chip
                                    label={row.category}
                                    size="small"
                                    sx={{
                                      height: 24,
                                      fontSize: '0.75rem',
                                      bgcolor: getCategoryColor(row.category, theme),
                                      color: getCategoryTextColor(row.category, theme)
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                  ${parseFloat(row.amount).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
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
                          onClick={handleDownloadTemplate}
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

                {/* Upload Button */}
                <Box sx={{ textAlign: 'center', py: 3 }}>
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
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Supports CSV files with Date, Merchant, Category, and Amount columns
                  </Typography>
                </Box>
              </Box>
            ) : (
              /* Review Uploaded Data */
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>Data Validated Successfully</AlertTitle>
                  {uploadedData.length} transactions are ready to be imported
                </Alert>

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Review Your Data
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                  <Table size="small">
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
                          <TableCell>
                            <Chip
                              label={row.category}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.75rem',
                                bgcolor: getCategoryColor(row.category, theme),
                                color: getCategoryTextColor(row.category, theme)
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">${parseFloat(row.amount).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {uploadedData.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    Showing 10 of {uploadedData.length} transactions
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>

        {activeTab === 'single' ? (
          <Button
            onClick={handleSingleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? undefined : <AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1
            }}
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        ) : (
          uploadedData && (
            <Button
              onClick={handleBulkSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? undefined : <CloudUploadIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              {loading ? 'Importing...' : `Import ${uploadedData.length} Transactions`}
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

// Helper function to get category color
const getCategoryColor = (category: string, theme: any) => {
  const categoryColors: Record<string, string> = {
    'Transport': theme.palette.info.main + '20',
    'Dining': theme.palette.warning.main + '20',
    'Subscriptions': theme.palette.secondary.main + '20',
    'Groceries': theme.palette.success.main + '20',
    'Shopping': theme.palette.error.main + '20',
    'Income': theme.palette.primary.main + '20',
    'Housing': theme.palette.info.dark + '20',
    'Utilities': theme.palette.warning.dark + '20',
    'Healthcare': theme.palette.error.dark + '20',
    'Entertainment': theme.palette.secondary.dark + '20',
    'Education': theme.palette.success.dark + '20'
  };

  return categoryColors[category] || theme.palette.grey[200];
};

// Helper function to get category text color
const getCategoryTextColor = (category: string, theme: any) => {
  const categoryTextColors: Record<string, string> = {
    'Transport': theme.palette.info.main,
    'Dining': theme.palette.warning.main,
    'Subscriptions': theme.palette.secondary.main,
    'Groceries': theme.palette.success.main,
    'Shopping': theme.palette.error.main,
    'Income': theme.palette.primary.main,
    'Housing': theme.palette.info.dark,
    'Utilities': theme.palette.warning.dark,
    'Healthcare': theme.palette.error.dark,
    'Entertainment': theme.palette.secondary.dark,
    'Education': theme.palette.success.dark
  };

  return categoryTextColors[category] || theme.palette.text.primary;
};

export default TransactionForm;
