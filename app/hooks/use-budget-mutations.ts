import { useFetcher } from '@remix-run/react'
import { Budget } from '~/types/finance.types'

interface CreateBudgetParams {
  category: string
  maxAmount: number
  theme: string
}

interface UpdateBudgetParams {
  budgetId: string
  category: string
  maxAmount: number
}

interface DeleteBudgetParams {
  budgetId: string
}

export function useBudgetMutations() {
  const fetcher = useFetcher()

  const createBudget = {
    mutateAsync: async (data: CreateBudgetParams) => {
      const formData = new FormData()
      formData.append('intent', 'create')
      formData.append('category', data.category)
      formData.append('maxAmount', data.maxAmount.toString())
      formData.append('theme', data.theme)

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/budgets',
      })

      return result as unknown as { budget: Budget }
    },
    isPending: fetcher.state === 'submitting',
  }

  const updateBudget = {
    mutateAsync: async (data: UpdateBudgetParams) => {
      const formData = new FormData()
      formData.append('intent', 'update')
      formData.append('budgetId', data.budgetId)
      formData.append('category', data.category)
      formData.append('maxAmount', data.maxAmount.toString())

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/budgets',
      })

      return result as unknown as { budget: Budget }
    },
    isPending: fetcher.state === 'submitting',
  }

  const deleteBudget = {
    mutateAsync: async (data: DeleteBudgetParams) => {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('budgetId', data.budgetId)

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/budgets',
      })

      return result as unknown as { success: true }
    },
    isPending: fetcher.state === 'submitting',
  }

  return {
    createBudget,
    updateBudget,
    deleteBudget,
  }
}
