import knex from 'knex'
import config from '../../knexfile'

const environment = process.env.NODE_ENV || 'development'
const knexConfig = config[environment as keyof typeof config]

const db = knex(knexConfig)

export default db
