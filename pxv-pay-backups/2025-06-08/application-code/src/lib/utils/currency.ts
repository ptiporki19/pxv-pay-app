/**
 * Currency formatting utilities for PXV Pay
 * 
 * Provides consistent currency formatting across the application using currency codes (USD, EUR, XAF)
 * instead of currency symbols ($, €, FCFA) for better clarity and consistency.
 */

/**
 * Format currency amount with currency code instead of symbol
 * @param amount - The amount to format
 * @param currencyCode - The currency code (USD, EUR, XAF, etc.)
 * @returns Formatted string like "1000 USD" or "10000 EUR"
 */
export function formatCurrency(amount: number | string, currencyCode: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Handle invalid amounts
  if (isNaN(numAmount)) {
    return `0 ${currencyCode}`
  }
  
  // Format the number with appropriate decimal places
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
  
  return `${formattedAmount} ${currencyCode}`
}

/**
 * Format currency amount as a number only (no currency code)
 * @param amount - The amount to format
 * @returns Formatted number string like "1,000.00"
 */
export function formatAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return '0'
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Parse currency string to extract amount and currency code
 * @param currencyString - String like "1000 USD" or "10000 EUR"
 * @returns Object with amount and currencyCode
 */
export function parseCurrency(currencyString: string): { amount: number; currencyCode: string } {
  const parts = currencyString.trim().split(' ')
  const amount = parseFloat(parts[0]?.replace(/,/g, '') || '0')
  const currencyCode = parts[1] || 'USD'
  
  return { amount, currencyCode }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use formatCurrency instead
 */
export function formatCurrencyLegacy(amount: number | string, currencyCode: string = 'USD'): string {
  return formatCurrency(amount, currencyCode)
} 