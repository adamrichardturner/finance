import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Create balance table
  await knex.schema.createTable('balance', (table) => {
    table.increments('id').primary()
    table.decimal('current', 10, 2).notNullable()
    table.decimal('income', 10, 2).notNullable()
    table.decimal('expenses', 10, 2).notNullable()
    table.string('user_id').notNullable().index()
    table.timestamps(true, true)
  })

  // Create transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary()
    table.string('avatar').notNullable()
    table.string('name').notNullable()
    table.string('category').notNullable()
    table.timestamp('date').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.boolean('recurring').defaultTo(false)
    table.string('user_id').notNullable().index()
    table.timestamps(true, true)
  })

  // Create budgets table
  await knex.schema.createTable('budgets', (table) => {
    table.increments('id').primary()
    table.string('category').notNullable()
    table.decimal('maximum', 10, 2).notNullable()
    table.string('theme').notNullable()
    table.string('user_id').notNullable().index()
    table.unique(['category', 'user_id'])
    table.timestamps(true, true)
  })

  // Create pots table
  await knex.schema.createTable('pots', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.decimal('target', 10, 2).notNullable()
    table.decimal('total', 10, 2).notNullable()
    table.string('theme').notNullable()
    table.string('user_id').notNullable().index()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pots')
  await knex.schema.dropTableIfExists('budgets')
  await knex.schema.dropTableIfExists('transactions')
  await knex.schema.dropTableIfExists('balance')
}
