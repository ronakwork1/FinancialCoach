/**
 * Utility functions for CSV export
 */

/**
 * Convert data to CSV format and trigger download
 * @param data Array of objects to convert to CSV
 * @param filename Name of the file to download
 */
export const exportToCSV = (data: any[], filename: string): void => {
  // Define headers based on our standard format
  const headers = ['Date', 'Merchant', 'Category', 'Amount'];
  
  // Convert data to CSV string
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header.toLowerCase()] || '';
      
      // Escape commas and quotes in values
      const escaped = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains comma, newline or quote
      return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
    });
    
    csvRows.push(values.join(','));
  }
  
  // Combine into CSV content
  const csvContent = csvRows.join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set up download link
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add to document, trigger click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Load sample data from a CSV file
 * @param url URL of the CSV file to load
 * @returns Promise that resolves to the parsed CSV data
 */
export const loadCSVData = async (url: string): Promise<any[]> => {
  try {
    // For local file paths, use a different approach
    let csvText: string;
    
    if (url.startsWith('/') || url.startsWith('./') || url.includes(':/')) {
      // Use fetch for web URLs or relative paths
      try {
        const response = await fetch(url);
        csvText = await response.text();
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // Try to read from local file system as fallback
        throw new Error(`Failed to load CSV from ${url}: ${fetchError}`);
      }
    } else {
      throw new Error(`Invalid URL format: ${url}`);
    }
    
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['date', 'merchant', 'category', 'amount'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`CSV missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Parse data rows
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, lineIndex) => {
        const values = line.split(',').map(v => v.trim());
        const entry: Record<string, string> = {};
        
        // Ensure we have the right number of values
        if (values.length < headers.length) {
          console.warn(`Line ${lineIndex + 2} has fewer values than headers`);
        }
        
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        
        // Debug
        console.log(`Parsed row:`, entry);
        
        return entry;
      });
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
};
