import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { usePotMutations } from '~/hooks/use-pots/use-pot-mutations'
import { THEME_COLORS } from '~/utils/budget-categories'
import { ColorSelect } from '~/components/ui/color-select'
import isEqual from 'lodash/isEqual'
import { Pot } from '~/types/finance.types'

interface PotFormValues {
  name: string
  target: string
  theme: string
}

interface FormState {
  original: PotFormValues
  current: PotFormValues
}

interface AddPotModalProps {
  isOpen: boolean
  onClose: () => void
  pots?: Pot[]
  usedColors?: string[]
}

export function AddPotModal({
  isOpen,
  onClose,
  pots = [],
  usedColors = [],
}: AddPotModalProps) {
  const initialValues: PotFormValues = {
    name: '',
    target: '',
    theme: THEME_COLORS[0].value,
  }

  const [formState, setFormState] = useState<FormState>({
    original: initialValues,
    current: initialValues,
  })

  const [error, setError] = useState<string | null>(null)
  const maxNameLength = 30

  const { createPot } = usePotMutations()

  // Combine pot colors with other used colors
  const allUsedColors = useMemo(() => {
    const potColors = pots.map((pot) => pot.theme)
    return [...potColors, ...usedColors]
  }, [pots, usedColors])

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

    if (
      !formState.current.name ||
      !formState.current.target ||
      !formState.current.theme
    ) {
      setError('Please fill in all fields')
      return
    }

    try {
      await createPot.mutateAsync({
        name: formState.current.name,
        target: parseFloat(formState.current.target),
        theme: formState.current.theme,
      })
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to create pot')
      }
      console.error('Failed to create pot:', error)
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
            <div aria-labelledby='pot-target-label' className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-500'>£</span>
              </div>
              <Input
                type='number'
                placeholder='e.g. 2000'
                value={formState.current.target}
                onChange={handleTargetChange}
                min='0'
                step='0.01'
                required
                className='pl-7'
              />
            </div>
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

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={
              createPot.isPending ||
              !formState.current.name ||
              !formState.current.target ||
              !formState.current.theme ||
              !hasChanges
            }
          >
            {createPot.isPending ? 'Creating...' : 'Add Pot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
