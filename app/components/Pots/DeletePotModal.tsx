import { useState, useEffect, useMemo } from 'react'
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
  const { deletePot } = usePotMutations()

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const potName = useMemo(() => {
    if (potId && pots.length > 0) {
      const currentPot = pots.find((p) => String(p.id) === potId)
      return currentPot?.name ? `'${currentPot.name}'` : "'Savings'"
    }
    return "'Savings'"
  }, [potId, pots])

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
