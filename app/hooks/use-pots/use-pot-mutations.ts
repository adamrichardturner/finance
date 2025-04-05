import { useFetcher } from '@remix-run/react'
import { Pot } from '~/types/finance.types'

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

  const addMoney = {
    mutateAsync: async (data: AddMoneyParams) => {
      const formData = new FormData()
      formData.append('intent', 'add-money')
      formData.append('potId', data.potId)

      formData.append('amount', String(data.amount))

      const result = await fetcher.submit(formData, {
        method: 'post',
        action: '/pots',
      })

      return result as unknown as PotResponse
    },
    isPending: fetcher.state === 'submitting',
  }

  const withdraw = {
    mutateAsync: async (data: AddMoneyParams) => {
      const formData = new FormData()
      formData.append('intent', 'withdraw')
      formData.append('potId', data.potId)

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
