import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  CardHeader,
  Avatar
} from '@mui/material';
import { useFinancial } from '../../context/FinancialContext';
import ReceiptIcon from '@mui/icons-material/Receipt';

const TransactionList: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...financialData.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get category color based on category name
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'income': theme.palette.success.main,
      'groceries': theme.palette.primary.main,
      'dining': theme.palette.warning.main,
      'transport': theme.palette.info.main,
      'shopping': theme.palette.secondary.main,
      'subscriptions': theme.palette.error.main,
      'housing': theme.palette.success.dark,
      'utilities': theme.palette.warning.dark,
      'healthcare': theme.palette.info.dark,
      'entertainment': theme.palette.secondary.dark,
      'education': theme.palette.primary.dark
    };
    
    return categoryColors[category.toLowerCase()] || theme.palette.grey[500];
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <ReceiptIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Recent Transactions
          </Typography>
        }
        sx={{ pb: 0, pt: 1 }}
      />

      <TableContainer 
        component={Paper} 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          flex: 1,
          boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.08)}`,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main
                }}
              >
                Date
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main
                }}
              >
                Description
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main
                }}
              >
                Category
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main
                }}
              >
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    hover
                    sx={{
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>{formatDate(transaction.date)}</TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 500 }}>{transaction.description}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={transaction.category}
                        size="small"
                        sx={{
                          bgcolor: alpha(getCategoryColor(transaction.category), 0.1),
                          color: getCategoryColor(transaction.category),
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          py: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontWeight: 600,
                      py: 1.5,
                      color: transaction.type === 'income' ? theme.palette.success.main : theme.palette.error.main
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {sortedTransactions.length > 0 && (
        <TablePagination
          component="div"
          count={sortedTransactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
            }
          }}
        />
      )}
    </Box>
  );
};

export default TransactionList;
