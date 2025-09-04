const fs = require('fs');
const path = require('path');

// Function to fix Grid components in a file
function fixGridComponentsInFile(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace <Grid item xs={...}> with <Grid xs={...}>
    const fixedContent = content.replace(/<Grid\s+item\s+/g, '<Grid ');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed Grid components in ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
}

// Files to fix
const filesToFix = [
  path.join(__dirname, 'src/components/dashboard/Dashboard.tsx'),
  path.join(__dirname, 'src/components/dashboard/BudgetOverview.tsx'),
  path.join(__dirname, 'src/components/dashboard/FinancialSummary.tsx'),
  path.join(__dirname, 'src/components/forms/FinancialDataForm.tsx')
];

// Fix all files
filesToFix.forEach(fixGridComponentsInFile);

console.log('All files fixed successfully!');

