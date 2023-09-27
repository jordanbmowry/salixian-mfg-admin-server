# Salixian MFG Admin Server

## users

```http
  GET /users
```

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

## Authors

- Jordan Mowry[@jordanbmowry](https://github.com/jordanbmowry)

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://jordanbmowry.com/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jordan-mowry)
