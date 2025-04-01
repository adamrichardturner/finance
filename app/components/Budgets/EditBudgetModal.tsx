import { useEffect, useState } from 'react'
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
import { useFinancialData } from '~/hooks/use-financial-data'
import { useBudgetMutations } from '~/hooks/use-budget-mutations'

interface EditBudgetModalProps {
  isOpen: boolean
  budgetId?: string
  onClose: () => void
}

export function EditBudgetModal({
  isOpen,
  budgetId,
  onClose,
}: EditBudgetModalProps) {
  const { financialData } = useFinancialData()
  const { updateBudget } = useBudgetMutations()
  const [category, setCategory] = useState<string>('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!budgetId) {
      return
    }

    const budget = financialData.budgets.find((b) => String(b.id) === budgetId)
    if (budget) {
      setCategory(String(budget.category))
      setAmount(budget.maximum.toString())
    }
  }, [budgetId, financialData.budgets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budgetId) {
      return
    }

    try {
      await updateBudget.mutateAsync({
        budgetId,
        category,
        maxAmount: parseFloat(amount),
      })
      onClose()
    } catch (error) {
      console.error('Failed to update budget:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Budget Category</label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Entertainment'>Entertainment</SelectItem>
                <SelectItem value='Bills'>Bills</SelectItem>
                <SelectItem value='Dining Out'>Dining Out</SelectItem>
                <SelectItem value='Transportation'>Transportation</SelectItem>
                <SelectItem value='Personal Care'>Personal Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Maximum Amount</label>
            <Input
              type='number'
              placeholder='Enter amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min='0'
              step='0.01'
              required
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={updateBudget.isPending}
          >
            {updateBudget.isPending ? 'Saving...' : 'Save Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
