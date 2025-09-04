import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Card,
  CardContent,
  Checkbox,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction } from '../../context/FinancialContext';

const TransactionPage: React.FC = () => {
  const theme = useTheme();
  const { financialData, addTransaction, updateTransaction, deleteTransaction, setTransactionData } = useFinancial();

  // State for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Reset form function
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      description: '',
      type: 'expense'
    });
    setFormErrors({});
    setCategorySuggestions([]);
    setAutoSelectedCategory(null);
  };
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [confirmCsvDialogOpen, setConfirmCsvDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditCategory, setBulkEditCategory] = useState('');
  const [categorySuggestions, setCategorySuggestions] = useState<Array<{ category: string, confidence: number, reasoning: string }>>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [autoSelectedCategory, setAutoSelectedCategory] = useState<string | null>(null);

  // State for forms
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    type: 'expense' as 'income' | 'expense'
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');
  const [parsedCsvData, setParsedCsvData] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState('');


  // Intelligence Analysis Functions
  const analyzeTransactions = useMemo(() => {
    const transactions = financialData.transactions;
    if (transactions.length < 3) return null; // Need minimum data for analysis

    const analysis = {
      unusualPurchases: [] as any[],
      duplicates: [] as any[],
      newMerchants: [] as any[],
      knownMerchants: new Set<string>()
    };

    // Step 1: Build merchant history
    transactions.forEach(tx => {
      analysis.knownMerchants.add(tx.description.toLowerCase());
    });

    // Step 2: Analyze for unusual purchases
    const categoryStats: Record<string, { amounts: number[], avg: number, std: number }> = {};

    // Calculate category statistics
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        if (!categoryStats[tx.category]) {
          categoryStats[tx.category] = { amounts: [], avg: 0, std: 0 };
        }
        categoryStats[tx.category].amounts.push(tx.amount);
      }
    });

    // Calculate averages and standard deviations
    Object.keys(categoryStats).forEach(category => {
      const amounts = categoryStats[category].amounts;
      if (amounts.length > 1) {
        const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
        const std = Math.sqrt(variance);

        categoryStats[category].avg = avg;
        categoryStats[category].std = std;
      }
    });

    // Detect unusual purchases
    transactions.forEach((tx, index) => {
      if (tx.type === 'expense' && categoryStats[tx.category]) {
        const stats = categoryStats[tx.category];
        if (stats.amounts.length > 2) {
          const zScore = Math.abs((tx.amount - stats.avg) / stats.std);
          let confidence = 'low';
          let explanation = '';

          if (zScore > 2.5) {
            confidence = 'high';
            explanation = `$${tx.amount.toFixed(2)} is significantly higher than your average ${tx.category.toLowerCase()} spend of $${stats.avg.toFixed(2)}`;
          } else if (zScore > 1.5) {
            confidence = 'medium';
            explanation = `$${tx.amount.toFixed(2)} is higher than your typical ${tx.category.toLowerCase()} spend of $${stats.avg.toFixed(2)}`;
          }

          if (confidence !== 'low') {
            analysis.unusualPurchases.push({
              transaction: tx,
              confidence,
              explanation,
              zScore,
              category: tx.category
            });
          }
        }
      }
    });

    // Step 3: Detect duplicates
    const transactionMap = new Map<string, Transaction[]>();

    transactions.forEach(tx => {
      const key = `${tx.description.toLowerCase()}-${tx.amount}-${tx.date}`;
      if (!transactionMap.has(key)) {
        transactionMap.set(key, []);
      }
      transactionMap.get(key)!.push(tx);
    });

    transactionMap.forEach((txGroup) => {
      if (txGroup.length > 1) {
        const confidence = txGroup.length > 2 ? 'high' : 'medium';
        const explanation = `${txGroup.length} identical transactions found for ${txGroup[0].description} on ${txGroup[0].date}`;

        analysis.duplicates.push({
          transactions: txGroup,
          confidence,
          explanation,
          merchant: txGroup[0].description,
          amount: txGroup[0].amount,
          date: txGroup[0].date
        });
      }
    });

    // Step 4: Detect new merchants (for recently added transactions)
    const recentTransactions = transactions.slice(0, 10); // Check last 10 transactions
    const olderTransactions = transactions.slice(10);

    // Build set of older merchants
    const olderMerchants = new Set<string>();
    olderTransactions.forEach(tx => {
      olderMerchants.add(tx.description.toLowerCase());
    });

    // Check recent transactions for new merchants
    recentTransactions.forEach(tx => {
      if (!olderMerchants.has(tx.description.toLowerCase())) {
        analysis.newMerchants.push({
          transaction: tx,
          confidence: 'medium',
          explanation: `First time transaction with ${tx.description}`,
          merchant: tx.description
        });
      }
    });

    return analysis;
  }, [financialData.transactions]);

  // Get existing categories from current data
  const existingCategories = useMemo(() => {
    const categories = new Set<string>();
    financialData.transactions.forEach(tx => {
      categories.add(tx.category);
    });
    return Array.from(categories);
  }, [financialData.transactions]);

  // Category Suggestion System
  const generateCategorySuggestions = useMemo(() => {
    const merchantCategories: Record<string, { category: string, count: number, confidence: number }> = {};
    const keywordCategories: Record<string, { category: string, count: number }> = {};

    // Analyze historical data
    financialData.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const merchant = tx.description.toLowerCase().trim();

        // Build merchant-to-category mapping
        if (!merchantCategories[merchant]) {
          merchantCategories[merchant] = { category: tx.category, count: 0, confidence: 0 };
        }

        if (merchantCategories[merchant].category === tx.category) {
          merchantCategories[merchant].count++;
          merchantCategories[merchant].confidence = Math.min(merchantCategories[merchant].count / 3, 1); // Max confidence at 3+ occurrences
        }

        // Build keyword patterns
        const words = merchant.split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) { // Skip short words
            if (!keywordCategories[word]) {
              keywordCategories[word] = { category: tx.category, count: 0 };
            }
            if (keywordCategories[word].category === tx.category) {
              keywordCategories[word].count++;
            }
          }
        });
      }
    });

    return { merchantCategories, keywordCategories };
  }, [financialData.transactions]);

  const suggestCategory = (merchantName: string) => {
    const merchant = merchantName.toLowerCase().trim();
    const suggestions: Array<{ category: string, confidence: number, reasoning: string }> = [];

    // Check exact merchant match
    if (generateCategorySuggestions.merchantCategories[merchant]) {
      const match = generateCategorySuggestions.merchantCategories[merchant];
      // Only suggest if category exists in current data
      if (existingCategories.includes(match.category)) {
        suggestions.push({
          category: match.category,
          confidence: match.confidence,
          reasoning: `"${merchantName}" has been categorized as ${match.category} ${match.count} time${match.count > 1 ? 's' : ''} before`
        });
      }
    }

    // Check keyword matches
    const words = merchant.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3 && generateCategorySuggestions.keywordCategories[word]) {
        const keywordMatch = generateCategorySuggestions.keywordCategories[word];
        // Only suggest if category exists in current data
        if (keywordMatch.count >= 2 && existingCategories.includes(keywordMatch.category) && !suggestions.find(s => s.category === keywordMatch.category)) {
          suggestions.push({
            category: keywordMatch.category,
            confidence: Math.min(keywordMatch.count / 5, 0.8), // Lower confidence for keyword matches
            reasoning: `Merchants with "${word}" have been categorized as ${keywordMatch.category} ${keywordMatch.count} times`
          });
        }
      }
    });

    // Only suggest common patterns if the category already exists in the data
    const commonPatterns = [
      { pattern: /(starbucks|coffee|café|cafe|dunkin|tim hortons)/i, category: 'Coffee', reasoning: 'Coffee shop pattern detected' },
      { pattern: /(grocery|whole foods|trader joe|kroger|walmart|target|costco)/i, category: 'Groceries', reasoning: 'Grocery store pattern detected' },
      { pattern: /(uber|lyft|taxi|ride.?share|transport)/i, category: 'Transportation', reasoning: 'Ride-sharing/transport pattern detected' },
      { pattern: /(netflix|hulu|spotify|amazon prime|disney|hbo)/i, category: 'Entertainment', reasoning: 'Streaming service pattern detected' },
      { pattern: /(restaurant|diner|pizza|burger|sushi|italian|mexican)/i, category: 'Dining', reasoning: 'Restaurant/dining pattern detected' },
      { pattern: /(pharmacy|walgreens|cvs|rite aid)/i, category: 'Healthcare', reasoning: 'Pharmacy/healthcare pattern detected' },
      { pattern: /(electric|gas|water|internet|phone|utility|comcast|verizon|att)/i, category: 'Utilities', reasoning: 'Utility bill pattern detected' },
      { pattern: /(gym|yoga|fitness|planet fitness|equinox)/i, category: 'Membership', reasoning: 'Fitness/gym pattern detected' },
      { pattern: /(amazon|ebay|etsy|shopify)/i, category: 'Shopping', reasoning: 'Online shopping pattern detected' }
    ];

    commonPatterns.forEach(({ pattern, category, reasoning }) => {
      // Only suggest if the category exists in current data AND pattern matches
      if (pattern.test(merchant) && existingCategories.includes(category) && !suggestions.find(s => s.category === category)) {
        suggestions.push({
          category,
          confidence: 0.6, // Medium confidence for pattern matches
          reasoning
        });
      }
    });

    // Sort by confidence (highest first)
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  };

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return financialData.transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
      const matchesType = !typeFilter || transaction.type === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financialData.transactions, searchTerm, categoryFilter, typeFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(financialData.transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [financialData.transactions]);

  // Handle table pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const errors = validateTransactionData(formData);
    setFormErrors(errors);

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Prepare transaction data with strict format
    const transactionData = {
      date: formData.date,
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
      category: formData.category.trim(),
      description: formData.description.trim(),
      type: formData.type as 'income' | 'expense'
    };

    try {
      if (editingTransaction) {
        updateTransaction({ ...editingTransaction, ...transactionData });
        setEditDialogOpen(false);
        setEditingTransaction(null);
      } else {
        addTransaction(transactionData);
        setAddDialogOpen(false);
      }

      // Reset form and clear all states
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setFormErrors({ general: 'Failed to save transaction. Please try again.' });
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    resetForm(); // Clear any existing form state
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      amount: Math.abs(transaction.amount).toString(), // Store as positive for form display
      category: transaction.category,
      description: transaction.description,
      type: transaction.type
    });
    setEditDialogOpen(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  // Handle CSV import confirmation
  const handleConfirmCsvImport = () => {
    try {
      setTransactionData(parsedCsvData);
      setCsvSuccess(`Successfully imported ${parsedCsvData.length} transactions from CSV!`);
      setConfirmCsvDialogOpen(false);
      setParsedCsvData([]);
      setCsvFileName('');
      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (importError) {
      setCsvError('Error importing transactions. Please try again.');
      console.error('CSV import error:', importError);
      setConfirmCsvDialogOpen(false);
    }
  };

  // Handle CSV import cancellation
  const handleCancelCsvImport = () => {
    setConfirmCsvDialogOpen(false);
    setParsedCsvData([]);
    setCsvFileName('');
    // Reset file input
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle bulk editing
  const handleBulkEdit = () => {
    if (selectedTransactions.size === 0) return;

    selectedTransactions.forEach(transactionId => {
      const transaction = financialData.transactions.find(t => t.id === transactionId);
      if (transaction) {
        updateTransaction({ ...transaction, category: bulkEditCategory });
      }
    });

    setBulkEditDialogOpen(false);
    setSelectedTransactions(new Set());
    setBulkEditCategory('');
  };

  const handleSelectTransaction = (transactionId: string, selected: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (selected) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  // Enhanced validation for strict data format
  const validateTransactionData = (data: typeof formData) => {
    const errors: Record<string, string> = {};

    // Date validation
    if (!data.date) {
      errors.date = 'Date is required';
    } else {
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        errors.date = 'Invalid date format';
      } else if (dateObj > new Date()) {
        errors.date = 'Date cannot be in the future';
      }
    }

    // Description validation
    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Merchant name is required';
    } else if (data.description.trim().length < 2) {
      errors.description = 'Merchant name must be at least 2 characters';
    } else if (data.description.length > 100) {
      errors.description = 'Merchant name cannot exceed 100 characters';
    }

    // Amount validation
    if (!data.amount) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) {
        errors.amount = 'Amount must be a valid number';
      } else if (amount === 0) {
        errors.amount = 'Amount cannot be zero';
      } else if (Math.abs(amount) > 1000000) {
        errors.amount = 'Amount cannot exceed $1,000,000';
      } else if (amount < 0 && data.type === 'income') {
        errors.amount = 'Income amount must be positive';
      } else if (amount > 0 && data.type === 'expense') {
        errors.amount = 'Expense amount must be negative';
      }
    }

    // Category validation
    if (!data.category.trim()) {
      errors.category = 'Category is required';
    } else if (!categories.includes(data.category) && !['Income', 'Groceries', 'Transportation', 'Entertainment', 'Dining', 'Healthcare', 'Utilities', 'Membership', 'Shopping', 'Coffee', 'Other'].includes(data.category)) {
      errors.category = 'Please select a valid category or use a predefined one';
    }

    // Type validation (should always be valid due to select field)
    if (!['income', 'expense'].includes(data.type)) {
      errors.type = 'Transaction type must be income or expense';
    }

    return errors;
  };

  // Handle merchant name changes for suggestions
  const handleMerchantChange = (merchantName: string) => {
    // Keep original input including spaces, only trim for suggestions
    setFormData({ ...formData, description: merchantName });

    // Clear any existing errors for description
    if (formErrors.description) {
      setFormErrors(prev => ({ ...prev, description: '' }));
    }

    // Use trimmed version for suggestions to avoid issues with trailing spaces
    const trimmedForSuggestions = merchantName.trim();
    if (trimmedForSuggestions) {
      const suggestions = suggestCategory(trimmedForSuggestions);
      setCategorySuggestions(suggestions);

      // Auto-select highest confidence suggestion if confidence > 80%
      if (suggestions.length > 0 && suggestions[0].confidence > 0.8 && !formData.category) {
        setFormData(prev => ({ ...prev, category: suggestions[0].category }));
        setAutoSelectedCategory(suggestions[0].category);
        // Clear auto-selection indicator after 3 seconds
        setTimeout(() => setAutoSelectedCategory(null), 3000);
      }
    } else {
      setCategorySuggestions([]);
    }
  };

  const handleSuggestionClick = (category: string) => {
    setFormData({ ...formData, category });
    setCategorySuggestions([]);
    setAutoSelectedCategory(null);
    // Clear category error if it exists
    if (formErrors.category) {
      setFormErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Handle amount changes with automatic sign adjustment
  const handleAmountChange = (amountStr: string) => {
    let processedAmount = amountStr;

    // Auto-adjust sign based on transaction type
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount !== 0) {
      if (formData.type === 'income' && amount < 0) {
        processedAmount = Math.abs(amount).toString();
      } else if (formData.type === 'expense' && amount > 0) {
        processedAmount = (-Math.abs(amount)).toString();
      }
    }

    setFormData({ ...formData, amount: processedAmount });
  };

  // Handle type changes with amount sign adjustment
  const handleTypeChange = (newType: 'income' | 'expense') => {
    const amount = parseFloat(formData.amount);
    let adjustedAmount = formData.amount;

    if (!isNaN(amount) && amount !== 0) {
      if (newType === 'income' && amount < 0) {
        adjustedAmount = Math.abs(amount).toString();
      } else if (newType === 'expense' && amount > 0) {
        adjustedAmount = (-Math.abs(amount)).toString();
      }
    }

    setFormData({ ...formData, type: newType, amount: adjustedAmount });

    // Refresh category suggestions based on merchant
    if (formData.description.trim()) {
      const suggestions = suggestCategory(formData.description);
      setCategorySuggestions(suggestions);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setCsvFileName(file.name);
      processCsvFile(file);
    }
  };

  const processCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          setCsvError('CSV file must contain at least a header row and one data row.');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

        // Check for required columns
        const requiredColumns = ['date', 'merchant', 'category', 'amount'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          setCsvError(`Missing required columns: ${missingColumns.join(', ')}. Expected format: date, merchant, category, amount`);
          return;
        }

        // Parse transactions
        const transactions = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 4) {
            const [date, merchant, category, amountStr] = values;
            const amount = parseFloat(amountStr);

            if (!date || !merchant || !category || isNaN(amount)) {
              setCsvError(`Invalid data on row ${i + 1}. Please check the format.`);
              return;
            }

            transactions.push({
              date,
              merchant,
              category,
              amount: amountStr
            });
          }
        }

        // Store parsed data and show confirmation dialog
        setParsedCsvData(transactions);
        setCsvDialogOpen(false);
        setConfirmCsvDialogOpen(true);
        setCsvError('');
      } catch (error) {
        setCsvError('Error processing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Sample CSV data
  const sampleCsvData = [
    { date: '2024-01-15', merchant: 'Starbucks', category: 'Coffee', amount: '-5.50' },
    { date: '2024-01-15', merchant: 'Whole Foods', category: 'Groceries', amount: '-85.32' },
    { date: '2024-01-16', merchant: 'Salary Deposit', category: 'Income', amount: '3500.00' },
    { date: '2024-01-16', merchant: 'Netflix', category: 'Entertainment', amount: '-15.99' },
    { date: '2024-01-17', merchant: 'Uber', category: 'Transportation', amount: '-12.50' }
  ];

  const downloadSampleCsv = () => {
    const headers = ['date', 'merchant', 'category', 'amount'];
    const csvContent = [
      headers.join(','),
      ...sampleCsvData.map(row => [row.date, row.merchant, row.category, row.amount].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3, position: 'relative', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Transaction Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, add, edit, and import your financial transactions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }}
          >
            Add Transaction
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={downloadSampleCsv}
            sx={{ borderRadius: 2 }}
          >
            Download Sample
          </Button>
          <Button
            variant="outlined"
            startIcon={<PublishIcon />}
            onClick={() => setCsvDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Upload CSV
          </Button>
        </Box>
      </Box>

      {/* Empty State Banner */}
      {financialData.transactions.length === 0 && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            textAlign: 'center',
            py: 6
          }}
        >
          <CardContent>
            <AddIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              No Transactions Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Start building your financial history by adding your first transaction. You can add individual transactions or import multiple transactions via CSV.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: theme.shadows[4]
                }}
              >
                Add Your First Transaction
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PublishIcon />}
                onClick={() => setCsvDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Import from CSV
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💡 <strong>Quick Tip:</strong> Use the <strong>"Add Transaction"</strong> button above or the <strong>floating + button</strong> to add new transactions
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            <Box sx={{ flex: { xs: '1 1 auto', md: '1 1 0%' }, minWidth: { md: 250 } }}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 200px' } }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 200px' } }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 120px' } }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setTypeFilter('');
                  setPage(0);
                }}
                sx={{ borderRadius: 2, height: 56 }}
              >
                Clear
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Intelligence Insights */}
      {analyzeTransactions && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              🧠 Transaction Intelligence
            </Typography>

            {/* Intelligence Summary */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {analyzeTransactions.unusualPurchases.length > 0 && (
                <Chip
                  icon={<WarningIcon />}
                  label={`${analyzeTransactions.unusualPurchases.length} unusual purchase${analyzeTransactions.unusualPurchases.length > 1 ? 's' : ''}`}
                  size="small"
                  color="warning"
                  sx={{ borderRadius: 1 }}
                />
              )}
              {analyzeTransactions.duplicates.length > 0 && (
                <Chip
                  icon={<ErrorIcon />}
                  label={`${analyzeTransactions.duplicates.length} duplicate group${analyzeTransactions.duplicates.length > 1 ? 's' : ''}`}
                  size="small"
                  color="error"
                  sx={{ borderRadius: 1 }}
                />
              )}
              {analyzeTransactions.newMerchants.length > 0 && (
                <Chip
                  icon={<InfoIcon />}
                  label={`${analyzeTransactions.newMerchants.length} new merchant${analyzeTransactions.newMerchants.length > 1 ? 's' : ''}`}
                  size="small"
                  color="info"
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Unusual Purchases */}
            {analyzeTransactions.unusualPurchases.length > 0 && (
              <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.warning.main, mr: 1 }}>
                      ⚠️ Unusual Purchases
                    </Typography>
                    <Chip
                      label={`${analyzeTransactions.unusualPurchases.length} flagged`}
                      size="small"
                      color="warning"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Transactions that deviate significantly from your normal spending patterns
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: 300,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(theme.palette.background.default, 0.3),
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.warning.main, 0.5),
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.warning.main, 0.7),
                      },
                    },
                  }}>
                    {analyzeTransactions.unusualPurchases.map((item: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.transaction.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(item.transaction.date).toLocaleDateString()} • {item.transaction.category}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                              -${Math.abs(item.transaction.amount).toFixed(2)}
                            </Typography>
                            <Chip
                              label={item.confidence.toUpperCase()}
                              size="small"
                              color={item.confidence === 'high' ? 'error' : item.confidence === 'medium' ? 'warning' : 'info'}
                              sx={{ borderRadius: 1, fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.explanation}
                        </Typography>
                      </Box>
                    ))}

                    {analyzeTransactions.unusualPurchases.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textAlign: 'center',
                          mt: 1,
                          fontStyle: 'italic'
                        }}
                      >
                        Scroll to see all {analyzeTransactions.unusualPurchases.length} items
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Duplicate Transactions */}
            {analyzeTransactions.duplicates.length > 0 && (
              <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.error.main, mr: 1 }}>
                      🔄 Possible Duplicates
                    </Typography>
                    <Chip
                      label={`${analyzeTransactions.duplicates.length} group${analyzeTransactions.duplicates.length > 1 ? 's' : ''}`}
                      size="small"
                      color="error"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Multiple identical transactions that may be duplicates
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: 300,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(theme.palette.background.default, 0.3),
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.error.main, 0.5),
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.7),
                      },
                    },
                  }}>
                    {analyzeTransactions.duplicates.map((item: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.merchant}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(item.date).toLocaleDateString()} • {item.transactions.length} identical transactions
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                              -${Math.abs(item.amount).toFixed(2)} × {item.transactions.length}
                            </Typography>
                            <Chip
                              label={item.confidence.toUpperCase()}
                              size="small"
                              color={item.confidence === 'high' ? 'error' : item.confidence === 'medium' ? 'warning' : 'info'}
                              sx={{ borderRadius: 1, fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.explanation}
                        </Typography>
                      </Box>
                    ))}

                    {analyzeTransactions.duplicates.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textAlign: 'center',
                          mt: 1,
                          fontStyle: 'italic'
                        }}
                      >
                        Scroll to see all {analyzeTransactions.duplicates.length} groups
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* New Merchants */}
            {analyzeTransactions.newMerchants.length > 0 && (
              <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.3)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.info.main, mr: 1 }}>
                      🆕 New Merchants
                    </Typography>
                    <Chip
                      label={`${analyzeTransactions.newMerchants.length} new`}
                      size="small"
                      color="info"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Merchants you've transacted with for the first time
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: 300,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(theme.palette.background.default, 0.3),
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.info.main, 0.5),
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.7),
                      },
                    },
                  }}>
                    {analyzeTransactions.newMerchants.map((item: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.merchant}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(item.transaction.date).toLocaleDateString()} • {item.transaction.category}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: item.transaction.type === 'income' ? theme.palette.success.main : theme.palette.error.main }}>
                              {item.transaction.type === 'income' ? '+' : '-'}${Math.abs(item.transaction.amount).toFixed(2)}
                            </Typography>
                            <Chip
                              label={item.confidence.toUpperCase()}
                              size="small"
                              color="info"
                              sx={{ borderRadius: 1, fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.explanation}
                        </Typography>
                      </Box>
                    ))}

                    {analyzeTransactions.newMerchants.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textAlign: 'center',
                          mt: 1,
                          fontStyle: 'italic'
                        }}
                      >
                        Scroll to see all {analyzeTransactions.newMerchants.length} merchants
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}

      {/* Bulk Actions Bar */}
      {selectedTransactions.size > 0 && (
        <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedTransactions.size} transaction{selectedTransactions.size > 1 ? 's' : ''} selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedTransactions(new Set())}
                  sx={{ borderRadius: 2 }}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setBulkEditDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Bulk Edit Category
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600, py: 2, width: 50 }}>
                    <Checkbox
                      checked={filteredTransactions.length > 0 && selectedTransactions.size === filteredTransactions.length}
                      indeterminate={selectedTransactions.size > 0 && selectedTransactions.size < filteredTransactions.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => {
                    // Check if this transaction is flagged by intelligence
                    const isUnusual = analyzeTransactions?.unusualPurchases.some((item: any) =>
                      item.transaction.id === transaction.id
                    );
                    const isDuplicate = analyzeTransactions?.duplicates.some((item: any) =>
                      item.transactions.some((tx: Transaction) => tx.id === transaction.id)
                    );
                    const isNewMerchant = analyzeTransactions?.newMerchants.some((item: any) =>
                      item.transaction.id === transaction.id
                    );

                    return (
                      <TableRow
                        key={transaction.id}
                        hover
                        sx={{
                          ...(isUnusual && {
                            borderLeft: `4px solid ${theme.palette.warning.main}`,
                            bgcolor: alpha(theme.palette.warning.main, 0.02)
                          }),
                          ...(isDuplicate && {
                            borderLeft: `4px solid ${theme.palette.error.main}`,
                            bgcolor: alpha(theme.palette.error.main, 0.02)
                          }),
                          ...(isNewMerchant && {
                            borderLeft: `4px solid ${theme.palette.info.main}`,
                            bgcolor: alpha(theme.palette.info.main, 0.02)
                          })
                        }}
                      >
                      <TableCell sx={{ px: 1 }}>
                        <Checkbox
                          checked={selectedTransactions.has(transaction.id)}
                          onChange={(e) => handleSelectTransaction(transaction.id, e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {transaction.description}
                          </Typography>
                          {isUnusual && (
                            <Tooltip title="Unusual purchase">
                              <WarningIcon
                                sx={{
                                  fontSize: 16,
                                  color: theme.palette.warning.main
                                }}
                              />
                            </Tooltip>
                          )}
                          {isDuplicate && (
                            <Tooltip title="Possible duplicate">
                              <ErrorIcon
                                sx={{
                                  fontSize: 16,
                                  color: theme.palette.error.main
                                }}
                              />
                            </Tooltip>
                          )}
                          {isNewMerchant && (
                            <Tooltip title="New merchant">
                              <InfoIcon
                                sx={{
                                  fontSize: 16,
                                  color: theme.palette.info.main
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.category}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          size="small"
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          sx={{ borderRadius: 1, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 500 }}>
                        <Typography
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTransaction(transaction)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTransactions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Tooltip title="Add New Transaction" placement="left">
        <Fab
          color="primary"
          aria-label="add transaction"
          onClick={() => setAddDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1300, // Higher than most other elements
            width: 64,
            height: 64,
            boxShadow: theme.shadows[8],
            '&:hover': {
              boxShadow: theme.shadows[12],
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Add/Edit Transaction Dialog */}
      <Dialog
        open={addDialogOpen || editDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
          setEditingTransaction(null);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date) {
                        setFormErrors(prev => ({ ...prev, date: '' }));
                      }
                    }}
                    required
                    error={!!formErrors.date}
                    helperText={formErrors.date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth error={!!formErrors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value as 'income' | 'expense')}
                      label="Type"
                    >
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                    {formErrors.type && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>{formErrors.type}</Typography>}
                  </FormControl>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Merchant Name"
                value={formData.description}
                onChange={(e) => handleMerchantChange(e.target.value)}
                required
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="e.g., Starbucks Coffee, Salary Deposit"
                inputProps={{
                  maxLength: 100,
                  // Allow spaces and special characters
                  pattern: ".*",
                  type: "text"
                }}
              />

              {/* Category Suggestions */}
              {categorySuggestions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    💡 Suggested Categories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {categorySuggestions.slice(0, 3).map((suggestion, index) => (
                      <Tooltip
                        key={index}
                        title={suggestion.reasoning}
                        placement="top"
                      >
                        <Chip
                          label={`${suggestion.category} (${Math.round(suggestion.confidence * 100)}%)`}
                          onClick={() => handleSuggestionClick(suggestion.category)}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: 2,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderColor: theme.palette.primary.main
                            }
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                  {categorySuggestions.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      ... and {categorySuggestions.length - 3} more suggestions
                    </Typography>
                  )}
                </Box>
              )}

              {/* General form error */}
              {formErrors.general && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formErrors.general}
                </Alert>
              )}

              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (formErrors.category) {
                        setFormErrors(prev => ({ ...prev, category: '' }));
                      }
                    }}
                    required
                    error={!!formErrors.category}
                    helperText={formErrors.category}
                    placeholder="e.g., Food, Transportation, Salary"
                    InputProps={{
                      endAdornment: autoSelectedCategory && (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                            Auto-selected
                          </Typography>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => {
                      handleAmountChange(e.target.value);
                      if (formErrors.amount) {
                        setFormErrors(prev => ({ ...prev, amount: '' }));
                      }
                    }}
                    required
                    error={!!formErrors.amount}
                    helperText={formErrors.amount}
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{
                      min: formData.type === 'income' ? 0 : -1000000,
                      max: formData.type === 'income' ? 1000000 : 0,
                      step: 0.01
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
              setEditingTransaction(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.date || !formData.amount || !formData.category || !formData.description}
          >
            {editingTransaction ? 'Update' : 'Add'} Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog
        open={csvDialogOpen}
        onClose={() => {
          setCsvDialogOpen(false);
          setCsvFile(null);
          setCsvError('');
          setCsvSuccess('');
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>Upload CSV File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a CSV file with your transactions. The file must include these columns:
            <strong> date, merchant, category, amount</strong>
          </Typography>

          {csvError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {csvError}
            </Alert>
          )}

          {csvSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {csvSuccess}
            </Alert>
          )}

          <Box
            sx={{
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <PublishIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {csvFile ? csvFile.name : 'Click to upload CSV file'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported format: .csv files only
            </Typography>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ display: 'none' }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Expected CSV Format
          </Typography>
          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[50], 0.5), fontFamily: 'monospace' }}>
            date,merchant,category,amount<br />
            2024-01-15,Starbucks,Coffee,-5.50<br />
            2024-01-15,Whole Foods,Groceries,-85.32<br />
            2024-01-16,Salary Deposit,Income,3500.00
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setCsvDialogOpen(false);
              setCsvFile(null);
              setCsvError('');
              setCsvSuccess('');
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sample Data Dialog */}
      <Dialog
        open={sampleDialogOpen}
        onClose={() => setSampleDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>Sample Transaction Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Here are some sample transactions to help you understand the expected format:
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Merchant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleCsvData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.merchant}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSampleDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={downloadSampleCsv}>
            Download Sample CSV
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Confirmation Dialog */}
      <Dialog
        open={confirmCsvDialogOpen}
        onClose={() => setConfirmCsvDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm CSV Import
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to import <strong>{parsedCsvData.length} transactions</strong> from <strong>{csvFileName}</strong>?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will add the new transactions to your existing data. Here's a preview of the first 5 transactions:
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Merchant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedCsvData.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.merchant}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 500 }}>
                      <Typography
                        color={parseFloat(row.amount) >= 0 ? 'success.main' : 'error.main'}
                      >
                        {parseFloat(row.amount) >= 0 ? '+' : ''}${Math.abs(parseFloat(row.amount)).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {parsedCsvData.length > 5 && (
            <Typography variant="body2" color="text.secondary">
              ... and {parsedCsvData.length - 5} more transactions
            </Typography>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This action cannot be undone. The new transactions will be merged with your existing data.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleCancelCsvImport}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCsvImport}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirm Import ({parsedCsvData.length} transactions)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Bulk Edit Category
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Change the category for <strong>{selectedTransactions.size}</strong> selected transaction{selectedTransactions.size > 1 ? 's' : ''}:
          </Typography>

          <FormControl fullWidth>
            <InputLabel>New Category</InputLabel>
            <Select
              value={bulkEditCategory}
              onChange={(e) => setBulkEditCategory(e.target.value)}
              label="New Category"
            >
              <MenuItem value="">Select a category...</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This action will update the category for all selected transactions.
              This action cannot be undone.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setBulkEditDialogOpen(false);
              setBulkEditCategory('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkEdit}
            variant="contained"
            disabled={!bulkEditCategory}
            color="primary"
          >
            Update {selectedTransactions.size} Transaction{selectedTransactions.size > 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default TransactionPage;
