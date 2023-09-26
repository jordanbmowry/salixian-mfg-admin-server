export interface CustomError extends Error {
  status?: number;
  message: string;
}

export interface User {
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  password: string;
  user_id: string;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: string;
  order_date: string;
  order_description: string;
  customer_cost: number;
  input_expenses?: number | null;
  taxes_fees?: number | null;
  shipping_cost?: number | null;
  total_write_off?: number | null;
  profit?: number | null;
  notes?: string;
  order_status: 'pending' | 'in progress' | 'complete' | 'canceled';
  payment_status: 'not paid' | 'partially paid' | 'fully paid';
  customer_id: string;
  created_at: string;
  updated_at: string;
}

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

export interface OrderWithCustomer {
  order_id: string;
  order_date: string;
  order_status: string;
  payment_status: string;
  order_created_at: string;
  first_name: string;
  last_name: string;
  customer_id: string;
  email: string;
  phone_number: string;
  customer_created_at: string;
  customer_updated_at: string;
}

export interface CustomerListOptions {
  page?: number;
  pageSize?: number;
  startDate?: Date | string | undefined;
  endDate?: Date | string | undefined;
  email?: string;
  phoneNumber?: string;
  sortBy?: string;
  order?: 'desc' | 'asc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  orderBy?: string;
  order?: 'desc' | 'asc';
}

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
