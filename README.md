# Salixian MFG Admin Server

This project is a server for managing users, customers, and orders for Salixian MFG. It provides API endpoints for performing CRUD operations on users, customers, and orders.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jordanbmowry/salixian-mfg-admin-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd salixian-mfg-admin-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set the required environment variables in a `.env` file. See the section below for details.

5. build the project:

   ```bash
   npm run build
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `JWT_SECRET_KEY`: The secret key used for signing and verifying JSON Web Tokens.
- `DEVELOPMENT_DATABASE_URL`: The connection string for the development database.
- `PRODUCTION_DATABASE_URL`: The connection string for the development database.
- The connection string for the development database.

## users

```http
  GET /users
```

```http
  GET /users/:userId
```

#### Read user

Must be authenticated to access route.

| Parameter | Type     | Description                         |
| :-------- | :------- | :---------------------------------- |
| `userId`  | `string` | **Required**. user_id to fetch user |

#### List all users

Must be be authenticated to access route.

```http
  POST /users/login
```

#### Login to server

Do not need to be authenticated to access route.

```http
  POST /users/logout
```

#### Logout of server

Do not need to be authenticated to access route.

```http
  POST /users/register
```

#### Create new user

Must be authenticated and have admin role to access route.

```http
  PUT /users/:userId
```

#### Update user

Must be authenticated and have admin role to access route.

| Parameter | Type     | Description                             |
| :-------- | :------- | :-------------------------------------- |
| `userId`  | `string` | **Required**. user_id of user to update |

```http
  DELETE /users/:userId
```

#### Delete user

Must be authenticated and have admin role to access route.
| Parameter | Type | Description |
| :-------- | :------- | :-------------------------------- |
| `userId` | `string` | **Required**. user_id of user to delete |

## customers

```http
  GET /customers
```

#### List all customers

Must be authenticated to access route.

```http
  GET /customers/:customerId
```

#### Read customer

Must be authenticated to access route.

| Parameter    | Type     | Description                                    |
| :----------- | :------- | :--------------------------------------------- |
| `customerId` | `string` | **Required**. customer_id of customer to fetch |

```http
  POST /customers
```

#### Create customer

Must be authenticated to access route.

```http
  DELETE /customers/soft-delete/:customerId
```

#### Soft delete customer

Must be authenticated to access route.
| Parameter | Type | Description |
| :-------- | :------- | :-------------------------------- |
| `customerId` | `string` | **Required**. customer_id of customer to soft delete |

```http
  DELETE /customers/hard-delete/:customerId
```

#### Delete customer

Must be authenticated and have admin role to access route.

| Parameter    | Type     | Description                                     |
| :----------- | :------- | :---------------------------------------------- |
| `customerId` | `string` | **Required**. customer_id of customer to delete |

```http
  PUT /customers/:customerId
```

#### Update customer

Must be authenticated to access route.

| Parameter    | Type     | Description                                     |
| :----------- | :------- | :---------------------------------------------- |
| `customerId` | `string` | **Required**. customer_id of customer to update |

```http
  GET /customers/:customerId/orders
```

#### Read customer and orders for customers

Must be authenticated and have admin role to access route.

| Parameter    | Type     | Description                                                        |
| :----------- | :------- | :----------------------------------------------------------------- |
| `customerId` | `string` | **Required**. customer_id of customer to fetch customer and orders |

## Orders

#### List all orders

Must be authenticated to access route.

```http
  GET /orders
```

```http
  GET /orders/:orderId
```

#### Read order

Must be authenticated to access route.

| Parameter | Type     | Description                              |
| :-------- | :------- | :--------------------------------------- |
| `orderId` | `string` | **Required**. order_id of order to fetch |

```http
  GET /orders/hard-delete/:orderId
```

#### Delete order

Must be authenticated to access route.

| Parameter | Type     | Description                               |
| :-------- | :------- | :---------------------------------------- |
| `orderId` | `string` | **Required**. order_id of order to delete |

```http
  GET /orders/soft-delete/:orderId
```

#### Soft delete order

Must be authenticated to access route.

| Parameter | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| `orderId` | `string` | **Required**. order_id of order to soft delete |

```http
  PUT /orders/:orderId
```

#### Update order

Must be authenticated to access route.

| Parameter | Type     | Description                               |
| :-------- | :------- | :---------------------------------------- |
| `orderId` | `string` | **Required**. order_id of order to delete |

```http
  PUT /orders/orders-with-customer
```

#### List orders with customer for order

Must be authenticated to access route.

```http
  POST /orders
```

#### Create order

Must be authenticated to access route.

## Authors

- Jordan Mowry[@jordanbmowry](https://github.com/jordanbmowry)

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://jordanbmowry.com/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jordan-mowry)
