import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('product_categories').del();

  // Fetch the UUIDs of the inserted products and categories
  const products = await knex('products').select('product_id');
  const categories = await knex('categories').select('category_id');

  // Assuming products[0] corresponds to the first category and so on
  const firstProductId = products[0].product_id;
  const secondProductId = products[1].product_id;
  const firstCategoryId = categories[0].category_id;
  const secondCategoryId = categories[1].category_id;

  // Inserts seed entries
  await knex('product_categories').insert([
    {
      product_id: firstProductId,
      category_id: firstCategoryId,
    },
    {
      product_id: secondProductId,
      category_id: secondCategoryId,
    },
  ]);
}
