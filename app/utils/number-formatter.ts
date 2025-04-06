/**
 * Utility functions for formatting and parsing numbers in British format
 */

/**
 * Formats a number as currency in British format (with commas as separators and 2 decimal places)
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatCurrency(
  value: number | string,
  options: {
    decimals?: number
    symbol?: string
    showSymbol?: boolean
  } = {}
): string {
  const { decimals = 2, symbol = '£', showSymbol = true } = options

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return showSymbol ? `${symbol}0.00` : '0.00'
  }

  const formatted = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)

  return showSymbol ? `${symbol}${formatted}` : formatted
}

/**
 * Formats a number with commas as separators (British format)
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatNumber(
  value: number | string,
  decimals: number = 0
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return '0'
  }

  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Parses a formatted number string back to a number
 * @param value - The formatted string to parse
 * @returns Parsed number
 */
export function parseFormattedNumber(value: string): number {
  // Remove currency symbol, commas and other non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned)
}

/**
 * Formats user input for number fields, keeping just digits and decimal point
 * @param value - The input value to format
 * @returns Formatted input string
 */
export function formatNumberInput(value: string): string {
  // Remove all non-digit characters except decimal point
  // Allow only one decimal point
  let formatted = ''
  let hasDecimal = false

  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (char === '.' && !hasDecimal) {
      hasDecimal = true
      formatted += char
    } else if (/\d/.test(char)) {
      formatted += char
    }
  }

  return formatted
}
