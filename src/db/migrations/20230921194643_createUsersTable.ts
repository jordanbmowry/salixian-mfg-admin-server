// createUsersTable.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'users' table
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').notNullable().unique();
    table.string('role').notNullable().defaultTo('user');
    table.string('first_name');
    table.string('last_name');
    table.string('password').notNullable();
    table.text('notes');
    table.timestamp('last_login');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Ensure that the uuid-ossp module is enabled for the UUID generation functions
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Add trigger to update 'updated_at' column when specific columns are updated
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_user_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.last_login = OLD.last_login THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create PostgreSQL trigger 'update_user_timestamp' if it doesn't exist
  await knex.raw(`
    CREATE TRIGGER update_user_timestamp
    BEFORE UPDATE
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger, the function, and the table
  await knex.raw('DROP TRIGGER IF EXISTS update_user_timestamp ON users;');
  await knex.raw('DROP FUNCTION IF EXISTS update_user_timestamp;');
  return knex.schema.dropTable('users');
}
