import knex from '../../db/connection';

interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export async function list(): Promise<Customer[]> {
  try {
    return await knex('customers').select('*');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list customers: ${error.message}`);
    }
    throw new Error('Failed to list customers.');
  }
}
