import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { loadCSVData } from '../../utils/csvExport';
import { useFinancial } from '../../context/FinancialContext';

// Sample data options
const sampleDataOptions = [
  { 
    id: 'student', 
    name: 'Student Profile', 
    description: 'A student with limited income, frequent dining out, and campus expenses.',
    path: '/sample-data/student_finances.csv'
  },
  { 
    id: 'freelancer', 
    name: 'Freelancer Profile', 
    description: 'A freelancer with variable income, heavy ride-hailing usage, and tech purchases.',
    path: '/sample-data/freelancer_finances.csv'
  },
  { 
    id: 'professional', 
    name: 'Professional Profile', 
    description: 'A professional with steady income, weekend dining, and premium subscriptions.',
    path: '/sample-data/professional_finances.csv'
  }
];

interface SampleDataLoaderProps {
  onDataLoaded: () => void;
}

const SampleDataLoader: React.FC<SampleDataLoaderProps> = ({ onDataLoaded }) => {
  const [selectedSample, setSelectedSample] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get context
  const { setTransactionData } = useFinancial();
  
  // Handle sample selection
  const handleSampleChange = (event: SelectChangeEvent) => {
    setSelectedSample(event.target.value);
    setError(null);
  };
  
  // Handle dialog open
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Load sample data
  const handleLoadSample = async () => {
    if (!selectedSample) {
      setError('Please select a sample profile');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Find selected sample
      const sample = sampleDataOptions.find(option => option.id === selectedSample);
      
      if (!sample) {
        throw new Error('Sample not found');
      }
      
      // Load CSV data
      const data = await loadCSVData(sample.path);
      
      // Set data in context
      setTransactionData(data);
      
      // Close dialog and notify parent
      setDialogOpen(false);
      onDataLoaded();
      
    } catch (err) {
      setError(`Failed to load sample data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<CloudDownloadIcon />}
        onClick={handleOpenDialog}
        sx={{ mt: 2 }}
      >
        Load Sample Data
      </Button>
      
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Load Sample Financial Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Choose a sample profile to load pre-populated financial data. This will help you
            explore the app's features without entering your own data.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="sample-data-label">Sample Profile</InputLabel>
            <Select
              labelId="sample-data-label"
              id="sample-data"
              value={selectedSample}
              label="Sample Profile"
              onChange={handleSampleChange}
            >
              {sampleDataOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedSample && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {sampleDataOptions.find(option => option.id === selectedSample)?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sampleDataOptions.find(option => option.id === selectedSample)?.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleLoadSample} 
            variant="contained" 
            color="primary"
            disabled={loading || !selectedSample}
          >
            {loading ? 'Loading...' : 'Load Sample'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SampleDataLoader;
