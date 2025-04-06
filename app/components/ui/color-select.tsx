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
  usedColors?: string[] // Colors already in use by existing budgets/pots
  allowCurrentColor?: boolean // Whether to allow the current value even if in usedColors
}

export function ColorSelect({
  value,
  onValueChange,
  placeholder = 'Select a color',
  required = false,
  usedColors = [],
  allowCurrentColor = true,
}: ColorSelectProps) {
  // Function to check if a color is in use (but allow current color if specified)
  const isColorInUse = (colorValue: string): boolean => {
    if (allowCurrentColor && colorValue === value) {
      return false
    }
    return usedColors.includes(colorValue)
  }

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
        {THEME_COLORS.map((color) => {
          const inUse = isColorInUse(color.value)

          return (
            <SelectItem
              key={color.name}
              value={color.value}
              className='h-[46px] py-3 pr-2 pl-3 w-full'
              disabled={inUse}
            >
              <div className='flex flex-1 items-center justify-between w-full'>
                <div className='flex w-full items-center gap-3'>
                  <div
                    className={`w-5 h-5 rounded-full ${inUse ? 'opacity-10' : ''}`}
                    style={{ backgroundColor: color.value }}
                  />
                  <span className={inUse ? 'text-gray-500' : ''}>
                    {color.name}
                  </span>
                </div>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
