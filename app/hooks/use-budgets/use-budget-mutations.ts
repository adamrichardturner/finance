import { useFetcher } from '@remix-run/react'
import { useState, useCallback } from 'react'
import { Budget } from '~/types/finance.types'
import { useBudgetsData } from './use-budgets-data'
import { BudgetCommandExecutor } from '~/commands/budgets/budget-command-executor'
import {
  CreateBudgetParams,
  UpdateBudgetParams,
  DeleteBudgetParams,
} from '~/commands/budgets/budget-commands'

/**
 * Hook that provides budget mutation capabilities using the Command pattern
 */
export function useBudgetMutations() {
  const fetcher = useFetcher()
  const { data: existingBudgets } = useBudgetsData()
  const [isPending, setIsPending] = useState(false)

  // Create the command executor with the submit function
  const commandExecutor = new BudgetCommandExecutor(
    useCallback(
      (
        formData: FormData,
        options: {
          method: 'get' | 'post' | 'put' | 'patch' | 'delete'
          action: string
        }
      ) => {
        return fetcher.submit(formData, options)
      },
      [fetcher]
    )
  )

  // Create a wrapper for the create command
  const createBudget = {
    mutateAsync: async (data: CreateBudgetParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.create(data, existingBudgets)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Create a wrapper for the update command
  const updateBudget = {
    mutateAsync: async (data: UpdateBudgetParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.update(data, existingBudgets)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Create a wrapper for the delete command
  const deleteBudget = {
    mutateAsync: async (data: DeleteBudgetParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.delete(data)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Return the same interface as before to maintain compatibility
  return {
    createBudget,
    updateBudget,
    deleteBudget,
    // Add command history access for debugging or future undo functionality
    getCommandHistory: () => commandExecutor.getCommandHistory(),
    clearCommandHistory: () => commandExecutor.clearHistory(),
  }
}
