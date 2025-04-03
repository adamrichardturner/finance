import { data, LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'
import db from '~/lib/db.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const { id } = params

    if (!id) {
      throw data({ error: 'Pot ID is required' }, { status: 400 })
    }

    const result = await getFinancialData()
    const pot = result.pots.find((p) => {
      const potId = typeof p.id === 'number' ? p.id : Number(p.id)
      return potId === Number(id)
    })

    if (!pot) {
      throw data({ error: 'Pot not found' }, { status: 404 })
    }

    return data(pot)
  } catch (error) {
    console.error('Error fetching pot data:', error)
    throw data(
      {
        error: 'Failed to fetch pot data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  try {
    const { id } = params

    if (!id) {
      throw data({ error: 'Pot ID is required' }, { status: 400 })
    }

    if (request.method !== 'PUT') {
      throw data({ error: 'Method not allowed' }, { status: 405 })
    }

    const potData = await request.json()

    const updatedPot = await db('pots')
      .where({ id: Number(id) })
      .update(potData)
      .returning('*')

    if (!updatedPot || updatedPot.length === 0) {
      throw data({ error: 'Failed to update pot' }, { status: 500 })
    }

    return data(updatedPot[0])
  } catch (error) {
    console.error('Error updating pot:', error)
    throw data(
      {
        error: 'Failed to update pot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
