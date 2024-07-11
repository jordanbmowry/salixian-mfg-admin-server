import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the 'categories' table
  await knex.schema.createTable('categories', (table) => {
    table
      .uuid('category_id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('category_name').notNullable();
    table.string('category_description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the 'categories' table
  return knex.schema.dropTable('categories');
}
