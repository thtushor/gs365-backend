# Admin Main Balance API Documentation

## Overview
The Admin Main Balance API provides comprehensive functionality for managing and tracking the main balance system. It supports various transaction types including admin deposits, player deposits, promotions, player withdrawals, and admin withdrawals.

## Base URL
```
/api/admin-main-balance
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Model

### AdminMainBalance
```typescript
interface AdminMainBalance {
  id: number;
  amount: string; // Decimal with precision 20,2
  type: "admin_deposit" | "player_deposit" | "promotion" | "player_withdraw" | "admin_withdraw";
  promotionId?: number;
  transactionId?: number;
  promotionName?: string;
  currencyId: number;
  createdByPlayer?: number;
  createdByAdmin?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Balance Calculation Formula
```
Current Main Balance = Total Admin Deposit - Total Player Deposit - Total Promotion + Total Player Withdraw + Total Admin Withdraw
```

## Endpoints

### 1. Create Admin Main Balance Record
**POST** `/api/admin-main-balance`

Creates a new admin main balance record.

#### Request Body
```json
{
  "amount": 1000.00,
  "type": "admin_deposit",
  "promotionId": 1,
  "transactionId": 123,
  "promotionName": "Welcome Bonus",
  "currencyId": 1,
  "createdByPlayer": 1,
  "createdByAdmin": 1,
  "notes": "Initial deposit"
}
```

#### Required Fields
- `amount` (number): Must be greater than 0
- `type` (string): One of the valid types
- `currencyId` (number): Currency reference

#### Response
```json
{
  "success": true,
  "message": "Admin main balance record created successfully",
  "data": {
    "id": 1
  }
}
```

### 2. Get All Admin Main Balance Records
**GET** `/api/admin-main-balance`

Retrieves all admin main balance records with filtering, pagination, and statistics.

#### Query Parameters
- `type` (string): Filter by transaction type
- `promotionId` (number): Filter by promotion ID
- `transactionId` (number): Filter by transaction ID
- `createdByPlayer` (number): Filter by player ID
- `createdByAdmin` (number): Filter by admin ID
- `currencyId` (number): Filter by currency ID
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)
- `search` (string): Search in promotion name and notes
- `page` (number): Page number (default: 1)
- `pageSize` (number): Records per page (default: 10)
- `sortBy` (string): Sort field (default: "createdAt")
- `sortOrder` (string): Sort order - "asc" or "desc" (default: "desc")

#### Example Request
```
GET /api/admin-main-balance?type=admin_deposit&page=1&pageSize=10&sortBy=amount&sortOrder=desc
```

#### Response
```json
{
  "success": true,
  "message": "Admin main balance records retrieved successfully",
  "data": [
    {
      "id": 1,
      "amount": "1000.00",
      "type": "admin_deposit",
      "promotionId": null,
      "transactionId": null,
      "promotionName": null,
      "currencyId": 1,
      "createdByPlayer": null,
      "createdByAdmin": 1,
      "notes": "Initial deposit",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "currency": {
        "id": 1,
        "name": "USD",
        "symbol": "$"
      },
      "createdByAdminUser": {
        "id": 1,
        "username": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalAdminDeposit": 11000.00,
    "totalPlayerDeposit": 1250.00,
    "totalPromotion": 250.00,
    "totalPlayerWithdraw": 500.00,
    "totalAdminWithdraw": 75.00,
    "currentMainBalance": 10425.00,
    "totalRecords": 25
  }
}
```

### 3. Get Admin Main Balance by ID
**GET** `/api/admin-main-balance/:id`

Retrieves a specific admin main balance record by ID.

#### Response
```json
{
  "success": true,
  "message": "Admin main balance record retrieved successfully",
  "data": {
    "id": 1,
    "amount": "1000.00",
    "type": "admin_deposit",
    "promotionId": null,
    "transactionId": null,
    "promotionName": null,
    "currencyId": 1,
    "createdByPlayer": null,
    "createdByAdmin": 1,
    "notes": "Initial deposit",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "currency": {
      "id": 1,
      "name": "USD",
      "symbol": "$"
    },
    "createdByAdminUser": {
      "id": 1,
      "username": "admin"
    }
  }
}
```

### 4. Update Admin Main Balance Record
**PUT** `/api/admin-main-balance/:id`

Updates an existing admin main balance record.

#### Request Body
```json
{
  "amount": 1500.00,
  "notes": "Updated deposit amount"
}
```

#### Response
```json
{
  "success": true,
  "message": "Admin main balance record updated successfully"
}
```

### 5. Delete Admin Main Balance Record
**DELETE** `/api/admin-main-balance/:id`

Deletes an admin main balance record.

#### Response
```json
{
  "success": true,
  "message": "Admin main balance record deleted successfully"
}
```

### 6. Get Statistics
**GET** `/api/admin-main-balance/stats`

Retrieves comprehensive statistics for admin main balance.

#### Query Parameters
- `currencyId` (number): Filter by currency ID
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)

#### Response
```json
{
  "success": true,
  "message": "Admin main balance stats retrieved successfully",
  "data": {
    "totalAdminDeposit": 11000.00,
    "totalPlayerDeposit": 1250.00,
    "totalPromotion": 250.00,
    "totalPlayerWithdraw": 500.00,
    "totalAdminWithdraw": 75.00,
    "currentMainBalance": 10425.00,
    "totalRecords": 25
  }
}
```

### 7. Get Current Main Balance
**GET** `/api/admin-main-balance/current-balance`

Retrieves the current main balance with calculation details.

#### Query Parameters
- `currencyId` (number): Filter by currency ID
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)

#### Response
```json
{
  "success": true,
  "message": "Current main balance calculated successfully",
  "data": {
    "currentMainBalance": 10425.00,
    "calculation": {
      "totalAdminDeposit": 11000.00,
      "totalPlayerDeposit": 1250.00,
      "totalPromotion": 250.00,
      "totalPlayerWithdraw": 500.00,
      "totalAdminWithdraw": 75.00,
      "formula": "current main balance = total admin deposit - total player deposit - total promotion + total player withdraw + total admin withdraw"
    }
  }
}
```

### 8. Get Balance by Type
**GET** `/api/admin-main-balance/balance/:type`

Retrieves the total balance for a specific transaction type.

#### Path Parameters
- `type` (string): Transaction type (admin_deposit, player_deposit, promotion, player_withdraw, admin_withdraw)

#### Query Parameters
- `currencyId` (number): Filter by currency ID
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)

#### Example Request
```
GET /api/admin-main-balance/balance/admin_deposit?currencyId=1
```

#### Response
```json
{
  "success": true,
  "message": "admin_deposit balance retrieved successfully",
  "data": {
    "type": "admin_deposit",
    "balance": 11000.00
  }
}
```

### 9. Get Recent Transactions
**GET** `/api/admin-main-balance/recent`

Retrieves the most recent admin main balance transactions.

#### Query Parameters
- `pageSize` (number): Number of records to retrieve (default: 10)

#### Response
```json
{
  "success": true,
  "message": "Recent transactions retrieved successfully",
  "data": [
    {
      "id": 10,
      "amount": "25.00",
      "type": "admin_withdraw",
      "promotionName": null,
      "notes": "Admin withdrawal for testing",
      "createdAt": "2024-01-10T12:00:00.000Z",
      "currency": {
        "id": 1,
        "name": "USD",
        "symbol": "$"
      },
      "createdByAdminUser": {
        "id": 1,
        "username": "admin"
      }
    }
  ],
  "count": 10
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "amount, type, and currencyId are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Admin main balance record not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create admin main balance record",
  "error": "Detailed error message"
}
```

## Transaction Types

1. **admin_deposit**: Admin deposits money into the system
2. **player_deposit**: Players deposit money into their accounts
3. **promotion**: Promotional bonuses given to players
4. **player_withdraw**: Players withdraw money from their accounts
5. **admin_withdraw**: Admin withdraws money from the system

## Usage Examples

### Creating Different Types of Records

#### Admin Deposit
```bash
curl -X POST /api/admin-main-balance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "admin_deposit",
    "currencyId": 1,
    "createdByAdmin": 1,
    "notes": "Monthly admin deposit"
  }'
```

#### Player Deposit
```bash
curl -X POST /api/admin-main-balance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "player_deposit",
    "currencyId": 1,
    "createdByPlayer": 1,
    "transactionId": 123,
    "notes": "Player deposit via credit card"
  }'
```

#### Promotion
```bash
curl -X POST /api/admin-main-balance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "type": "promotion",
    "promotionId": 1,
    "promotionName": "Welcome Bonus",
    "currencyId": 1,
    "createdByAdmin": 1,
    "notes": "Welcome bonus for new player"
  }'
```

### Getting Filtered Data

#### Get all admin deposits for a specific date range
```bash
curl -X GET "/api/admin-main-balance?type=admin_deposit&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

#### Get current balance for a specific currency
```bash
curl -X GET "/api/admin-main-balance/current-balance?currencyId=1" \
  -H "Authorization: Bearer <token>"
```

## Database Schema

The admin main balance system uses the following database table:

```sql
CREATE TABLE admin_main_balance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DECIMAL(20,2) NOT NULL,
  type ENUM('admin_deposit', 'player_deposit', 'promotion', 'player_withdraw', 'admin_withdraw') NOT NULL,
  promotion_id INT NULL,
  transaction_id INT NULL,
  promotion_name VARCHAR(300) NULL,
  currency_id INT NOT NULL,
  created_by_player INT NULL,
  created_by_admin INT NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_player) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_admin) REFERENCES admin_users(id) ON DELETE SET NULL
);
```

## Notes

- All monetary amounts are stored as DECIMAL(20,2) for precision
- The system supports multiple currencies
- All timestamps are in UTC
- The balance calculation follows the specified formula
- Pagination is available for all list endpoints
- Comprehensive filtering and search capabilities are provided
- All operations are logged with creation and update timestamps
