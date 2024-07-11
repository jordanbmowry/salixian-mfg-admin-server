import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'products' table
  await knex.schema.createTable('products', (table) => {
    table
      .uuid('product_id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 14, 2).notNullable();
    table.integer('stock_quantity').notNullable().defaultTo(0);
    table.string('category').notNullable();
    table.string('firearm_type').notNullable();
    table.boolean('is_custom').notNullable().defaultTo(false);
    table.boolean('display').notNullable().defaultTo(true); // New column for display
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_product_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_product_timestamp
    BEFORE UPDATE
    ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger, the function, and the 'products' table
  await knex.raw(
    'DROP TRIGGER IF EXISTS update_product_timestamp ON products;'
  );
  await knex.raw('DROP FUNCTION IF EXISTS update_product_timestamp;');
  return knex.schema.dropTable('products');
}
