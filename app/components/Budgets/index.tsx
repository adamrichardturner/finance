import { useState } from 'react'
import { Button } from '../ui/button'
import { BudgetCard } from './BudgetCard'
import { AddBudgetModal } from './AddBudgetModal'
import { EditBudgetModal } from './EditBudgetModal'
import { DeleteBudgetModal } from './DeleteBudgetModal'
import { BudgetChart } from './BudgetChart'
import { Budget } from '~/types/finance.types'
import PageTitle from '../PageTitle'

interface BudgetModalState {
  isOpen: boolean
  budgetId?: string
}

interface BudgetsProps {
  budgets: Budget[]
  actionData?: {
    error?: string
    budget?: any
    success?: boolean
  }
}

export function Budgets({ budgets, actionData }: BudgetsProps) {
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
        <PageTitle title='Budgets' />
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

      <div className='flex flex-col max-[1457px]:flex-col min-[1457px]:flex-row gap-6'>
        <div className='w-full min-[1457px]:w-[400px]'>
          <div className='bg-white rounded-lg p-6 border'>
            <BudgetChart budgets={budgets} />
          </div>
        </div>

        <div className='w-full min-[1457px]:w-2/3 space-y-6'>
          {budgets.length === 0 ? (
            <div className='text-center py-4 text-gray-500'>
              No budgets created yet
            </div>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={(id) => setEditModal({ isOpen: true, budgetId: id })}
                onDelete={(id) =>
                  setDeleteModal({ isOpen: true, budgetId: id })
                }
              />
            ))
          )}
        </div>
      </div>

      <AddBudgetModal
        budgets={budgets}
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <EditBudgetModal
        isOpen={editModal.isOpen}
        budgetId={editModal.budgetId}
        onClose={() => setEditModal({ isOpen: false })}
        budgets={budgets}
      />

      <DeleteBudgetModal
        isOpen={deleteModal.isOpen}
        budgetId={deleteModal.budgetId}
        onClose={() => setDeleteModal({ isOpen: false })}
      />
    </div>
  )
}
