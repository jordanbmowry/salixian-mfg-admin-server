import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'product_categories' table
  await knex.schema.createTable('product_categories', (table) => {
    table
      .uuid('product_id')
      .notNullable()
      .references('product_id')
      .inTable('products')
      .onDelete('CASCADE');
    table
      .uuid('category_id')
      .notNullable()
      .references('category_id')
      .inTable('categories')
      .onDelete('CASCADE');
    table.primary(['product_id', 'category_id']); // Composite primary key
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the 'product_categories' table
  return knex.schema.dropTable('product_categories');
}
