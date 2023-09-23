import knex from '../../db/connection';

export interface Customer {
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

export async function create(customer: Customer) {
  try {
    return await knex('customers')
      .insert(customer)
      .returning('*')
      .then((createdRecords) => createdRecords[0]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
    throw new Error('Failed to create customer.');
  }
}

export async function read(customer_id: string) {
  try {
    return knex('customers').select('*').where({ customer_id }).first();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read customer: ${error.message}`);
    }
    throw new Error('Failed to read customer.');
  }
}

export async function softDelete(customer_id: string): Promise<void> {
  try {
    await knex('customers').where({ customer_id }).update({
      deleted_at: knex.fn.now(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to soft delete customer: ${error.message}`);
    }
    throw new Error('Failed to soft delete customer.');
  }
}

export async function update(updatedCustomer: Partial<Customer>) {
  try {
    return await knex('customers')
      .select('*')
      .where({ customer_id: updatedCustomer.customer_id })
      .update(updatedCustomer, '*');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
    throw new Error('Failed to update customer.');
  }
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

export async function destroy(customer_id: string) {
  try {
    await knex('customers').where({ customer_id }).del();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to delete customer ${customer_id}: ${error.message}`
      );
    }
    throw new Error(`Failed to delete customer ${customer_id}.`);
  }
}
