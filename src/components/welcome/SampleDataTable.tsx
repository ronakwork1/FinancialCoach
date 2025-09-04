import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme
} from '@mui/material';

interface SampleData {
  date: string;
  merchant: string;
  category: string;
  amount: string;
}

interface SampleDataTableProps {
  data: SampleData[];
}

const SampleDataTable: React.FC<SampleDataTableProps> = ({ data }) => {
  const theme = useTheme();
  
  return (
    <TableContainer 
      component={Paper} 
      variant="outlined" 
      sx={{ 
        mb: 3,
        overflow: 'hidden',
        borderRadius: 2,
        '& .MuiTableCell-root': {
          borderColor: theme.palette.divider
        }
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: theme.palette.primary.main + '08' }}>
          <TableRow>
            <TableCell 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}20`
              }}
            >
              Date
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}20`
              }}
            >
              Merchant
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}20`
              }}
            >
              Category
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}20`
              }}
            >
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index}
              sx={{ 
                '&:nth-of-type(odd)': { 
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)' 
                },
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'
                }
              }}
            >
              <TableCell sx={{ fontFamily: 'monospace' }}>{row.date}</TableCell>
              <TableCell>{row.merchant}</TableCell>
              <TableCell>
                <Box 
                  component="span" 
                  sx={{ 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: getCategoryColor(row.category, theme),
                    color: getCategoryTextColor(row.category, theme)
                  }}
                >
                  {row.category}
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>
                ${parseFloat(row.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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

export default SampleDataTable;
