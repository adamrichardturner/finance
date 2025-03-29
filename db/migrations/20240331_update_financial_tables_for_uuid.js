/**
 * This migration was originally intended to update financial tables to use UUID foreign keys.
 * We've decided to keep integer IDs instead, so this is now a no-op migration.
 */

export async function up(knex) {
  // No-op migration - we're keeping integer IDs
  console.log(
    'Skipping UUID conversion for financial tables - using integer IDs'
  )
}

export async function down(knex) {
  // No-op migration
}
