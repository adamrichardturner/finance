import { useState, useMemo, useCallback } from 'react'
import { Button } from '../ui/button'
import { BudgetCard } from './BudgetCard'
import { AddBudgetModal } from './AddBudgetModal'
import { EditBudgetModal } from './EditBudgetModal'
import { DeleteBudgetModal } from './DeleteBudgetModal'
import { BudgetChart } from './BudgetChart'
import { Budget, Pot } from '~/types/finance.types'
import PageTitle from '../PageTitle'

interface BudgetModalState {
  isOpen: boolean
  budgetId?: string
}

interface BudgetsProps {
  budgets: Budget[]
  pots?: Pot[]
  actionData?: {
    error?: string
    budget?: any
    success?: boolean
  }
}

export function Budgets({ budgets, pots = [], actionData }: BudgetsProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<BudgetModalState>({
    isOpen: false,
  })
  const [deleteModal, setDeleteModal] = useState<BudgetModalState>({
    isOpen: false,
  })

  const handleOpenAddModal = useCallback(() => setAddModalOpen(true), [])
  const handleCloseAddModal = useCallback(() => setAddModalOpen(false), [])

  const handleOpenEditModal = useCallback((id: string) => {
    setEditModal({ isOpen: true, budgetId: id })
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setEditModal({ isOpen: false })
  }, [])

  const handleOpenDeleteModal = useCallback((id: string) => {
    setDeleteModal({ isOpen: true, budgetId: id })
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false })
  }, [])

  const memoizedBudgetChart = useMemo(() => {
    return <BudgetChart budgets={budgets} />
  }, [budgets])

  const memoizedBudgetCards = useMemo(() => {
    if (budgets.length === 0) {
      return (
        <div className='text-center py-4 text-gray-500'>
          No budgets created yet
        </div>
      )
    }

    return budgets.map((budget) => (
      <BudgetCard
        key={budget.id}
        budget={budget}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />
    ))
  }, [budgets, handleOpenEditModal, handleOpenDeleteModal])

  const potColors = useMemo(() => {
    return pots.map((pot) => pot.theme)
  }, [pots])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <PageTitle title='Budgets' />
        <Button
          onClick={handleOpenAddModal}
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
          <div className='bg-white rounded-lg p-6'>{memoizedBudgetChart}</div>
        </div>

        <div className='w-full min-[1457px]:w-2/3 space-y-6'>
          {memoizedBudgetCards}
        </div>
      </div>

      <AddBudgetModal
        budgets={budgets}
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        usedColors={potColors}
      />

      <EditBudgetModal
        isOpen={editModal.isOpen}
        budgetId={editModal.budgetId}
        onClose={handleCloseEditModal}
        budgets={budgets}
        usedColors={potColors}
      />

      <DeleteBudgetModal
        isOpen={deleteModal.isOpen}
        budgetId={deleteModal.budgetId}
        onClose={handleCloseDeleteModal}
      />
    </div>
  )
}
