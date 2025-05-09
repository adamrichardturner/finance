import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Pot } from '~/types/finance.types'
import { THEME_COLORS } from '~/utils/budget-categories'
import { usePotMutations } from '~/hooks/use-pots/use-pot-mutations'
import { ColorSelect } from '~/components/ui/color-select'
import isEqual from 'lodash/isEqual'
import { CurrencyInput } from '~/components/ui/currency-input'
import { formatCurrency } from '~/utils/number-formatter'
import { UpdatePotParams } from '~/commands/pots'
import { useFetcher } from '@remix-run/react'

interface PotFormValues {
  name: string
  target: string
  theme: string
}

interface FormState {
  original: PotFormValues
  current: PotFormValues
}

interface EditPotModalProps {
  isOpen: boolean
  potId?: string
  onClose: () => void
  pots?: Pot[] | null
  usedColors?: string[]
  currentBalance?: number
}

export function EditPotModal({
  isOpen,
  potId,
  onClose,
  pots = [],
  usedColors = [],
  currentBalance = 0,
}: EditPotModalProps) {
  const [formState, setFormState] = useState<FormState>({
    original: {
      name: '',
      target: '',
      theme: THEME_COLORS[0].value,
    },
    current: {
      name: '',
      target: '',
      theme: THEME_COLORS[0].value,
    },
  })

  const [error, setError] = useState<string | null>(null)
  const [addFundsValue, setAddFundsValue] = useState<string>('0')
  const maxNameLength = 30

  const { updatePot } = usePotMutations()
  const formFetcher = useFetcher()

  // Track if form has changes using deep comparison
  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  // Combine pot colors with other used colors, excluding current pot
  const allUsedColors = useMemo(() => {
    const otherPotColors = Array.isArray(pots)
      ? pots.filter((pot) => String(pot.id) !== potId).map((pot) => pot.theme)
      : []
    return [...otherPotColors, ...usedColors]
  }, [pots, potId, usedColors])

  useEffect(() => {
    if (isOpen && potId && Array.isArray(pots) && pots.length > 0) {
      const currentPot = pots.find((p) => String(p.id) === potId)

      if (currentPot) {
        const newValues = {
          name: currentPot.name,
          target: currentPot.target.toString(),
          theme: currentPot.theme,
        }

        setFormState({
          original: newValues,
          current: newValues,
        })
      }
    }
  }, [isOpen, potId, pots])

  const handleClose = () => {
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

  const handleAddFundsChange = (value: string, numericValue: number) => {
    setAddFundsValue(value)
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

    // Check if add funds is valid if provided
    if (addFundsValue && addFundsValue !== '0') {
      const fundsValue = parseFloat(addFundsValue)
      if (isNaN(fundsValue) || fundsValue < 0) {
        return false
      }
    }

    return true
  }, [formState.current, addFundsValue])

  // Update button's disabled state
  const isButtonDisabled = useMemo(() => {
    return (
      updatePot.isPending ||
      !isFormValid ||
      (!hasChanges && addFundsValue === '0')
    )
  }, [updatePot.isPending, isFormValid, hasChanges, addFundsValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!potId) {
      return
    }

    if (
      !formState.current.name ||
      !formState.current.target ||
      !formState.current.theme
    ) {
      setError('Please fill in all fields')
      return
    }

    // Check if the color is already in use by another pot
    // We need to exclude the current pot's color from the check
    const otherPotsColors = Array.isArray(pots)
      ? pots.filter((p) => String(p.id) !== potId).map((p) => p.theme)
      : []

    const isColorInUse = otherPotsColors.includes(formState.current.theme)

    if (isColorInUse) {
      setError(
        'This color is already in use by another pot. Please select a different color.'
      )
      return
    }

    setError(null)

    try {
      const parsedAddFunds = addFundsValue ? parseFloat(addFundsValue) : 0

      // Validate that addFunds doesn't exceed current balance
      if (parsedAddFunds > currentBalance) {
        setError(
          `Cannot add more than your available balance of ${formatCurrency(currentBalance)}`
        )
        return
      }

      // Create a FormData object for direct form submission
      const formData = new FormData()
      formData.append('intent', 'update')
      formData.append('potId', potId)
      formData.append('name', formState.current.name)
      formData.append('target', formState.current.target)
      formData.append('theme', formState.current.theme)

      if (parsedAddFunds > 0) {
        formData.append('addFunds', parsedAddFunds.toString())
      }

      // Use direct form submission with no action/method specified
      // This will trigger a full page reload and data refresh
      formFetcher.submit(formData, { method: 'post', action: '/pots' })

      // Close the modal right away
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update pot')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pot</DialogTitle>
        </DialogHeader>
        <div className='text-sm text-gray-500 mt-1 mb-4'>
          If your saving targets change, feel free to update your spending
          limits.
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label id='edit-pot-name-label' className='text-sm font-medium'>
              Pot Name
            </label>
            <div aria-labelledby='edit-pot-name-label' className='relative'>
              <Input
                type='text'
                placeholder='e.g. Concert Ticket'
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
            <label htmlFor='edit-pot-target' className='text-sm font-medium'>
              Target
            </label>
            <CurrencyInput
              id='edit-pot-target'
              placeholder='e.g. 2,000.00'
              value={formState.current.target}
              onChange={handleTargetChange}
              decimals={2}
              required
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='add-funds' className='text-sm font-medium'>
              Add Funds (Optional)
            </label>
            <CurrencyInput
              id='add-funds'
              placeholder='e.g. 100.00'
              value={addFundsValue}
              onChange={handleAddFundsChange}
              decimals={2}
            />
          </div>

          <div className='space-y-2'>
            <label id='edit-pot-theme-label' className='text-sm font-medium'>
              Theme
            </label>
            <div aria-labelledby='edit-pot-theme-label'>
              <ColorSelect
                value={formState.current.theme}
                onValueChange={handleThemeChange}
                required
                usedColors={allUsedColors}
              />
            </div>
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={isButtonDisabled}
          >
            {updatePot.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
