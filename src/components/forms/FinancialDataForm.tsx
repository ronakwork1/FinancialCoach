import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Snackbar
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SaveIcon from '@mui/icons-material/Save';
import { useFinancial } from '../../context/FinancialContext';

// Form validation types
interface FormErrors {
  [key: string]: string;
}

// Financial data form component
const FinancialDataForm: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Get context data and functions
  const { 
    financialData, 
    updateIncome, 
    updateExpenses, 
    updateSavings 
  } = useFinancial();
  
  // Form state
  const [incomeData, setIncomeData] = useState(financialData.income);
  const [expenseData, setExpenseData] = useState(financialData.expenses);
  const [savingsData, setSavingsData] = useState(financialData.savings);
  
  // Update local state when context data changes
  useEffect(() => {
    setIncomeData(financialData.income);
    setExpenseData(financialData.expenses);
    setSavingsData(financialData.savings);
  }, [financialData]);
  
  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Handle income form changes
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setIncomeData({
        ...incomeData,
        [name]: value,
      });
      
      // Clear error when user types
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };
  
  // Handle expense form changes
  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExpenseData({
        ...expenseData,
        [name]: value,
      });
      
      // Clear error when user types
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };
  
  // Handle savings form changes
  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSavingsData({
        ...savingsData,
        [name]: value,
      });
      
      // Clear error when user types
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };
  
  // Handle frequency change
  const handleFrequencyChange = (e: SelectChangeEvent) => {
    setIncomeData({
      ...incomeData,
      frequency: e.target.value,
    });
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Validate based on active step
    if (activeStep === 0) {
      if (!incomeData.salary) {
        newErrors.salary = 'Salary is required';
      } else if (parseFloat(incomeData.salary) <= 0) {
        newErrors.salary = 'Salary must be greater than 0';
      }
      
      if (incomeData.additionalIncome && parseFloat(incomeData.additionalIncome) < 0) {
        newErrors.additionalIncome = 'Additional income cannot be negative';
      }
    } else if (activeStep === 1) {
      Object.keys(expenseData).forEach((key) => {
        const value = expenseData[key as keyof typeof expenseData];
        if (value && parseFloat(value) < 0) {
          newErrors[key] = 'Amount cannot be negative';
        }
      });
      
      // Validate that at least one expense is entered
      const hasExpense = Object.values(expenseData).some(value => value && parseFloat(value) > 0);
      if (!hasExpense) {
        newErrors.general = 'Please enter at least one expense';
      }
    } else if (activeStep === 2) {
      Object.keys(savingsData).forEach((key) => {
        const value = savingsData[key as keyof typeof savingsData];
        if (value && parseFloat(value) < 0) {
          newErrors[key] = 'Amount cannot be negative';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      // Save data to context when moving to next step
      if (activeStep === 0) {
        updateIncome(incomeData);
      } else if (activeStep === 1) {
        updateExpenses(expenseData);
      }
      
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      // Show error message
      setSnackbarMessage('Please correct the errors before proceeding');
      setSnackbarOpen(true);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save all data to context
      updateIncome(incomeData);
      updateExpenses(expenseData);
      updateSavings(savingsData);
      
      setFormSubmitted(true);
      setSnackbarMessage('Your financial data has been saved successfully!');
      setSnackbarOpen(true);
    } else {
      // Show error message
      setSnackbarMessage('Please correct the errors before submitting');
      setSnackbarOpen(true);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Form steps
  const steps = ['Income', 'Expenses', 'Savings & Goals'];
  
  // Render form content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                required
                fullWidth
                id="salary"
                name="salary"
                label="Monthly Salary"
                value={incomeData.salary}
                onChange={handleIncomeChange}
                error={!!errors.salary}
                helperText={errors.salary}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="additionalIncome"
                name="additionalIncome"
                label="Additional Income"
                value={incomeData.additionalIncome}
                onChange={handleIncomeChange}
                error={!!errors.additionalIncome}
                helperText={errors.additionalIncome}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel id="frequency-label">Income Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                id="frequency"
                value={incomeData.frequency}
                label="Income Frequency"
                onChange={handleFrequencyChange}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="annually">Annually</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {errors.general && (
              <Alert severity="error">{errors.general}</Alert>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                id="housing"
                name="housing"
                label="Housing"
                value={expenseData.housing}
                onChange={handleExpenseChange}
                error={!!errors.housing}
                helperText={errors.housing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="utilities"
                name="utilities"
                label="Utilities"
                value={expenseData.utilities}
                onChange={handleExpenseChange}
                error={!!errors.utilities}
                helperText={errors.utilities}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="groceries"
                name="groceries"
                label="Groceries"
                value={expenseData.groceries}
                onChange={handleExpenseChange}
                error={!!errors.groceries}
                helperText={errors.groceries}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="transportation"
                name="transportation"
                label="Transportation"
                value={expenseData.transportation}
                onChange={handleExpenseChange}
                error={!!errors.transportation}
                helperText={errors.transportation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="healthcare"
                name="healthcare"
                label="Healthcare"
                value={expenseData.healthcare}
                onChange={handleExpenseChange}
                error={!!errors.healthcare}
                helperText={errors.healthcare}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                id="entertainment"
                name="entertainment"
                label="Entertainment"
                value={expenseData.entertainment}
                onChange={handleExpenseChange}
                error={!!errors.entertainment}
                helperText={errors.entertainment}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <TextField
              fullWidth
              id="other"
              name="other"
              label="Other Expenses"
              value={expenseData.other}
              onChange={handleExpenseChange}
              error={!!errors.other}
              helperText={errors.other}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              id="emergencyFund"
              name="emergencyFund"
              label="Emergency Fund"
              value={savingsData.emergencyFund}
              onChange={handleSavingsChange}
              error={!!errors.emergencyFund}
              helperText={errors.emergencyFund || 'Current savings in emergency fund'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              id="retirement"
              name="retirement"
              label="Retirement Savings"
              value={savingsData.retirement}
              onChange={handleSavingsChange}
              error={!!errors.retirement}
              helperText={errors.retirement || 'Current retirement savings'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              id="investments"
              name="investments"
              label="Investments"
              value={savingsData.investments}
              onChange={handleSavingsChange}
              error={!!errors.investments}
              helperText={errors.investments || 'Current investment portfolio value'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              id="goals"
              name="goals"
              label="Savings Goals"
              value={savingsData.goals}
              onChange={handleSavingsChange}
              error={!!errors.goals}
              helperText={errors.goals || 'Target amount for your savings goals'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Enter Your Financial Data
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide your financial information to get personalized insights and recommendations.
        All data stays on your device.
      </Typography>
      
      {formSubmitted ? (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your financial data has been saved successfully!
          </Alert>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => {
              setFormSubmitted(false);
              setActiveStep(0);
            }}
          >
            Edit Data
          </Button>
        </Box>
      ) : (
        <>
          <Stepper activeStep={activeStep} sx={{ mb: 4, pt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button 
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
              )}
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SaveIcon />}
                >
                  Save Data
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
        </>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default FinancialDataForm;