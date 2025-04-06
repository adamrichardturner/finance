import { useState, useMemo, useCallback } from 'react'
import { Button } from '../ui/button'
import { BudgetCard } from './BudgetCard'
import { AddBudgetModal } from './AddBudgetModal'
import { EditBudgetModal } from './EditBudgetModal'
import { DeleteBudgetModal } from './DeleteBudgetModal'
import { BudgetChart } from './BudgetChart'
import { Budget, Pot } from '~/types/finance.types'
import PageTitle from '../PageTitle'
import { getAvailableCategories } from '~/utils/budget-categories'

interface BudgetModalState {
  isOpen: boolean
  budgetId?: string
  budgetName?: string
}

interface BudgetsProps {
  budgets: Budget[]
  pots?: Pot[]
  monthlyIncome?: number
  actionData?: {
    error?: string
    success?: boolean
    budget?: Budget
  }
}

export function Budgets({
  budgets,
  pots = [],
  monthlyIncome = 0,
  actionData,
}: BudgetsProps) {
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

  const handleOpenDeleteModal = useCallback(
    (id: string) => {
      // Find the budget with this ID to get its name
      const budget = budgets.find((b) => String(b.id) === id)
      setDeleteModal({
        isOpen: true,
        budgetId: id,
        budgetName: budget?.category || 'Unknown',
      })
    },
    [budgets]
  )

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false })
  }, [])

  // Check if there are any available budget categories left
  const availableCategories = useMemo(() => {
    return getAvailableCategories(budgets)
  }, [budgets])

  // Check if all budget categories have been used
  const allCategoriesUsed = useMemo(() => {
    return availableCategories.length === 0
  }, [availableCategories])

  const memoizedBudgetChart = useMemo(() => {
    return <BudgetChart budgets={budgets} />
  }, [budgets])

  const memoizedBudgetCards = useMemo(() => {
    if (budgets.length === 0) {
      return (
        <div className='w-full bg-white rounded-lg shadow-sm flex flex-col items-center justify-center p-16 gap-6 min-h-[320px]'>
          <div className='text-xl font-medium text-gray-600'>
            No budgets created yet
          </div>
          <div className='text-gray-500 text-center max-w-md'>
            Create budgets to help you track and manage your spending in
            different categories
          </div>
          <Button
            onClick={handleOpenAddModal}
            className='bg-black text-white hover:bg-black/90'
            disabled={allCategoriesUsed}
          >
            <div className='flex items-center gap-2'>
              <span className='text-xl'>+</span>
              <span>Create Your First Budget</span>
            </div>
          </Button>
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
  }, [
    budgets,
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleOpenAddModal,
    allCategoriesUsed,
  ])

  const potColors = useMemo(() => {
    return pots.map((pot) => pot.theme)
  }, [pots])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-end'>
        <div className='w-full flex items-center justify-between'>
          <PageTitle title='Budgets' />
          {budgets.length > 0 && (
            <Button
              onClick={handleOpenAddModal}
              className='bg-black text-white hover:bg-black/90'
              disabled={allCategoriesUsed}
            >
              + Add New Budget
            </Button>
          )}
        </div>
        {allCategoriesUsed && budgets.length > 0 && (
          <div className='text-gray-500 text-[12px] mt-1 mr-1'>
            All budget categories have been used
          </div>
        )}
      </div>

      {actionData?.error && (
        <div className='rounded-md bg-red-50 p-4 text-red-600'>
          {actionData.error}
        </div>
      )}

      {budgets.length > 0 ? (
        <div className='flex flex-col max-[1457px]:flex-col min-[1457px]:flex-row gap-6'>
          <div className='w-full min-[1457px]:w-[400px]'>
            <div className='bg-white rounded-lg p-6'>{memoizedBudgetChart}</div>
          </div>

          <div className='w-full min-[1457px]:w-2/3 space-y-6'>
            {memoizedBudgetCards}
          </div>
        </div>
      ) : (
        <div className='w-full'>{memoizedBudgetCards}</div>
      )}

      <AddBudgetModal
        budgets={budgets}
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        usedColors={potColors}
        monthlyIncome={monthlyIncome}
      />

      <EditBudgetModal
        isOpen={editModal.isOpen}
        budgetId={editModal.budgetId}
        onClose={handleCloseEditModal}
        budgets={budgets}
        usedColors={potColors}
        monthlyIncome={monthlyIncome}
      />

      <DeleteBudgetModal
        isOpen={deleteModal.isOpen}
        budgetId={deleteModal.budgetId}
        budgetName={deleteModal.budgetName}
        onClose={handleCloseDeleteModal}
      />
    </div>
  )
}
