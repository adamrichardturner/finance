import knex from 'knex'
import config from '../../knexfile'

const environment = process.env.NODE_ENV || 'development'
const knexConfig = config[environment as keyof typeof config]

let db: ReturnType<typeof knex> | null = null

try {
  db = knex(knexConfig)
  console.log('Database connection initialized')
} catch (error) {
  console.error('Failed to connect to database:', error)
  console.log('Application will run in demo mode only')
}

// Create a proxy to intercept database calls
const dbProxy = new Proxy({} as ReturnType<typeof knex>, {
  get: (target, prop) => {
    if (!db) {
      console.warn(
        `Database unavailable, using demo mode. Attempted to access ${String(prop)}`
      )

      // Return a dummy function for method calls
      return () => ({
        where: () => ({
          first: () => Promise.resolve(null),
          update: () => Promise.resolve([]),
          // Add other common method chains
          select: () => ({
            where: () => ({
              first: () => Promise.resolve(null),
            }),
          }),
          insert: () => Promise.resolve([null]),
          returning: () => Promise.resolve([null]),
        }),
      })
    }

    // Use the actual database connection if available
    return (db as any)[prop]
  },
})

export default dbProxy as ReturnType<typeof knex>
