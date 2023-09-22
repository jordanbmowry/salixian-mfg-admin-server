import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'users' table
  await knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary();
    table.string('user_name').notNullable().unique(); // Only 'user_name' is used
    table.string('role').notNullable().defaultTo('user');
    table.string('first_name');
    table.string('last_name');
    table.string('password').notNullable();
    table.timestamp('last_login');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Add trigger to update 'updated_at' column on each update
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create PostgreSQL function 'update_timestamp' if it doesn't exist
  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger and the table
  await knex.raw('DROP TRIGGER IF EXISTS update_timestamp ON users;');
  await knex.raw('DROP FUNCTION IF EXISTS update_timestamp;');
  return knex.schema.dropTable('users');
}
