/**
 * Validates if a string is a valid number
 * @param value The string to validate
 * @returns True if the string is a valid number, false otherwise
 */
export const isValidNumber = (value: string): boolean => {
  if (!value) return true; // Empty values are handled separately
  return /^\d*\.?\d*$/.test(value);
};

/**
 * Validates if a number is positive
 * @param value The number to validate
 * @returns True if the number is positive, false otherwise
 */
export const isPositiveNumber = (value: string): boolean => {
  if (!value) return true; // Empty values are handled separately
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Formats a number as currency
 * @param value The number to format
 * @returns The formatted currency string
 */
export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a percentage
 * @param value The number to format as percentage
 * @returns The formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

/**
 * Calculates the monthly value based on frequency
 * @param value The value to convert
 * @param frequency The frequency (weekly, biweekly, monthly, annually)
 * @returns The monthly value
 */
export const calculateMonthlyValue = (value: number, frequency: string): number => {
  switch (frequency) {
    case 'weekly':
      return value * 4.33; // Average weeks in a month
    case 'biweekly':
      return value * 2.17; // Average bi-weeks in a month
    case 'monthly':
      return value;
    case 'annually':
      return value / 12;
    default:
      return value;
  }
};

/**
 * Validates an email address
 * @param email The email to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates that a required field is not empty
 * @param value The value to check
 * @returns True if the value is not empty, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim() !== '';
};

/**
 * Validates a date is in the future
 * @param date The date to validate
 * @returns True if the date is in the future, false otherwise
 */
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Validates a password meets minimum requirements
 * @param password The password to validate
 * @returns True if the password meets requirements, false otherwise
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

