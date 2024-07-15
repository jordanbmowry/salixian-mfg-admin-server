import { Router } from 'express';
import controller from './customers.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

// Define base routes and route parameters
const CUSTOMERS_BASE_ROUTE = '/';
const CUSTOMER_ID_ROUTE = '/:customerId([a-fA-F0-9-]{36}|[0-9]+)';
const SOFT_DELETE_ROUTE = '/soft-delete/:customerId([a-fA-F0-9-]{36}|[0-9]+)';
const HARD_DELETE_ROUTE = '/hard-delete/:customerId([a-fA-F0-9-]{36}|[0-9]+)';
const ORDERS_FOR_CUSTOMER_ROUTE =
  '/:customerId([a-fA-F0-9-]{36}|[0-9]+)/orders';

// Create a new router instance
const router = Router();

// Define routes for customers base URL
router
  .route(CUSTOMERS_BASE_ROUTE)
  .get(controller.list) // GET request to list all customers
  .post(controller.create) // POST request to create a new customer
  .all(methodNotAllowed); // Handle unsupported HTTP methods

// Define routes for operations on a specific customer by ID
router
  .route(CUSTOMER_ID_ROUTE)
  .get(controller.read) // GET request to read a specific customer by ID
  .put(controller.update) // PUT request to update a specific customer by ID
  .all(methodNotAllowed); // Handle unsupported HTTP methods

// Define routes for soft deleting a customer by ID
router
  .route(SOFT_DELETE_ROUTE)
  .delete(controller.softDelete) // DELETE request to soft delete a customer by ID
  .all(methodNotAllowed); // Handle unsupported HTTP methods

// Define routes for hard deleting a customer by ID
router
  .route(HARD_DELETE_ROUTE)
  .delete(controller.hardDelete) // DELETE request to hard delete a customer by ID
  .all(methodNotAllowed); // Handle unsupported HTTP methods

// Define routes for listing orders for a specific customer by ID
router
  .route(ORDERS_FOR_CUSTOMER_ROUTE)
  .get(controller.listCustomerWithOrders) // GET request to list orders for a customer by ID
  .all(methodNotAllowed); // Handle unsupported HTTP methods

// Export the configured router
export default router;
