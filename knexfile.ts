import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development'
console.log(`Knex using environment: ${NODE_ENV}`)

// Try to load from environment-specific file first
config({ path: resolve(__dirname, `.env.${NODE_ENV}`) })

// Fallback to .env if needed
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.log(
    `No database variables found in .env.${NODE_ENV}, falling back to .env`
  )
  config({ path: resolve(__dirname, '.env') })
}

const { DATABASE_URL, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } =
  process.env

// Build connection from individual parts if available
const buildConnectionFromEnv = () => {
  if (DB_USER && DB_PASSWORD && DB_HOST && DB_PORT && DB_NAME) {
    return {
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    }
  }
  if (!DATABASE_URL) {
    throw new Error(
      'Database connection information is missing. Please check your environment variables.'
    )
  }
  return DATABASE_URL
}

export default {
  development: {
    client: 'pg',
    connection: buildConnectionFromEnv(),
    migrations: {
      directory: './db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './db/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: buildConnectionFromEnv(),
    migrations: {
      directory: './db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './db/seeds',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
}
