import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useFinancial } from '../../context/FinancialContext';

const FinancialSummary: React.FC = () => {
  const theme = useTheme();
  const { financialData } = useFinancial();
  
  // Calculate financial summary data from real-time transactions and variable income
  const summaryData = useMemo(() => {
    // Calculate total income from transactions
    const transactionIncome = financialData.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total variable income
    const totalVariableIncome = financialData.variableIncome.reduce((sum, vi) => sum + vi.amount, 0);

    // Calculate total expenses from transactions
    const transactionExpenses = financialData.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate income from form data (monthly salary)
    const formIncome = parseFloat(financialData.income.salary) || 0;
    const additionalIncome = parseFloat(financialData.income.additionalIncome) || 0;
    const monthlyIncome = formIncome + additionalIncome;

    // Use transaction data if available, otherwise fall back to form data
    const totalIncome = transactionIncome > 0 ? transactionIncome : monthlyIncome;
    const totalExpenses = transactionExpenses > 0 ? transactionExpenses : Object.values(financialData.expenses).reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      0
    );

    // Add variable income to total income
    const totalIncomeWithVariable = totalIncome + totalVariableIncome;

    // Calculate net savings
    const savings = totalIncomeWithVariable - totalExpenses;

    // Calculate total balance (all savings accounts)
    const emergencyFund = parseFloat(financialData.savings.emergencyFund) || 0;
    const retirement = parseFloat(financialData.savings.retirement) || 0;
    const investments = parseFloat(financialData.savings.investments) || 0;
    const savingsGoals = parseFloat(financialData.savings.goals) || 0;
    const totalBalance = emergencyFund + retirement + investments + savingsGoals;

    // Calculate transaction counts
    const totalTransactions = financialData.transactions.length;
    const expenseTransactions = financialData.transactions.filter(t => t.type === 'expense').length;
    const incomeTransactions = financialData.transactions.filter(t => t.type === 'income').length;

    // Calculate average transaction amounts
    const avgExpenseAmount = expenseTransactions > 0 ? transactionExpenses / expenseTransactions : 0;
    const avgIncomeAmount = incomeTransactions > 0 ? transactionIncome / incomeTransactions : 0;

    return {
      totalBalance,
      income: totalIncomeWithVariable,
      expenses: totalExpenses,
      savings,
      totalTransactions,
      expenseTransactions,
      incomeTransactions,
      avgExpenseAmount,
      avgIncomeAmount,
      variableIncomeCount: financialData.variableIncome.length,
      totalVariableIncome,
      dataSource: transactionIncome > 0 ? 'transactions' : 'form'
    };
  }, [financialData]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Financial Summary
          </Typography>
        </Box>

        {/* Data source indicator */}
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(
              summaryData.dataSource === 'transactions' ? theme.palette.success.main : theme.palette.info.main,
              0.1
            ),
            border: `1px solid ${alpha(
              summaryData.dataSource === 'transactions' ? theme.palette.success.main : theme.palette.info.main,
              0.2
            )}`
          }}
        >
          <Typography variant="caption" sx={{
            fontWeight: 500,
            color: summaryData.dataSource === 'transactions' ? theme.palette.success.main : theme.palette.info.main
          }}>
            {summaryData.dataSource === 'transactions' ? 'Live Data' : 'Form Data'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Savings Balance
        </Typography>
        <Typography
          variant="h4"
          component="p"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            mb: 1
          }}
        >
          ${summaryData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>

        {summaryData.totalTransactions > 0 && (
          <Typography variant="caption" color="text.secondary">
            Based on {summaryData.totalTransactions} transactions
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon
              fontSize="small"
              sx={{ color: theme.palette.success.main, mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Income
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ fontWeight: 'medium' }}>
            ${summaryData.income.toLocaleString()}
          </Typography>
          {summaryData.avgIncomeAmount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Avg: ${Math.round(summaryData.avgIncomeAmount)}
            </Typography>
          )}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingDownIcon
              fontSize="small"
              sx={{ color: theme.palette.error.main, mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Expenses
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ fontWeight: 'medium' }}>
            ${summaryData.expenses.toLocaleString()}
          </Typography>
          {summaryData.avgExpenseAmount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Avg: ${Math.round(summaryData.avgExpenseAmount)}
            </Typography>
          )}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon
              fontSize="small"
              sx={{
                color: summaryData.savings >= 0 ? theme.palette.secondary.main : theme.palette.error.main,
                mr: 0.5
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Net Savings
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="p"
            sx={{
              fontWeight: 'medium',
              color: summaryData.savings < 0 ? theme.palette.error.main : 'inherit'
            }}
          >
            ${summaryData.savings.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{
            color: summaryData.savings >= 0 ? theme.palette.success.main : theme.palette.error.main
          }}>
            {summaryData.savings >= 0 ? 'Positive' : 'Negative'} flow
          </Typography>
        </Box>
      </Box>

      {/* Transaction Summary */}
      {summaryData.totalTransactions > 0 && (
        <Box sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Transaction Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Transactions
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {summaryData.totalTransactions}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.error.main }}>
                {summaryData.expenseTransactions}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Income
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                {summaryData.incomeTransactions}
              </Typography>
            </Box>
            {summaryData.variableIncomeCount > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Variable Income
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.info.main }}>
                  {summaryData.variableIncomeCount} entries
                </Typography>
              </Box>
            )}
          </Box>

          {summaryData.variableIncomeCount > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                💰 Variable Income: ${summaryData.totalVariableIncome.toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FinancialSummary;