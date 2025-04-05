import { useFetcher } from '@remix-run/react'
import { useState, useCallback } from 'react'
import {
  BudgetCommandExecutor,
  CreateBudgetParams as CommandCreateBudgetParams,
  UpdateBudgetParams as CommandUpdateBudgetParams,
  DeleteBudgetParams,
} from '~/commands/budgets'
import { useBudgetsData } from './use-budgets-data'

// Interface for our local parameters with user ID
interface BudgetParams {
  category: string
  maxAmount: number
  theme?: string
  userId: string
}

interface UpdateParams extends Partial<Omit<BudgetParams, 'userId'>> {
  id: number
  userId: string
}

/**
 * Transforms budget params to command params
 */
function transformToCommandParams(
  params: BudgetParams
): CommandCreateBudgetParams {
  return {
    category: params.category,
    maxAmount: params.maxAmount,
    theme: params.theme || '',
    userId: params.userId,
  } as unknown as CommandCreateBudgetParams
}

/**
 * Hook that provides budget mutation capabilities using the Command pattern
 * and Factory pattern for entity creation and validation
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
        return new Promise<unknown>((resolve) => {
          // Submit the form
          fetcher.submit(formData, options)

          // Create a checker function to see when data is available
          const checkData = () => {
            // Only check when the fetcher is idle
            if (fetcher.state !== 'idle') {
              return false
            }

            // Log data to help with debugging
            console.log('Fetcher data:', fetcher.data)

            // We have data - no matter what, consider it a success
            if (fetcher.data) {
              resolve({
                ...fetcher.data,
                success: true,
              })
              return true
            }

            // No data case
            resolve({
              error: 'No response received from server',
              success: false,
            })
            return true
          }

          // Set up an interval to check
          const intervalId = setInterval(() => {
            if (checkData()) {
              clearInterval(intervalId)
            }
          }, 100)

          // Set a timeout to prevent hanging
          setTimeout(() => {
            clearInterval(intervalId)
            if (fetcher.state !== 'idle') {
              resolve({ error: 'Request timeout', success: false })
            }
          }, 5000)
        })
      },
      [fetcher]
    )
  )

  // Create a wrapper for the create command
  const createBudget = {
    mutateAsync: async (params: BudgetParams) => {
      // Validate basic parameters
      if (!params.category || !params.category.trim()) {
        throw new Error('Category is required')
      }

      if (params.maxAmount === undefined || params.maxAmount === null) {
        throw new Error('Maximum amount is required')
      }

      if (typeof params.maxAmount !== 'number' || params.maxAmount < 0) {
        throw new Error('Maximum amount must be a positive number')
      }

      if (params.category.toLowerCase() === 'income') {
        throw new Error('Income cannot be used as a budget category')
      }

      setIsPending(true)
      try {
        // Transform to command params and execute the command
        const commandParams = transformToCommandParams(params)
        const result = await commandExecutor.create(
          commandParams,
          existingBudgets
        )

        // Check for error in the result
        if (
          result &&
          typeof result === 'object' &&
          'error' in result &&
          result.error
        ) {
          throw new Error(result.error as string)
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
    mutateAsync: async (params: UpdateParams) => {
      // Validate the params
      if (!params.id) {
        throw new Error('Budget ID is required')
      }

      if (
        params.category !== undefined &&
        (!params.category || params.category.trim() === '')
      ) {
        throw new Error('Category cannot be empty')
      }

      if (
        params.category !== undefined &&
        params.category.toLowerCase() === 'income'
      ) {
        throw new Error('Income cannot be used as a budget category')
      }

      if (
        params.maxAmount !== undefined &&
        (typeof params.maxAmount !== 'number' || params.maxAmount < 0)
      ) {
        throw new Error('Maximum amount must be a positive number')
      }

      setIsPending(true)
      try {
        // Transform to command params
        const commandParams = {
          budgetId: params.id.toString(),
          category: params.category || '',
          maxAmount: params.maxAmount || 0,
          theme: params.theme || '',
          userId: params.userId,
        } as unknown as CommandUpdateBudgetParams

        const result = await commandExecutor.update(
          commandParams,
          existingBudgets
        )

        // Check for error in the result
        if (
          result &&
          typeof result === 'object' &&
          'error' in result &&
          result.error
        ) {
          throw new Error(result.error as string)
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

        // Check for error in the result
        if (
          result &&
          typeof result === 'object' &&
          'error' in result &&
          result.error
        ) {
          throw new Error(result.error as string)
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
