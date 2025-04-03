import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Pot } from '~/types/finance.types'
import { THEME_COLORS } from '~/utils/budget-categories'
import { usePotMutations } from '~/hooks/use-pot-mutations'

interface EditPotModalProps {
  isOpen: boolean
  potId?: string
  onClose: () => void
  pots: Pot[]
}

export function EditPotModal({
  isOpen,
  potId,
  onClose,
  pots,
}: EditPotModalProps) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [theme, setTheme] = useState(THEME_COLORS[0].value)
  const [error, setError] = useState<string | null>(null)
  const maxNameLength = 30

  const { updatePot } = usePotMutations()

  useEffect(() => {
    if (isOpen && potId && pots) {
      const currentPot = pots.find((p) => String(p.id) === potId)

      if (currentPot) {
        setName(currentPot.name)
        setTarget(currentPot.target.toString())
        setTheme(currentPot.theme)
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
      setName(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!potId) {
      return
    }

    if (!name || !target || !theme) {
      setError('Please fill in all fields')
      return
    }

    try {
      await updatePot.mutateAsync({
        potId,
        name,
        target: parseFloat(target),
        theme,
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
            <label className='text-sm font-medium'>Pot Name</label>
            <div className='relative'>
              <Input
                type='text'
                placeholder='e.g. Concert Ticket'
                value={name}
                onChange={handleNameChange}
                required
              />
              <div className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400'>
                {maxNameLength - name.length} characters left
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Target</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-500'>£</span>
              </div>
              <Input
                type='number'
                placeholder='e.g. 110.00'
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                min='0'
                step='0.01'
                required
                className='pl-7'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Theme</label>
            <Select value={theme} onValueChange={setTheme} required>
              <SelectTrigger>
                <SelectValue>
                  {theme && (
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: theme }}
                      />
                      <span>Green</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {THEME_COLORS.map((color) => (
                  <SelectItem key={color.name} value={color.value}>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={updatePot.isPending || !name || !target || !theme}
          >
            {updatePot.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
