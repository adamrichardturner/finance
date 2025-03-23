import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('email').notNullable().unique()
    table.string('password_hash').notNullable()
    table.string('full_name').notNullable()
    // For storing account recovery information
    table.string('recovery_token').nullable()
    table.dateTime('recovery_token_expires_at').nullable()
    // For multi-factor authentication
    table.boolean('mfa_enabled').defaultTo(false)
    table.string('mfa_secret').nullable()
    // Additional security measures
    table.specificType('previous_passwords', 'text[]').defaultTo('{}')
    table.integer('failed_login_attempts').defaultTo(0)
    table.dateTime('lockout_until').nullable()
    table.string('session_token').nullable()
    // For email verification
    table.boolean('email_verified').defaultTo(false)
    table.string('verification_token').nullable()
    // For security auditing
    table.string('last_ip_address').nullable()
    table.dateTime('last_login_at').nullable()
    table.timestamps(true, true)
  })

  // Separate table for refresh tokens with many-to-one relationship to users
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary()
    table.integer('user_id').notNullable()
    table.foreign('user_id').references('users.id').onDelete('CASCADE')
    table.string('token').notNullable().unique()
    table.dateTime('expires_at').notNullable()
    table.boolean('is_revoked').defaultTo(false)
    table.string('device_info').nullable()
    table.timestamps(true, true)
  })

  // Login history for security auditing
  await knex.schema.createTable('login_history', (table) => {
    table.increments('id').primary()
    table.integer('user_id').notNullable()
    table.foreign('user_id').references('users.id').onDelete('CASCADE')
    table.string('ip_address').notNullable()
    table.string('user_agent').nullable()
    table.string('location').nullable()
    table.boolean('success').notNullable()
    table.string('failure_reason').nullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('login_history')
  await knex.schema.dropTableIfExists('refresh_tokens')
  await knex.schema.dropTableIfExists('users')
}
