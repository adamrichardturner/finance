import { useState, useMemo, useCallback } from 'react'
import { Button } from '../ui/button'
import { PotCard } from './PotCard'
import { AddPotModal } from './AddPotModal'
import { EditPotModal } from './EditPotModal'
import { DeletePotModal } from './DeletePotModal'
import { Pot, Budget } from '~/types/finance.types'
import PageTitle from '../PageTitle'

interface PotModalState {
  isOpen: boolean
  potId?: string
}

interface PotsProps {
  pots: Pot[]
  actionData?: any
  currentBalance?: number
  budgets?: Budget[]
}

export function Pots({
  pots,
  actionData,
  currentBalance = 0,
  budgets = [],
}: PotsProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<PotModalState>({
    isOpen: false,
  })
  const [deleteModal, setDeleteModal] = useState<PotModalState>({
    isOpen: false,
  })

  const handleOpenAddModal = useCallback(() => setAddModalOpen(true), [])
  const handleCloseAddModal = useCallback(() => setAddModalOpen(false), [])

  const handleOpenEditModal = useCallback((id: string) => {
    setEditModal({ isOpen: true, potId: id })
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setEditModal({ isOpen: false })
  }, [])

  const handleOpenDeleteModal = useCallback((id: string) => {
    setDeleteModal({ isOpen: true, potId: id })
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false })
  }, [])

  const budgetColors = useMemo(() => {
    return budgets.map((budget) => budget.theme)
  }, [budgets])

  const memoizedPotCards = useMemo(() => {
    if (pots.length === 0) {
      return (
        <div className='text-center py-8 bg-white rounded-lg'>
          <h3 className='text-xl font-medium text-gray-700 mb-2'>
            No Saving Pots Yet
          </h3>
          <p className='text-gray-500 mb-6'>
            Create saving pots to track your financial goals
          </p>
          <Button
            onClick={handleOpenAddModal}
            className='bg-black text-white hover:bg-black/90'
          >
            + Create Your First Pot
          </Button>
        </div>
      )
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {pots.map((pot) => (
          <div key={pot.id}>
            <PotCard
              pot={pot}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              currentBalance={currentBalance}
            />
          </div>
        ))}
      </div>
    )
  }, [
    pots,
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
    currentBalance,
  ])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <PageTitle title='Pots' />
        {pots.length > 0 && (
          <Button
            onClick={handleOpenAddModal}
            className='bg-black text-white hover:bg-black/90'
          >
            + Add New Pot
          </Button>
        )}
      </div>

      {actionData?.error && (
        <div className='rounded-md bg-red-50 p-4 text-red-600'>
          {actionData.error}
        </div>
      )}

      {memoizedPotCards}

      <AddPotModal
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        pots={pots}
        usedColors={budgetColors}
      />

      <EditPotModal
        isOpen={editModal.isOpen}
        potId={editModal.potId}
        onClose={handleCloseEditModal}
        pots={pots}
        usedColors={budgetColors}
      />

      <DeletePotModal
        isOpen={deleteModal.isOpen}
        potId={deleteModal.potId}
        onClose={handleCloseDeleteModal}
      />
    </div>
  )
}
