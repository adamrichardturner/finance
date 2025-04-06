import { useState, useMemo, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { usePotMutations } from '~/hooks/use-pots/use-pot-mutations'
import { THEME_COLORS } from '~/utils/budget-categories'
import { ColorSelect } from '~/components/ui/color-select'
import isEqual from 'lodash/isEqual'
import { Pot } from '~/types/finance.types'
import { CurrencyInput } from '~/components/ui/currency-input'
import { formatCurrency } from '~/utils/number-formatter'
import { useFetcher } from '@remix-run/react'

interface PotFormValues {
  name: string
  target: string
  theme: string
  initialAmount?: string
}

interface FormState {
  original: PotFormValues
  current: PotFormValues
}

interface AddPotModalProps {
  isOpen: boolean
  onClose: () => void
  pots?: Pot[] | null
  usedColors?: string[]
  currentBalance?: number
}

export function AddPotModal({
  isOpen,
  onClose,
  pots = [],
  usedColors = [],
  currentBalance = 0,
}: AddPotModalProps) {
  // Find the first available color that's not already used
  const getNextAvailableColor = useCallback(() => {
    const allUsedThemes = Array.isArray(pots)
      ? [...pots.map((pot) => pot.theme), ...usedColors]
      : [...usedColors]

    // Find the first color in THEME_COLORS that's not in allUsedThemes
    const availableColor = THEME_COLORS.find(
      (color) => !allUsedThemes.includes(color.value)
    )

    // Return the first available color, or default to the first color if all are used
    return availableColor?.value || THEME_COLORS[0].value
  }, [pots, usedColors])

  const initialValues: PotFormValues = {
    name: '',
    target: '',
    theme: '',
    initialAmount: '',
  }

  const [formState, setFormState] = useState<FormState>({
    original: initialValues,
    current: initialValues,
  })

  const [error, setError] = useState<string | null>(null)
  const maxNameLength = 30

  const { createPot } = usePotMutations()
  const formFetcher = useFetcher()

  // Combine pot colors with other used colors
  const allUsedColors = useMemo(() => {
    const potColors = Array.isArray(pots) ? pots.map((pot) => pot.theme) : []
    return [...potColors, ...usedColors]
  }, [pots, usedColors])

  // Reset form state when modal opens or when used colors change
  useEffect(() => {
    if (isOpen) {
      const nextAvailableColor = getNextAvailableColor()
      const newInitialValues = {
        name: '',
        target: '',
        theme: nextAvailableColor,
      }

      setFormState({
        original: newInitialValues,
        current: newInitialValues,
      })
    }
  }, [isOpen, getNextAvailableColor])

  // Check if any fields have been modified from their initial state
  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  const handleClose = () => {
    setFormState({
      original: initialValues,
      current: initialValues,
    })
    setError(null)
    onClose()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= maxNameLength) {
      setFormState((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          name: value,
        },
      }))
      // Clear error when user changes input
      setError(null)
    }
  }

  const handleTargetChange = (value: string, numericValue: number) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        target: value,
      },
    }))
    // Clear error when user changes input
    setError(null)
  }

  const handleThemeChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        theme: value,
      },
    }))
    // Clear error when user changes input
    setError(null)
  }

  const handleInitialAmountChange = (value: string, numericValue: number) => {
    // Prevent entering amounts greater than current balance
    if (numericValue > currentBalance) {
      setFormState((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          initialAmount: currentBalance.toString(),
        },
      }))
      setError(
        `Cannot add more than your available balance of ${formatCurrency(currentBalance)}`
      )
    } else {
      setFormState((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          initialAmount: value,
        },
      }))

      // Clear error if it was a balance error
      if (error && error.includes('available balance')) {
        setError(null)
      }
    }
  }

  // Check if form values are valid without showing error messages
  const isFormValid = useMemo(() => {
    if (
      !formState.current.name ||
      !formState.current.target ||
      !formState.current.theme
    ) {
      return false
    }

    // Check if target is a valid number
    const targetValue = parseFloat(formState.current.target)
    if (isNaN(targetValue) || targetValue <= 0) {
      return false
    }

    return true
  }, [formState.current])

  // Update button's disabled state
  const isButtonDisabled = useMemo(() => {
    return createPot.isPending || !isFormValid || !hasChanges
  }, [createPot.isPending, isFormValid, hasChanges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formState.current.name ||
      !formState.current.target ||
      !formState.current.theme
    ) {
      setError('Please fill in all fields')
      return
    }

    // Check if the selected color is already in use by another pot
    const isColorInUse = allUsedColors.includes(formState.current.theme)
    if (isColorInUse) {
      setError(
        'This color is already in use by another pot. Please select a different color.'
      )
      return
    }

    setError(null)

    try {
      // Create a FormData object for direct form submission
      const formData = new FormData()
      formData.append('intent', 'create')
      formData.append('name', formState.current.name)
      formData.append('target', formState.current.target)
      formData.append('theme', formState.current.theme)

      // Add initialAmount to the form if it has a value
      if (formState.current.initialAmount) {
        formData.append('initialAmount', formState.current.initialAmount)
      }

      // Use direct form submission with formFetcher
      // This will trigger a full page reload and data refresh
      formFetcher.submit(formData, { method: 'post', action: '/pots' })

      // Close the modal right away
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to create pot')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pot</DialogTitle>
        </DialogHeader>
        <div className='text-sm text-gray-500 mt-1 mb-4'>
          Create a pot to set savings targets. These can help keep you on track
          as you save for special purchases.
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label id='pot-name-label' className='text-sm font-medium'>
              Pot Name
            </label>
            <div aria-labelledby='pot-name-label' className='relative'>
              <Input
                type='text'
                placeholder='e.g. New Laptop'
                value={formState.current.name}
                onChange={handleNameChange}
                required
              />
              <div className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400'>
                {maxNameLength - formState.current.name.length} characters left
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label id='pot-target-label' className='text-sm font-medium'>
              Target
            </label>
            <CurrencyInput
              id='pot-target'
              placeholder='e.g. 2,000.00'
              value={formState.current.target}
              onChange={handleTargetChange}
              decimals={2}
              required
            />
          </div>

          <div className='space-y-2'>
            <label id='pot-theme-label' className='text-sm font-medium'>
              Theme
            </label>
            <div aria-labelledby='pot-theme-label'>
              <ColorSelect
                value={formState.current.theme}
                onValueChange={handleThemeChange}
                required
                usedColors={allUsedColors}
              />
            </div>
          </div>

          <div className='form-control w-full mb-4'>
            <label className='label'>
              <span className='label-text'>Initial Amount (Optional)</span>
            </label>
            <CurrencyInput
              value={formState.current.initialAmount || ''}
              onChange={handleInitialAmountChange}
              allowNegative={false}
              placeholder='0.00'
              className='input input-bordered w-full'
            />
            <label className='label'>
              <span className='text-xs opacity-70'>
                Leave blank for no initial funding
              </span>
            </label>
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={isButtonDisabled}
          >
            {createPot.isPending ? 'Creating...' : 'Add Pot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
