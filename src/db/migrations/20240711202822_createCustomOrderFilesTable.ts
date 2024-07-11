import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'custom_order_files' table
  await knex.schema.createTable('custom_order_files', (table) => {
    table.uuid('file_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('order_id')
      .notNullable()
      .references('order_id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('file_url').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_custom_order_file_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_custom_order_file_timestamp
    BEFORE UPDATE
    ON custom_order_files
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_order_file_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger, the function, and the 'custom_order_files' table
  await knex.raw(
    'DROP TRIGGER IF EXISTS update_custom_order_file_timestamp ON custom_order_files;'
  );
  await knex.raw('DROP FUNCTION IF EXISTS update_custom_order_file_timestamp;');
  return knex.schema.dropTable('custom_order_files');
}
