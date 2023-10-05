import Joi from 'joi';

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().allow(null, ''),
  first_name: Joi.string().allow(null, ''),
  last_name: Joi.string().allow(null, ''),
  password: Joi.string().required(),
  user_id: Joi.string().allow(null, ''),
}).unknown(false);

export const userUpdateSchema = userSchema
  .keys({
    email: Joi.string().email().optional(),
    role: Joi.string().allow(null, '').optional(),
    first_name: Joi.string().allow(null, '').optional(),
    last_name: Joi.string().allow(null, '').optional(),
    password: Joi.string().optional(),
    user_id: Joi.string().allow(null, '').optional(),
  })
  .unknown(false);

export const customerSchema = Joi.object({
  customer_id: Joi.string(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string()
    .pattern(/^\d{3}-\d{3}-\d{4}$/) // Corrected this line
    .required(),
  shipping_address: Joi.string().allow(null, ''),
  shipping_city: Joi.string().allow(null, ''),
  shipping_state: Joi.string().allow(null, ''),
  shipping_zip: Joi.string().allow(null, ''),
  billing_address: Joi.string().allow(null, ''),
  billing_city: Joi.string().allow(null, ''),
  billing_state: Joi.string().allow(null, ''),
  billing_zip: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  created_at: Joi.date(),
  updated_at: Joi.date(),
  deleted_at: Joi.date().allow(null),
}).unknown(false);

export const orderSchema = Joi.object({
  order_date: Joi.date().required(),
  order_description: Joi.string().allow(null, ''),
  customer_cost: Joi.number().required(),
  input_expenses: Joi.number(),
  taxes_fees: Joi.number(),
  shipping_cost: Joi.number(),
  total_write_off: Joi.number(),
  profit: Joi.number(),
  notes: Joi.string().allow(null, ''),
  order_status: Joi.string()
    .valid('pending', 'in progress', 'complete', 'canceled')
    .required(),
  payment_status: Joi.string()
    .valid('not paid', 'partially paid', 'fully paid')
    .required(),
  customer_id: Joi.string().allow(null, '').required(),
}).unknown(false);
