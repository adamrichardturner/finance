import { useFetcher } from '@remix-run/react'
import { Pot } from '~/types/finance.types'
import { useQueryClient, useMutation } from '@tanstack/react-query'

interface CreatePotParams {
  name: string
  target: number
  theme: string
}

interface UpdatePotParams {
  potId: string
  name: string
  target: number
  theme: string
  icon?: string
  color?: string
}

interface DeletePotParams {
  potId: string
}

interface AddMoneyParams {
  potId: string
  amount: number
}

// Define response types
interface PotResponse {
  pot: Pot
  error?: string
}

interface DeleteResponse {
  success: boolean
  error?: string
}

export const usePotMutations = () => {
  const fetcher = useFetcher()

  // Create a new pot
  const createPot = {
    mutateAsync: async (data: CreatePotParams) => {
      const formData = new FormData()
      formData.append('intent', 'create')
      formData.append('name', data.name)
      formData.append('target', data.target.toString())
      formData.append('theme', data.theme)

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/pots',
      })

      return result as unknown as PotResponse
    },
    isPending: fetcher.state === 'submitting',
  }

  // Update an existing pot
  const updatePot = {
    mutateAsync: async (data: UpdatePotParams) => {
      const formData = new FormData()
      formData.append('intent', 'update')
      formData.append('potId', data.potId)
      formData.append('name', data.name)
      formData.append('target', data.target.toString())
      formData.append('theme', data.theme)

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/pots',
      })

      return result as unknown as PotResponse
    },
    isPending: fetcher.state === 'submitting',
  }

  // Delete a pot
  const deletePot = {
    mutateAsync: async (data: DeletePotParams) => {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('potId', data.potId)

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/pots',
      })

      return result as unknown as DeleteResponse
    },
    isPending: fetcher.state === 'submitting',
  }

  // Add money to a pot
  const addMoney = {
    mutateAsync: async (data: AddMoneyParams) => {
      const formData = new FormData()
      formData.append('intent', 'add-money')
      formData.append('potId', data.potId)

      // Send the amount directly as a string
      formData.append('amount', String(data.amount))

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/pots',
      })

      return result as unknown as PotResponse
    },
    isPending: fetcher.state === 'submitting',
  }

  // Withdraw money from a pot
  const withdraw = {
    mutateAsync: async (data: AddMoneyParams) => {
      const formData = new FormData()
      formData.append('intent', 'withdraw')
      formData.append('potId', data.potId)

      // Send the amount directly as a string
      formData.append('amount', String(data.amount))

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/pots',
      })

      return result as unknown as PotResponse
    },
    isPending: fetcher.state === 'submitting',
  }

  return {
    createPot,
    updatePot,
    deletePot,
    addMoney,
    withdraw,
  }
}
