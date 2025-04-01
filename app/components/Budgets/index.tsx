import { useState } from 'react'
import { useFinancialData } from '~/hooks/use-financial-data'
import { Button } from '../ui/button'
import { BudgetCard } from './BudgetCard'
import { AddBudgetModal } from './AddBudgetModal'
import { EditBudgetModal } from './EditBudgetModal'
import { DeleteBudgetModal } from './DeleteBudgetModal'
import { BudgetChart } from './BudgetChart'
import { Form } from '@remix-run/react'

interface BudgetModalState {
  isOpen: boolean
  budgetId?: string
}

interface BudgetsProps {
  actionData?: {
    error?: string
    budget?: any
    success?: boolean
  }
}

export function Budgets({ actionData }: BudgetsProps) {
  const { financialData } = useFinancialData()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<BudgetModalState>({
    isOpen: false,
  })
  const [deleteModal, setDeleteModal] = useState<BudgetModalState>({
    isOpen: false,
  })

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Budgets</h1>
        <Button
          onClick={() => setAddModalOpen(true)}
          className='bg-black text-white hover:bg-black/90'
        >
          + Add New Budget
        </Button>
      </div>

      {actionData?.error && (
        <div className='rounded-md bg-red-50 p-4 text-red-600'>
          {actionData.error}
        </div>
      )}

      <div className='flex gap-6'>
        <div className='w-[400px]'>
          <div className='bg-white rounded-lg p-6 border'>
            <h2 className='text-lg font-medium mb-4'>Spending Summary</h2>
            <BudgetChart budgets={financialData.budgets} />
          </div>
        </div>

        <div className='w-2/3 space-y-6'>
          {financialData.budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={(id) => setEditModal({ isOpen: true, budgetId: id })}
              onDelete={(id) => setDeleteModal({ isOpen: true, budgetId: id })}
            />
          ))}
        </div>
      </div>

      <AddBudgetModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <EditBudgetModal
        isOpen={editModal.isOpen}
        budgetId={editModal.budgetId}
        onClose={() => setEditModal({ isOpen: false })}
      />

      <DeleteBudgetModal
        isOpen={deleteModal.isOpen}
        budgetId={deleteModal.budgetId}
        onClose={() => setDeleteModal({ isOpen: false })}
      />
    </div>
  )
}
