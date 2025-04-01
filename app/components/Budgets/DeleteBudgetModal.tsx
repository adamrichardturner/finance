import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
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
  const { financialData } = useFinancialData()
  const { deleteBudget } = useBudgetMutations()
  const budget = budgetId
    ? financialData.budgets.find((b) => String(b.id) === budgetId)
    : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budgetId) {
      return
    }

    try {
      await deleteBudget.mutateAsync({ budgetId })
      onClose()
    } catch (error) {
      console.error('Failed to delete budget:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete '{budget?.category}'?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this budget? This action cannot be
            undone and all the associated data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex justify-end gap-4'>
          <Button variant='outline' onClick={onClose} type='button'>
            Cancel
          </Button>
          <Button
            type='submit'
            className='bg-red-600 text-white hover:bg-red-700'
            disabled={deleteBudget.isPending}
          >
            {deleteBudget.isPending ? 'Deleting...' : 'Yes, Confirm Deletion'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
