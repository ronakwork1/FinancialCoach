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

  // Calculate chart data based on financial data
  const chartData = useMemo(() => {
    // Parse income and expenses
    const income = parseFloat(financialData.income.salary) + 
                   parseFloat(financialData.income.additionalIncome || '0');
    
    const expenses = Object.values(financialData.expenses).reduce(
      (sum, value) => sum + (parseFloat(value) || 0), 
      0
    );

    // Generate monthly data
    const currentMonth = new Date().getMonth();
    const monthlyLabels = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(currentMonth - 11 + i);
      return date.toLocaleString('default', { month: 'short' });
    });

    // Generate weekly data
    const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    // Create simulated data based on current values
    const generateSimulatedData = (baseValue: number, count: number, variation: number = 0.1) => {
      return Array.from({ length: count }, () => {
        const randomFactor = 1 + (Math.random() * variation * 2 - variation);
        return Math.round(baseValue * randomFactor);
      });
    };

    const monthlyData = {
      labels: monthlyLabels,
      income: generateSimulatedData(income, 12),
      expenses: generateSimulatedData(expenses, 12),
    };

    const weeklyData = {
      labels: weeklyLabels,
      income: generateSimulatedData(income / 4, 4),
      expenses: generateSimulatedData(expenses / 4, 4),
    };

    return {
      labels: timeframe === 'month' ? monthlyData.labels : weeklyData.labels,
      datasets: [
        {
          label: 'Income',
          data: timeframe === 'month' ? monthlyData.income : weeklyData.income,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + '40',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Expenses',
          data: timeframe === 'month' ? monthlyData.expenses : weeklyData.expenses,
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.light + '40',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  }, [financialData, timeframe, theme.palette]);

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
      </Box>
      
      <Box sx={{ height: 300 }}>
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
};

export default SpendingChart;