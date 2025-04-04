import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { THEME_COLORS } from '~/utils/budget-categories'

interface ColorSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function ColorSelect({
  value,
  onValueChange,
  placeholder = 'Select a color',
  required = false,
}: ColorSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger>
        <SelectValue>
          {value && (
            <div className='flex items-center gap-2'>
              <div
                className='w-4 h-4 rounded-full'
                style={{ backgroundColor: value }}
              />
              <span>
                {THEME_COLORS.find((color) => color.value === value)?.name ||
                  placeholder}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className='max-h-[300px]'>
        {THEME_COLORS.map((color) => (
          <SelectItem key={color.name} value={color.value} className='py-2'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-5 h-5 rounded-full'
                  style={{ backgroundColor: color.value }}
                />
                <span>{color.name}</span>
              </div>
              {value === color.value && (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
