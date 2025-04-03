import { type Knex } from 'knex'
import knexPkg from 'knex'

const knex = knexPkg.default || knexPkg

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

let dbInstance: Knex

try {
  dbInstance = knex(connectionConfig)
} catch (error) {
  console.error('Failed to initialize database connection:', error)
  process.exit(1)
}

export default dbInstance
