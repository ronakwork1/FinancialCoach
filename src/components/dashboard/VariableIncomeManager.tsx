import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useFinancial } from '../../context/FinancialContext';
import { VariableIncome } from '../../context/FinancialContext';

const VariableIncomeManager: React.FC = () => {
  const theme = useTheme();
  const { financialData, addVariableIncome, updateVariableIncome, deleteVariableIncome } = useFinancial();
  const [open, setOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<VariableIncome | null>(null);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    amount: '',
    description: '',
    type: 'salary' as VariableIncome['type']
  });

  const handleOpen = (income?: VariableIncome) => {
    if (income) {
      setEditingIncome(income);
      setFormData({
        month: income.month,
        amount: income.amount.toString(),
        description: income.description,
        type: income.type
      });
    } else {
      setEditingIncome(null);
      setFormData({
        month: new Date().toISOString().slice(0, 7),
        amount: '',
        description: '',
        type: 'salary'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIncome(null);
  };

  const handleSubmit = () => {
    const incomeData = {
      month: formData.month,
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: formData.type
    };

    if (editingIncome) {
      updateVariableIncome({
        ...editingIncome,
        ...incomeData
      });
    } else {
      addVariableIncome(incomeData);
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      deleteVariableIncome(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getTypeColor = (type: VariableIncome['type']) => {
    switch (type) {
      case 'salary': return theme.palette.success.main;
      case 'bonus': return theme.palette.warning.main;
      case 'freelance': return theme.palette.info.main;
      case 'investment': return theme.palette.secondary.main;
      default: return theme.palette.grey[500];
    }
  };

  const sortedIncomes = [...financialData.variableIncome].sort((a, b) => b.month.localeCompare(a.month));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Variable Income
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Add Income
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track bonuses, freelance payments, investment returns, and other variable income sources
      </Typography>

      {sortedIncomes.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedIncomes.map((income) => (
                <TableRow key={income.id} hover>
                  <TableCell>{formatMonth(income.month)}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={income.type}
                      size="small"
                      sx={{
                        bgcolor: alpha(getTypeColor(income.type), 0.1),
                        color: getTypeColor(income.type),
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatCurrency(income.amount)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(income)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(income.id)}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <AttachMoneyIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            No Variable Income Recorded
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add bonuses, freelance payments, or other variable income sources to get a complete picture of your finances.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Your First Variable Income
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIncome ? 'Edit Variable Income' : 'Add Variable Income'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Income Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VariableIncome['type'] })}
                label="Income Type"
              >
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="bonus">Bonus</MenuItem>
                <MenuItem value="freelance">Freelance</MenuItem>
                <MenuItem value="investment">Investment</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              placeholder="e.g., Performance Bonus, Client Project, Dividend Payment"
            />

            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: '$',
              }}
              placeholder="0.00"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.amount || !formData.description}
          >
            {editingIncome ? 'Update' : 'Add'} Income
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VariableIncomeManager;
