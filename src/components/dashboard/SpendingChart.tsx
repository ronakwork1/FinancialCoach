import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  useTheme,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import InsightsIcon from '@mui/icons-material/Insights';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction } from '../../context/FinancialContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SpendingChart: React.FC = () => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('month');
  const { financialData } = useFinancial();

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };

  // Calculate chart data based on transaction data
  const chartData = useMemo(() => {
    const transactions = financialData.transactions;
    
    // If no transactions, return empty data
    if (transactions.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Get date range from transactions
    const dates = transactions.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate timeframe based on actual data
    const monthDiff = (maxDate.getMonth() - minDate.getMonth()) + 
                     (12 * (maxDate.getFullYear() - minDate.getFullYear()));
    
    // Determine if we should use weeks or months based on data range
    const useWeeks = monthDiff < 1;
    const actualTimeframe = useWeeks ? 'week' : 'month';
    
    // Group transactions by time period
    const incomeByPeriod: Record<string, number> = {};
    const expensesByPeriod: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let periodKey: string;
      
      if (actualTimeframe === 'week') {
        // Get ISO week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        periodKey = `${date.getFullYear()}-W${weekNum}`;
      } else {
        // Month format: YYYY-MM
        periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      // Initialize if needed
      if (!incomeByPeriod[periodKey]) incomeByPeriod[periodKey] = 0;
      if (!expensesByPeriod[periodKey]) expensesByPeriod[periodKey] = 0;
      
      // Add amount to appropriate category
      if (transaction.type === 'income') {
        incomeByPeriod[periodKey] += transaction.amount;
      } else {
        expensesByPeriod[periodKey] += transaction.amount;
      }
    });
    
    // Generate all period keys in range
    const allPeriodKeys: string[] = [];
    if (actualTimeframe === 'week') {
      // Generate all weeks in range
      const startDate = new Date(minDate);
      const endDate = new Date(maxDate);
      while (startDate <= endDate) {
        const firstDayOfYear = new Date(startDate.getFullYear(), 0, 1);
        const pastDaysOfYear = (startDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const periodKey = `${startDate.getFullYear()}-W${weekNum}`;
        
        if (!allPeriodKeys.includes(periodKey)) {
          allPeriodKeys.push(periodKey);
        }
        
        // Move to next week
        startDate.setDate(startDate.getDate() + 7);
      }
    } else {
      // Generate all months in range
      const startYear = minDate.getFullYear();
      const startMonth = minDate.getMonth();
      const endYear = maxDate.getFullYear();
      const endMonth = maxDate.getMonth();
      
      for (let year = startYear; year <= endYear; year++) {
        const monthStart = (year === startYear) ? startMonth : 0;
        const monthEnd = (year === endYear) ? endMonth : 11;
        
        for (let month = monthStart; month <= monthEnd; month++) {
          const periodKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
          allPeriodKeys.push(periodKey);
        }
      }
    }
    
    // Sort periods chronologically
    allPeriodKeys.sort();
    
    // Create formatted labels and data arrays
    const labels = allPeriodKeys.map(key => {
      if (actualTimeframe === 'week') {
        const [year, week] = key.split('-W');
        return `Week ${week}`;
      } else {
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1)
          .toLocaleString('default', { month: 'short', year: '2-digit' });
      }
    });
    
    const incomeData = allPeriodKeys.map(key => incomeByPeriod[key] || 0);
    const expensesData = allPeriodKeys.map(key => expensesByPeriod[key] || 0);
    
    // Add income from form data if available and no transaction income
    const hasSalaryData = parseFloat(financialData.income.salary) > 0;
    const hasTransactionIncome = Object.values(incomeByPeriod).some(v => v > 0);
    
    if (hasSalaryData && !hasTransactionIncome) {
      const salary = parseFloat(financialData.income.salary);
      const additionalIncome = parseFloat(financialData.income.additionalIncome || '0');
      const totalMonthlyIncome = salary + additionalIncome;
      
      // Fill in income data with monthly salary
      incomeData.forEach((_, index) => {
        incomeData[index] = totalMonthlyIncome;
      });
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + '40',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Expenses',
          data: expensesData,
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.light + '40',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  }, [financialData.transactions, financialData.income, theme.palette]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        },
      },
      x: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // Determine if we have data to show
  const hasData = chartData.labels.length > 0;

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InsightsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Income vs. Expenses
          </Typography>
        </Box>
        
        {hasData && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timeframe}
              onChange={handleTimeframeChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Select timeframe' }}
            >
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hasData ? (
          <Line options={options} data={chartData} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No transaction data available to display chart
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SpendingChart;