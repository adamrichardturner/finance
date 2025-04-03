import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Pot } from '~/types/finance.types'
import { usePotMutations } from '~/hooks/use-pot-mutations'

interface DeletePotModalProps {
  isOpen: boolean
  potId?: string
  onClose: () => void
  pots?: Pot[]
}

export function DeletePotModal({
  isOpen,
  potId,
  onClose,
  pots = [],
}: DeletePotModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [potName, setPotName] = useState<string | null>(null)

  const { deletePot } = usePotMutations()

  // Reset state when modal closes
  const handleClose = () => {
    setError(null)
    onClose()
  }

  // Set pot name for confirmation message
  useEffect(() => {
    if (isOpen && potId && pots.length > 0) {
      const currentPot = pots.find((p) => String(p.id) === potId)
      setPotName(currentPot?.name ? `'${currentPot.name}'` : "'Savings'")
    } else if (isOpen && potId) {
      setPotName("'Savings'")
    }
  }, [isOpen, potId, pots])

  const handleDelete = async () => {
    if (!potId) {
      setError('Invalid pot ID')
      return
    }

    try {
      await deletePot.mutateAsync({ potId })
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to delete pot')
      }
      console.error('Failed to delete pot:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete {potName}?</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <p className='text-sm text-gray-500'>
            Are you sure you want to delete this pot? This action cannot be
            reversed, and all the data inside it will be removed forever.
          </p>

          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='flex flex-col gap-2 pt-4'>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deletePot.isPending}
              className='w-full bg-red-600 hover:bg-red-700'
            >
              {deletePot.isPending ? 'Deleting...' : 'Yes, Confirm Deletion'}
            </Button>
            <Button variant='outline' onClick={handleClose} className='w-full'>
              No, Go Back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
