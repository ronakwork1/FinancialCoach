import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  useTheme
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

// Sample profiles data
const sampleProfiles = [
  { 
    id: 'student', 
    name: 'Student Profile', 
    description: 'Limited income with frequent food delivery and multiple subscriptions',
    icon: <SchoolIcon />,
    path: '/sample-data/student_finances.csv'
  },
  { 
    id: 'freelancer', 
    name: 'Freelancer Profile', 
    description: 'Variable income with ride-hailing expenses and tech purchases',
    icon: <WorkIcon />,
    path: '/sample-data/freelancer_finances.csv'
  },
  { 
    id: 'professional', 
    name: 'Professional Profile', 
    description: 'Steady salary with premium subscriptions and weekend dining',
    icon: <BusinessCenterIcon />,
    path: '/sample-data/professional_finances.csv'
  }
];

interface SampleDataDownloaderProps {
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

const SampleDataDownloader: React.FC<SampleDataDownloaderProps> = ({ 
  onDownloadStart, 
  onDownloadComplete 
}) => {
  const theme = useTheme();
  
  // Handle download of sample CSV file
  const handleDownload = async (profileId: string) => {
    if (onDownloadStart) onDownloadStart();
    
    try {
      const profile = sampleProfiles.find(p => p.id === profileId);
      if (!profile) return;
      
      // Get the file path
      const filePath = profile.path;
      
      // Fetch the file
      const response = await fetch(filePath);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${profile.id}_finances.csv`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onDownloadComplete) onDownloadComplete();
      
    } catch (error) {
      console.error('Error downloading sample data:', error);
      if (onDownloadComplete) onDownloadComplete();
    }
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
        Download Sample Data Files
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Don't have your own financial data? Download one of our sample CSV files to explore the app's features.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {sampleProfiles.map((profile) => (
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, px: 1.5, mb: 3 }} key={profile.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: theme.palette.primary.main + '15',
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      mr: 2
                    }}
                  >
                    {profile.icon}
                  </Box>
                  <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 600 }}>
                    {profile.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {profile.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Tooltip title={`Download ${profile.name} CSV file`}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<FileDownloadIcon />}
                    onClick={() => handleDownload(profile.id)}
                    fullWidth
                  >
                    Download CSV
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SampleDataDownloader;
