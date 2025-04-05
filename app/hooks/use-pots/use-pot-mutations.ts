import { useFetcher } from '@remix-run/react'
import { useState, useCallback } from 'react'
import {
  PotCommandExecutor,
  CreatePotParams,
  UpdatePotParams,
  DeletePotParams,
  MoneyTransactionParams,
  PotCommandResult,
} from '~/commands/pots'

export const usePotMutations = () => {
  const fetcher = useFetcher()
  const [isPending, setIsPending] = useState(false)

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
    mutateAsync: async (data: CreatePotParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.create(data)
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
  const updatePot = {
    mutateAsync: async (data: UpdatePotParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.update(data)
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
  const deletePot = {
    mutateAsync: async (data: DeletePotParams) => {
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

  // Create a wrapper for the add money command
  const addMoney = {
    mutateAsync: async (data: MoneyTransactionParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.addMoney(data)
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

  // Create a wrapper for the withdraw command
  const withdraw = {
    mutateAsync: async (data: MoneyTransactionParams) => {
      setIsPending(true)
      try {
        const result = await commandExecutor.withdraw(data)
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
