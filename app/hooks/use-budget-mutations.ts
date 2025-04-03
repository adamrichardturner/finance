import { useFetcher } from '@remix-run/react'
import { Budget } from '~/types/finance.types'
import { useBudgets } from './use-budgets'

interface CreateBudgetParams {
  category: string
  maxAmount: number
  theme: string
}

interface UpdateBudgetParams {
  budgetId: string
  category: string
  maxAmount: number
  theme: string
}

interface DeleteBudgetParams {
  budgetId: string
}

export function useBudgetMutations() {
  const fetcher = useFetcher()
  const { data: existingBudgets } = useBudgets()

  const createBudget = {
    mutateAsync: async (data: CreateBudgetParams) => {
      if (existingBudgets) {
        const normalizedNewCategory = data.category.toLowerCase().trim()
        const isDuplicate = existingBudgets.some(
          (budget) =>
            budget.category.toLowerCase().trim() === normalizedNewCategory
        )

        if (isDuplicate) {
          throw new Error(
            `A budget for category "${data.category}" already exists`
          )
        }
      }

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
      if (existingBudgets) {
        const normalizedNewCategory = data.category.toLowerCase().trim()
        const currentBudget = existingBudgets.find(
          (b) => String(b.id) === data.budgetId
        )

        if (
          currentBudget &&
          normalizedNewCategory !== currentBudget.category.toLowerCase().trim()
        ) {
          const isDuplicate = existingBudgets.some(
            (budget) =>
              budget.category.toLowerCase().trim() === normalizedNewCategory &&
              String(budget.id) !== data.budgetId
          )

          if (isDuplicate) {
            throw new Error(
              `A budget for category "${data.category}" already exists`
            )
          }
        }
      }

      const formData = new FormData()
      formData.append('intent', 'update')
      formData.append('budgetId', data.budgetId)
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
