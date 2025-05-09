import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { usePotMutations } from '~/hooks/use-pots/use-pot-mutations'
import { Pot } from '~/types/finance.types'
import { formatCurrency } from '~/utils/number-formatter'

interface DeletePotModalProps {
  isOpen: boolean
  potId?: string
  onClose: () => void
  pots?: Pot[] | null
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
    if (!potId || !Array.isArray(pots) || pots.length === 0) {
      return 'Savings'
    }

    const pot = pots.find((p) => String(p.id) === potId)
    return pot?.name || 'Savings'
  }, [potId, pots])

  const handleDelete = async () => {
    if (!potId) {
      setError('Invalid pot ID')
      return
    }

    setError(null)

    try {
      await deletePot.mutateAsync({ potId })

      // Explicitly close the modal after successful deletion
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Pot</DialogTitle>
        </DialogHeader>
        <div className='text-sm text-gray-600 mt-1 mb-4'>
          Are you sure you want to delete &quot;{potName}&quot;? This action
          cannot be undone.
          {Array.isArray(pots) && potId && (
            <p className='mt-2'>
              {(() => {
                const pot = pots.find((p) => String(p.id) === potId)
                if (pot && pot.total > 0) {
                  return `Any funds (${formatCurrency(pot.total)}) will be returned to your main balance.`
                }
                return ''
              })()}
            </p>
          )}
        </div>

        {error && (
          <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4'>
            {error}
          </div>
        )}

        <div className='flex space-x-2'>
          <Button variant='outline' className='flex-1' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            className='flex-1'
            onClick={handleDelete}
            disabled={deletePot.isPending}
          >
            {deletePot.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
