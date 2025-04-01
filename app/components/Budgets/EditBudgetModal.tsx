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
import { Form } from '@remix-run/react'

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

  const handleSubmit = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <Form method='post' onSubmit={handleSubmit} className='space-y-6'>
          <input type='hidden' name='intent' value='update' />
          <input type='hidden' name='budgetId' value={budgetId} />
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Budget Category</label>
            <Select
              name='category'
              value={category}
              onValueChange={setCategory}
              required
            >
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
              name='maxAmount'
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
          >
            Save Budget
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
