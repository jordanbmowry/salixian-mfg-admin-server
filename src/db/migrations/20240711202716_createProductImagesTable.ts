import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'product_images' table
  await knex.schema.createTable('product_images', (table) => {
    table.uuid('image_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('product_id')
      .notNullable()
      .references('product_id')
      .inTable('products')
      .onDelete('CASCADE');
    table.string('image_url').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_product_image_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_product_image_timestamp
    BEFORE UPDATE
    ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_product_image_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the trigger, the function, and the 'product_images' table
  await knex.raw(
    'DROP TRIGGER IF EXISTS update_product_image_timestamp ON product_images;'
  );
  await knex.raw('DROP FUNCTION IF EXISTS update_product_image_timestamp;');
  return knex.schema.dropTable('product_images');
}
