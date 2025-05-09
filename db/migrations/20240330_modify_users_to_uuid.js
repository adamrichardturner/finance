/**
 * This migration was originally intended to modify user IDs to UUID format.
 * We've decided to keep integer IDs instead, so this is now a no-op migration.
 */

export async function up() {
  // No-op migration - we're keeping integer IDs
  console.log('Skipping UUID conversion - using integer IDs')
}

export async function down() {
  // No-op migration
}
