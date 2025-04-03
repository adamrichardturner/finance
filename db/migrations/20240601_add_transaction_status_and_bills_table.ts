import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Add isPaid and isOverdue columns to transactions table
  await knex.schema.alterTable('transactions', (table) => {
    table.boolean('isPaid').defaultTo(false)
    table.boolean('isOverdue').defaultTo(false)
    table.integer('dueDay')
  })

  // Create bills table
  await knex.schema.createTable('bills', (table) => {
    table.increments('id').primary()
    table.string('avatar').notNullable()
    table.string('name').notNullable()
    table.string('category').notNullable()
    table.timestamp('date').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.integer('dueDay').notNullable()
    table.boolean('isPaid').defaultTo(false)
    table.boolean('isOverdue').defaultTo(false)
    table.string('user_id').notNullable().index()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  // Drop the bills table
  await knex.schema.dropTableIfExists('bills')

  // Remove isPaid, isOverdue, and dueDay columns from transactions
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('isPaid')
    table.dropColumn('isOverdue')
    table.dropColumn('dueDay')
  })
}
