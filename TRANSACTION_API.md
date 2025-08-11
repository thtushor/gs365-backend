# Transaction API Documentation

## Overview

The Transaction API provides comprehensive functionality for managing deposit and withdraw transactions with status tracking, attachments, and custom transaction IDs.

## Features

- **Transaction Types**: Deposit and Withdraw
- **Status Management**: Approved, Pending, Rejected
- **Custom Transaction IDs**: Auto-generated unique identifiers
- **Attachment Support**: File attachments for transactions
- **Pagination & Filtering**: Advanced query capabilities
- **Statistics**: Transaction summaries and analytics
- **Admin Controls**: Administrative transaction management

## Database Schema

### Transactions Table

| Field                           | Type          | Description                              |
| ------------------------------- | ------------- | ---------------------------------------- |
| id                              | int           | Primary key, auto-increment              |
| userId                          | int           | Foreign key to users table               |
| type                            | enum          | 'deposit' or 'withdraw'                  |
| amount                          | decimal(10,2) | Transaction amount                       |
| currencyId                      | int           | Foreign key to currencies table          |
| status                          | enum          | 'approved', 'pending', 'rejected'        |
| customTransactionId             | varchar(100)  | Unique custom transaction ID             |
| givenTransactionId              | varchar(100)  | External transaction ID                  |
| attachment                      | text          | File attachment data                     |
| notes                           | text          | Transaction notes                        |
| paymentGatewayProviderAccountId | int           | Payment gateway account reference        |
| **Bank-specific fields**        |               |                                          |
| accountNumber                   | varchar(100)  | Bank account number                      |
| accountHolderName               | varchar(100)  | Account holder name                      |
| bankName                        | varchar(100)  | Bank name                                |
| branchName                      | varchar(100)  | Branch name                              |
| branchAddress                   | varchar(255)  | Branch address                           |
| swiftCode                       | varchar(50)   | SWIFT/BIC code                           |
| iban                            | varchar(100)  | IBAN number                              |
| **Wallet-specific fields**      |               |                                          |
| walletAddress                   | text          | Cryptocurrency wallet address            |
| network                         | varchar(50)   | Blockchain network                       |
| processedBy                     | int           | Admin user who processed the transaction |
| processedAt                     | datetime      | When transaction was processed           |
| createdAt                       | datetime      | Transaction creation timestamp           |
| updatedAt                       | datetime      | Last update timestamp                    |

## API Endpoints

### User Endpoints

#### 1. Create Transaction

**POST** `/api/transactions`

**Request Body:**

```json
{
  "type": "deposit",
  "amount": 100.5,
  "currencyId": 1,
  "paymentGatewayProviderAccountId": 1,
  "notes": "Payment for services",
  "attachment": "base64_encoded_file_data",
  "accountNumber": "1234567890",
  "accountHolderName": "John Doe",
  "bankName": "Example Bank",
  "branchName": "Main Branch",
  "branchAddress": "123 Main Street, City",
  "swiftCode": "EXBKUS33",
  "iban": "US64EXBK0000001234567890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": 123,
    "customTransactionId": "TXN1703123456789ABC123"
  }
}
```

#### 2. Get All Transactions

**GET** `/api/transactions`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by type ('deposit' or 'withdraw')
- `status` (optional): Filter by status ('approved', 'pending', 'rejected')
- `search` (optional): Search by custom transaction ID
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort order ('asc' or 'desc', default: 'desc')

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "userId": 1,
      "type": "deposit",
      "amount": "100.50",
      "currencyId": 1,
      "status": "pending",
      "customTransactionId": "TXN1703123456789ABC123",
      "givenTransactionId": "EXT123456",
      "attachment": "base64_data",
      "notes": "Payment for services",
      "paymentGatewayProviderAccountId": 1,
      "accountNumber": "1234567890",
      "accountHolderName": "John Doe",
      "bankName": "Example Bank",
      "branchName": "Main Branch",
      "branchAddress": "123 Main Street, City",
      "swiftCode": "EXBKUS33",
      "iban": "US64EXBK0000001234567890",
      "walletAddress": null,
      "network": null,
      "processedBy": null,
      "processedAt": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### 3. Get Transaction by ID

**GET** `/api/transactions/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 1,
    "type": "deposit",
    "amount": "100.50",
    "currencyId": 1,
    "status": "pending",
    "customTransactionId": "TXN1703123456789ABC123",
    "givenTransactionId": "EXT123456",
    "attachment": "base64_data",
    "notes": "Payment for services",
    "paymentGatewayProviderAccountId": 1,
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "bankName": "Example Bank",
    "branchName": "Main Branch",
    "branchAddress": "123 Main Street, City",
    "swiftCode": "EXBKUS33",
    "iban": "US64EXBK0000001234567890",
    "walletAddress": null,
    "network": null,
    "processedBy": null,
    "processedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Get Transaction by Custom ID

**GET** `/api/transactions/custom/:customTransactionId`

#### 5. Get Transaction by Given ID

**GET** `/api/transactions/given/:givenTransactionId`

#### 6. Update Transaction

**PUT** `/api/transactions/:id`

**Request Body:**

```json
{
  "notes": "Updated payment notes",
  "attachment": "new_base64_data"
}
```

#### 7. Delete Transaction

**DELETE** `/api/transactions/:id`

#### 8. Get Transaction Statistics

**GET** `/api/transactions/statistics/summary`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalDeposits": "1500.00",
    "totalWithdrawals": "800.00",
    "pendingDeposits": "200.00",
    "pendingWithdrawals": "100.00",
    "approvedDeposits": "1200.00",
    "approvedWithdrawals": "600.00",
    "rejectedDeposits": "100.00",
    "rejectedWithdrawals": "100.00",
    "totalTransactions": 25
  }
}
```

### Admin Endpoints

#### 1. Get All Transactions (Admin)

**GET** `/api/admin/transactions`

**Query Parameters:**

- Same as user endpoint, plus:
- `userId` (optional): Filter by specific user ID

#### 2. Get Transaction by ID (Admin)

**GET** `/api/admin/transactions/:id`

#### 3. Update Transaction Status (Admin)

**PATCH** `/api/admin/transactions/:id/status`

**Request Body:**

```json
{
  "status": "approved",
  "notes": "Payment verified and approved"
}
```

#### 4. Update Transaction (Admin)

**PUT** `/api/admin/transactions/:id`

#### 5. Delete Transaction (Admin)

**DELETE** `/api/admin/transactions/:id`

#### 6. Get Transaction Statistics (Admin)

**GET** `/api/admin/transactions/statistics/summary`

**Query Parameters:**

- `userId` (optional): Get statistics for specific user

#### 7. Bulk Update Transaction Statuses (Admin)

**PATCH** `/api/admin/transactions/bulk/status`

**Request Body:**

```json
{
  "transactionIds": [1, 2, 3, 4, 5],
  "status": "approved",
  "notes": "Bulk approval for verified payments"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Updated 5 transactions successfully",
  "data": {
    "successful": [
      { "id": 1, "success": true },
      { "id": 2, "success": true },
      { "id": 3, "success": true },
      { "id": 4, "success": true },
      { "id": 5, "success": true }
    ],
    "failed": []
  }
}
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Required fields missing",
  "errors": ["type", "amount", "currencyId"]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Transaction not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Transaction Status Flow

1. **Pending** (default): Transaction is created and awaiting processing
2. **Approved**: Transaction has been verified and approved by admin
3. **Rejected**: Transaction has been rejected by admin

## Custom Transaction ID Format

Custom transaction IDs follow the format: `TXN{timestamp}{random_string}`

Example: `TXN1703123456789ABC123`

## File Attachments

Attachments are stored as base64-encoded text in the database. For production use, consider implementing file storage service integration.

## Usage Examples

### Creating a Deposit Transaction

```javascript
const response = await fetch("/api/transactions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
  body: JSON.stringify({
    type: "deposit",
    amount: 100.5,
    currencyId: 1,
    paymentGatewayProviderAccountId: 1,
    notes: "Payment for services",
    attachment: "base64_encoded_file_data",
    accountNumber: "1234567890",
    accountHolderName: "John Doe",
    bankName: "Example Bank",
    branchName: "Main Branch",
    branchAddress: "123 Main Street, City",
    swiftCode: "EXBKUS33",
    iban: "US64EXBK0000001234567890",
  }),
});
```

### Getting User Transactions with Filters

```javascript
const response = await fetch(
  "/api/transactions?type=deposit&status=pending&page=1&limit=10",
  {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
);
```

### Admin Approving a Transaction

```javascript
const response = await fetch("/api/admin/transactions/123/status", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + adminToken,
  },
  body: JSON.stringify({
    status: "approved",
    notes: "Payment verified and approved",
  }),
});
```

## Database Migration

To create the transactions table, run the following SQL:

```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('deposit', 'withdraw') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency_id INT NOT NULL,
  status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',
  custom_transaction_id VARCHAR(100) UNIQUE,
  given_transaction_id VARCHAR(100),
  attachment TEXT,
  notes TEXT,
  payment_gateway_provider_account_id INT,
  -- Bank-specific fields
  account_number VARCHAR(100),
  account_holder_name VARCHAR(100),
  bank_name VARCHAR(100),
  branch_name VARCHAR(100),
  branch_address VARCHAR(255),
  swift_code VARCHAR(50),
  iban VARCHAR(100),
  -- Wallet-specific fields
  wallet_address TEXT,
  network VARCHAR(50),
  processed_by INT,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (currency_id) REFERENCES currencies(id),
  FOREIGN KEY (payment_gateway_provider_account_id) REFERENCES gateway_accounts(id)
);
```

## Notes

- All monetary amounts are stored as decimal(10,2) for precision
- Custom transaction IDs are auto-generated and unique
- File attachments are stored as base64 text (consider file storage for production)
- Admin endpoints provide full CRUD operations
- User endpoints are restricted to their own transactions
- Statistics provide comprehensive transaction analytics
