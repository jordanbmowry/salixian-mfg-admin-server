import { Router } from 'express';
import controller from './orders.controller';
import methodNotAllowed from '../../errors/methodNotAllowed';

// Define route constants
const ORDERS_BASE_ROUTE = '/';
const ORDER_ID_ROUTE = '/:orderId([a-fA-F0-9-]{36}|[0-9]+)';
const SOFT_DELETE_ROUTE = '/soft-delete/:orderId([a-fA-F0-9-]{36}|[0-9]+)';
const HARD_DELETE_ROUTE = '/hard-delete/:orderId([a-fA-F0-9-]{36}|[0-9]+)';
const ORDERS_WITH_CUSTOMERS = '/orders-with-customers';

const router = Router();

// Route for listing and creating orders
router
  .route(ORDERS_BASE_ROUTE)
  .get(controller.list) // List all orders
  .post(controller.create) // Create a new order
  .all(methodNotAllowed); // Handle unsupported methods

// Route for reading and updating a specific order by ID
router
  .route(ORDER_ID_ROUTE)
  .get(controller.read) // Read an order by ID
  .put(controller.update) // Update an order by ID
  .all(methodNotAllowed); // Handle unsupported methods

// Route for listing orders with customer information
router
  .route(ORDERS_WITH_CUSTOMERS)
  .get(controller.listOrdersWithCustomers) // List orders with customer details
  .all(methodNotAllowed); // Handle unsupported methods

// Route for soft deleting a specific order by ID
router
  .route(SOFT_DELETE_ROUTE)
  .delete(controller.softDelete) // Soft delete an order by ID
  .all(methodNotAllowed); // Handle unsupported methods

// Route for hard deleting a specific order by ID
router
  .route(HARD_DELETE_ROUTE)
  .delete(controller.hardDelete) // Hard delete an order by ID
  .all(methodNotAllowed); // Handle unsupported methods

export default router;
