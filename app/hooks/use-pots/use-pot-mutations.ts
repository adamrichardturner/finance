import { useFetcher } from '@remix-run/react'
import { useState, useCallback } from 'react'
import { useFactories } from '~/factories'
import {
  PotCommandExecutor,
  CreatePotParams as CommandCreatePotParams,
  UpdatePotParams as CommandUpdatePotParams,
  DeletePotParams,
  MoneyTransactionParams,
  PotCommandResult,
} from '~/commands/pots'

/**
 * Hook that provides pot mutation capabilities using the Command pattern
 * and Factory pattern for entity creation and validation
 */
export const usePotMutations = () => {
  const fetcher = useFetcher()
  const [isPending, setIsPending] = useState(false)
  const { pots: potFactory } = useFactories()

  // Create the command executor with the submit function
  const commandExecutor = new PotCommandExecutor(
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
  const createPot = {
    mutateAsync: async (params: CommandCreatePotParams) => {
      // Validate using our factory first
      try {
        // Validate basic requirements before sending to backend
        potFactory.validate({
          name: params.name,
          target: params.target,
          theme: params.theme,
        })

        setIsPending(true)
        const result = await commandExecutor.create(params)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to create pot')
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Create a wrapper for the update command
  const updatePot = {
    mutateAsync: async (params: CommandUpdatePotParams) => {
      try {
        // Validate basic requirements
        if (params.name !== undefined) {
          potFactory.validate({
            name: params.name,
            target: 1, // Dummy value for validation
            theme: 'dummy', // Dummy value for validation
          })
        }

        if (
          params.target !== undefined &&
          (typeof params.target !== 'number' || params.target <= 0)
        ) {
          throw new Error('Target amount must be a positive number')
        }

        setIsPending(true)
        const result = await commandExecutor.update(params)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to update pot')
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Create a wrapper for the delete command
  const deletePot = {
    mutateAsync: async (data: DeletePotParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.delete(data)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to delete pot')
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Create a wrapper for the add money command
  const addMoney = {
    mutateAsync: async (data: MoneyTransactionParams) => {
      // Validate the amount
      if (typeof data.amount !== 'number' || data.amount <= 0) {
        throw new Error('Amount must be a positive number')
      }

      setIsPending(true)
      try {
        const result = await commandExecutor.addMoney(data)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to add money to pot')
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Create a wrapper for the withdraw command
  const withdraw = {
    mutateAsync: async (data: MoneyTransactionParams) => {
      // Validate the amount
      if (typeof data.amount !== 'number' || data.amount <= 0) {
        throw new Error('Amount must be a positive number')
      }

      setIsPending(true)
      try {
        const result = await commandExecutor.withdraw(data)
        if (result.error) {
          throw new Error(result.error)
        }
        return result
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to withdraw from pot')
      } finally {
        setIsPending(false)
      }
    },
    isPending: isPending || fetcher.state === 'submitting',
  }

  // Return the same interface as before to maintain compatibility
  return {
    createPot,
    updatePot,
    deletePot,
    addMoney,
    withdraw,
    // Add command history access for debugging or future undo functionality
    getCommandHistory: () => commandExecutor.getCommandHistory(),
    clearCommandHistory: () => commandExecutor.clearHistory(),
  }
}
