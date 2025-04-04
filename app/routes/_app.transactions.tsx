import { MetaFunction } from '@remix-run/node'
import PageTitle from '~/components/PageTitle'
import { Transactions } from '~/components/Transactions'

export const meta: MetaFunction = () => {
  return [
    { title: 'Transactions | Finance App' },
    { name: 'description', content: 'View your transaction history' },
  ]
}

export default function TransactionsPage() {
  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <style>
        {`
          
          #scrollable-transactions::-webkit-scrollbar {
            display: none;
            width: 0;
          }
          
          #scrollable-transactions {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}
      </style>
      <PageTitle title='Transactions' />
      <Transactions />
    </div>
  )
}
