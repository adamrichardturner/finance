import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useFinancialData } from '~/hooks/use-financial-data'
import { useBudgetMutations } from '~/hooks/use-budget-mutations'

interface DeleteBudgetModalProps {
  isOpen: boolean
  budgetId?: string
  onClose: () => void
}

export function DeleteBudgetModal({
  isOpen,
  budgetId,
  onClose,
}: DeleteBudgetModalProps) {
  const [error, setError] = useState<string | null>(null)
  const { financialData } = useFinancialData()
  const { deleteBudget } = useBudgetMutations()

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const budgetName = useMemo(() => {
    if (budgetId && financialData?.budgets) {
      const budget = financialData.budgets.find(
        (b) => String(b.id) === budgetId
      )
      return budget?.category || 'Budget'
    }
    return 'Budget'
  }, [budgetId, financialData?.budgets])

  const handleDelete = async () => {
    if (!budgetId) {
      return
    }

    try {
      await deleteBudget.mutateAsync({ budgetId })
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to delete budget')
      }
      console.error('Failed to delete budget:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Budget</DialogTitle>
        </DialogHeader>
        <div className='text-sm text-gray-600 mt-1 mb-4'>
          Are you sure you want to delete "{budgetName}"? This action cannot be
          undone and all the associated data will be permanently removed.
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
