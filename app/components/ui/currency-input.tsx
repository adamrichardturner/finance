import React, { useState, useEffect, forwardRef } from 'react'
import { Input } from './input'
import { formatCurrency, parseFormattedNumber } from '~/utils/number-formatter'

interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value: string | number
  onChange: (value: string, numericValue: number) => void
  decimals?: number
  showPrefix?: boolean
  prefix?: string
  allowNegative?: boolean
  className?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      decimals = 2,
      showPrefix = true,
      prefix = '£',
      allowNegative = false,
      className,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    // Convert the value to its numeric equivalent
    const numericValue =
      typeof value === 'string' ? parseFloat(value) || 0 : value || 0

    // Effect to update display value when external value changes
    useEffect(() => {
      if (!isFocused) {
        // When not focused, show formatted version without the symbol
        // since we're adding it manually in the UI
        setDisplayValue(
          formatCurrency(numericValue, {
            decimals,
            symbol: prefix,
            showSymbol: false, // Don't include the symbol in the formatted value
          })
        )
      }
    }, [numericValue, isFocused, decimals, prefix])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // When focused, show the raw number without formatting but maintain decimal places
      setDisplayValue(numericValue.toFixed(decimals))
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)

      // When blurring, format the value
      const parsed = parseFormattedNumber(displayValue)
      const validValue = isNaN(parsed) ? 0 : parsed
      const finalValue = allowNegative ? validValue : Math.max(0, validValue)

      // Update both the display and the actual value
      setDisplayValue(
        formatCurrency(finalValue, {
          decimals,
          symbol: prefix,
          showSymbol: false, // Don't include the symbol in the formatted value
        })
      )
      onChange(finalValue.toString(), finalValue)

      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      // Remove any non-numeric characters except decimal and minus sign
      let cleaned = inputValue.replace(/[^0-9.-]/g, '')

      // If negative numbers aren't allowed, remove minus signs
      if (!allowNegative) {
        cleaned = cleaned.replace(/-/g, '')
      }

      // Ensure only one decimal point
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('')
      }

      // If we have a valid number, update state
      if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        setDisplayValue(cleaned)
        onChange('0', 0)
      } else {
        const parsed = parseFloat(cleaned)
        if (!isNaN(parsed)) {
          setDisplayValue(cleaned)
          onChange(cleaned, parsed)
        }
      }
    }

    return (
      <div className='relative'>
        {/* Always show the prefix */}
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <span className='text-gray-500'>{prefix}</span>
        </div>
        <Input
          {...props}
          ref={ref}
          type='text'
          inputMode='decimal'
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`pl-7 ${className || ''}`}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
