import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useBudgetMutations } from '~/hooks/use-budgets/use-budget-mutations'

interface DeleteBudgetModalProps {
  isOpen: boolean
  budgetId?: string
  budgetName?: string
  onClose: () => void
}

export function DeleteBudgetModal({
  isOpen,
  budgetId,
  budgetName = 'Budget',
  onClose,
}: DeleteBudgetModalProps) {
  const [error, setError] = useState<string | null>(null)
  const { deleteBudget } = useBudgetMutations()

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleDelete = async () => {
    if (!budgetId) {
      return
    }

    try {
      setError(null)
      await deleteBudget.mutateAsync({ budgetId })

      // Always close the modal after server responds (successful)
      onClose()
    } catch (error) {
      // Only in case of errors, we keep the modal open
      const message =
        error instanceof Error ? error.message : 'Failed to delete budget'
      setError(message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Budget</DialogTitle>
        </DialogHeader>
        <div className='text-sm text-gray-600 mt-1 mb-4'>
          Are you sure you want to delete &quot;{budgetName}&quot;? This action
          cannot be undone and all the associated data will be permanently
          removed.
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
            disabled={deleteBudget.isPending}
          >
            {deleteBudget.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
