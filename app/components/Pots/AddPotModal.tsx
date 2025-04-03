import { useState } from 'react'
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
import { usePotMutations } from '~/hooks/use-pot-mutations'
import { THEME_COLORS } from '~/utils/budget-categories'

interface AddPotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddPotModal({ isOpen, onClose }: AddPotModalProps) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [theme, setTheme] = useState(THEME_COLORS[0].value)
  const [error, setError] = useState<string | null>(null)
  const maxNameLength = 30

  const { createPot } = usePotMutations()

  // Reset form when modal closes
  const handleClose = () => {
    setName('')
    setTarget('')
    setTheme(THEME_COLORS[0].value)
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

    if (!name || !target || !theme) {
      setError('Please fill in all fields')
      return
    }

    try {
      await createPot.mutateAsync({
        name,
        target: parseFloat(target),
        theme,
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
            <label className='text-sm font-medium'>Pot Name</label>
            <div className='relative'>
              <Input
                type='text'
                placeholder='e.g. New Laptop'
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
                placeholder='e.g. 2000'
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
            disabled={createPot.isPending || !name || !target || !theme}
          >
            {createPot.isPending ? 'Creating...' : 'Add Pot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
