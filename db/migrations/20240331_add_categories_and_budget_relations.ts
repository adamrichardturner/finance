import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Create categories table
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('default_theme').notNullable()
    table.string('user_id').notNullable().index()
    table.unique(['name', 'user_id'])
    table.timestamps(true, true)
  })

  // Add category_id to transactions table
  await knex.schema.alterTable('transactions', (table) => {
    // First create the category_id column
    table
      .integer('category_id')
      .unsigned()
      .references('id')
      .inTable('categories')
      .onDelete('SET NULL')
  })

  // Add category_id to budgets table
  await knex.schema.alterTable('budgets', (table) => {
    // Add category_id and make it required since a budget must have a category
    table
      .integer('category_id')
      .unsigned()
      .references('id')
      .inTable('categories')
      .onDelete('CASCADE')
    // Remove the unique constraint on category and user_id since we'll use category_id now
    table.dropUnique(['category', 'user_id'])
  })

  // Add budget_id to transactions table
  await knex.schema.alterTable('transactions', (table) => {
    table
      .integer('budget_id')
      .unsigned()
      .references('id')
      .inTable('budgets')
      .onDelete('SET NULL')
  })
}

export async function down(knex: Knex): Promise<void> {
  // Remove budget_id from transactions
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('budget_id')
  })

  // Remove category_id from transactions
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('category_id')
  })

  // Remove category_id from budgets and restore the unique constraint
  await knex.schema.alterTable('budgets', (table) => {
    table.dropColumn('category_id')
    table.unique(['category', 'user_id'])
  })

  // Drop categories table
  await knex.schema.dropTableIfExists('categories')
}
