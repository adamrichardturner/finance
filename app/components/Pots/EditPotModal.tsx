import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Pot } from '~/types/finance.types'
import { THEME_COLORS } from '~/utils/budget-categories'
import { usePotMutations } from '~/hooks/use-pots/use-pot-mutations'
import { ColorSelect } from '~/components/ui/color-select'
import isEqual from 'lodash/isEqual'

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
  pots: Pot[]
  usedColors?: string[]
}

export function EditPotModal({
  isOpen,
  potId,
  onClose,
  pots,
  usedColors = [],
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
  const maxNameLength = 30

  const { updatePot } = usePotMutations()

  // Track if form has changes using deep comparison
  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  // Combine pot colors with other used colors, excluding current pot
  const allUsedColors = useMemo(() => {
    const otherPotColors = pots
      .filter((pot) => String(pot.id) !== potId)
      .map((pot) => pot.theme)
    return [...otherPotColors, ...usedColors]
  }, [pots, potId, usedColors])

  useEffect(() => {
    if (isOpen && potId && pots) {
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
    }
  }

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        target: e.target.value,
      },
    }))
  }

  const handleThemeChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        theme: value,
      },
    }))
  }

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

    try {
      await updatePot.mutateAsync({
        potId,
        name: formState.current.name,
        target: parseFloat(formState.current.target),
        theme: formState.current.theme,
      })
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update pot')
      }
      console.error('Failed to update pot:', error)
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
            <label id='edit-pot-target-label' className='text-sm font-medium'>
              Target
            </label>
            <div aria-labelledby='edit-pot-target-label' className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-500'>£</span>
              </div>
              <Input
                type='number'
                placeholder='e.g. 110.00'
                value={formState.current.target}
                onChange={handleTargetChange}
                min='0'
                step='0.01'
                required
                className='pl-7'
              />
            </div>
            <div className='text-sm text-gray-600 mt-1'>
              {formState.current.target
                ? `New target amount: £${parseFloat(formState.current.target).toFixed(2)}`
                : ''}
            </div>
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
            disabled={
              updatePot.isPending ||
              !formState.current.name ||
              !formState.current.target ||
              !formState.current.theme ||
              !hasChanges
            }
          >
            {updatePot.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
