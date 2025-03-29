import { type Knex } from 'knex'
import knexPkg from 'knex'

// Handle both ESM and CJS module formats
const knex = knexPkg.default || knexPkg

// Define the direct connection config
const connectionConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },

  migrations: {
    directory: './db/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './db/seeds',
    extension: 'ts',
  },
}

// Initialize database connection immediately
let dbInstance: Knex

try {
  dbInstance = knex(connectionConfig)
  console.log('Database connection initialized')
} catch (error) {
  console.error('Failed to initialize database:', error)
  throw new Error('Database connection could not be established')
}

export default dbInstance
