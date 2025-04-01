import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { useFinancialData } from '~/hooks/use-financial-data'
import { Form } from '@remix-run/react'

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
  const budget = budgetId
    ? financialData.budgets.find((b) => String(b.id) === budgetId)
    : undefined

  const handleSubmit = () => {
    onClose()
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
        <Form
          method='post'
          onSubmit={handleSubmit}
          className='flex justify-end gap-4'
        >
          <input type='hidden' name='intent' value='delete' />
          <input type='hidden' name='budgetId' value={budgetId} />
          <Button variant='outline' onClick={onClose} type='button'>
            Cancel
          </Button>
          <Button
            type='submit'
            className='bg-red-600 text-white hover:bg-red-700'
          >
            Yes, Confirm Deletion
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
