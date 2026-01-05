# Withdrawal Payment Account API Documentation

## Overview
The Withdrawal Payment Account API provides comprehensive CRUD operations for managing user withdrawal payment accounts. This API supports multiple account types including bank accounts, cryptocurrency wallets, and e-wallets with full user relationship management, payment gateway integration, and verification workflows.

## Features
- **Payment Gateway Integration**: Direct integration with payment gateway system
- **Multiple Account Types**: Support for bank, cryptocurrency, and e-wallet accounts
- **User Management**: Full CRUD operations with user ID foreign key relationships
- **Verification System**: Account verification status management (pending, verified, rejected)
- **Primary Account Management**: Automatic handling of primary account selection
- **Comprehensive Filtering**: Advanced search and filtering capabilities
- **Statistics & Analytics**: Account statistics and distribution analytics

## Account Types Supported

### 1. Bank Accounts
- **Required Fields**: `bankName`, `holderName`
- **Optional Fields**: `branchName`, `branchAddress`, `swiftCode`, `iban`, `routingNumber`
- **Use Case**: Traditional banking withdrawals

### 2. Cryptocurrency Accounts
- **Required Fields**: `walletAddress`, `holderName`
- **Optional Fields**: `network` (BTC, ETH, etc.)
- **Use Case**: Digital currency withdrawals

### 3. E-Wallet Accounts
- **Required Fields**: `provider`, `holderName`
- **Use Case**: Digital wallet service withdrawals

## Endpoints

### Base URL
```
/api/withdrawal-payment-accounts
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## CRUD Operations

### 1. Create Withdrawal Payment Account
**POST** `/api/withdrawal-payment-accounts`

Creates a new withdrawal payment account for a user.

**Request Body:**
```json
{
  "userId": 123,
  "paymentGatewayId": 456,
  "holderName": "John Doe",
  "provider": "bank",
  "accountNumber": "1234567890",
  "bankName": "Chase Bank",
  "branchName": "Main Branch",
  "branchAddress": "123 Main St, New York, NY",
  "swiftCode": "CHASUS33",
  "iban": "US12345678901234567890",
  "routingNumber": "021000021",
  "accountHolderPhone": "+1234567890",
  "accountHolderEmail": "john@example.com",
  "country": "United States",
  "state": "New York",
  "city": "New York",
  "address": "123 Main St",
  "postalCode": "10001",
  "isPrimary": false,
  "isVerified": false,
  "isActive": true,
  "verificationStatus": "pending",
  "minWithdrawalAmount": "10.00",
  "maxWithdrawalAmount": "10000.00",
  "withdrawalFee": "2.50",
  "processingTime": "1-3 business days",
  "additionalInfo": "{\"branch\": \"Main Branch\"}"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Withdrawal payment account created successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "paymentGatewayId": 456,
    "holderName": "John Doe",
    "provider": "bank",
    "isPrimary": false,
    "isVerified": false,
    "isActive": true,
    "verificationStatus": "pending",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get All Withdrawal Payment Accounts
**GET** `/api/withdrawal-payment-accounts`

Retrieves withdrawal payment accounts with filtering, sorting, and pagination.

**Query Parameters:**
- `userId` (number): Filter by specific user ID
- `paymentGatewayId` (number): Filter by payment gateway ID
- `provider` (string[]): Filter by providers (bank, crypto, e-wallet)
- `isActive` (boolean): Filter by active status
- `verificationStatus` (string[]): Filter by verification status
- `country` (string): Filter by country
- `isPrimary` (boolean): Filter by primary status
- `limit` (number): Results per page (1-100, default: 50)
- `offset` (number): Number of results to skip (default: 0)
- `sortBy` (string): Sort field (createdAt, updatedAt, holderName, provider)
- `sortOrder` (string): Sort order (asc, desc, default: desc)

**Example Request:**
```
GET /api/withdrawal-payment-accounts?limit=10&sortBy=createdAt&sortOrder=desc&provider=bank&isActive=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Withdrawal payment accounts retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "paymentGatewayId": 456,
      "holderName": "John Doe",
      "provider": "bank",
      "bankName": "Chase Bank",
      "isPrimary": true,
      "isVerified": true,
      "isActive": true,
      "verificationStatus": "verified",
      "user": {
        "id": 123,
        "username": "johndoe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "paymentGateway": {
        "id": 456,
        "name": "Chase Bank Gateway",
        "methodId": 1,
        "status": "active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  },
  "total": 25
}
```

### 3. Get Withdrawal Payment Account by ID
**GET** `/api/withdrawal-payment-accounts/:id`

Retrieves a specific withdrawal payment account by its ID.

**Path Parameters:**
- `id` (number): Account ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Withdrawal payment account retrieved successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "paymentGatewayId": 456,
    "holderName": "John Doe",
    "provider": "bank",
    "accountNumber": "1234567890",
    "bankName": "Chase Bank",
    "branchName": "Main Branch",
    "branchAddress": "123 Main St, New York, NY",
    "swiftCode": "CHASUS33",
    "iban": "US12345678901234567890",
    "routingNumber": "021000021",
    "accountHolderPhone": "+1234567890",
    "accountHolderEmail": "john@example.com",
    "country": "United States",
    "state": "New York",
    "city": "New York",
    "address": "123 Main St",
    "postalCode": "10001",
    "isPrimary": true,
    "isVerified": true,
    "isActive": true,
    "verificationStatus": "verified",
    "verificationNotes": "Documents verified successfully",
    "minWithdrawalAmount": "10.00",
    "maxWithdrawalAmount": "10000.00",
    "withdrawalFee": "2.50",
    "processingTime": "1-3 business days",
    "additionalInfo": "{\"branch\": \"Main Branch\"}",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": 123,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "paymentGateway": {
      "id": 456,
      "name": "Chase Bank Gateway",
      "methodId": 1,
      "status": "active"
    }
  }
}
```

### 4. Update Withdrawal Payment Account
**PUT** `/api/withdrawal-payment-accounts/:id`

Updates an existing withdrawal payment account.

**Path Parameters:**
- `id` (number): Account ID

**Request Body:**
```json
{
  "holderName": "Updated Account Name",
  "isPrimary": true,
  "verificationStatus": "verified",
  "verificationNotes": "Updated verification notes"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Withdrawal payment account updated successfully",
  "data": {
    "id": 1,
    "holderName": "Updated Account Name",
    "isPrimary": true,
    "verificationStatus": "verified",
    "verificationNotes": "Updated verification notes",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### 5. Delete Withdrawal Payment Account
**DELETE** `/api/withdrawal-payment-accounts/:id`

Permanently deletes a withdrawal payment account.

**Path Parameters:**
- `id` (number): Account ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Withdrawal payment account deleted successfully"
}
```

## User-Specific Operations

### 6. Get Accounts by User ID
**GET** `/api/withdrawal-payment-accounts/user/:userId`

Retrieves all withdrawal payment accounts for a specific user.

**Path Parameters:**
- `userId` (number): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User withdrawal payment accounts retrieved successfully",
  "data": [
    {
      "id": 1,
      "holderName": "My Bank Account",
      "provider": "bank",
      "isPrimary": true,
      "isActive": true,
      "verificationStatus": "verified"
    },
    {
      "id": 2,
      "holderName": "My Crypto Wallet",
      "provider": "crypto",
      "isPrimary": false,
      "isActive": true,
      "verificationStatus": "pending"
    }
  ],
  "total": 2
}
```

### 7. Get Primary Account for User
**GET** `/api/withdrawal-payment-accounts/user/:userId/primary`

Retrieves the primary withdrawal payment account for a specific user.

**Path Parameters:**
- `userId` (number): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Primary withdrawal payment account retrieved successfully",
  "data": {
    "id": 1,
    "holderName": "My Bank Account",
    "provider": "bank",
    "isPrimary": true,
    "isActive": true,
    "verificationStatus": "verified"
  }
}
```

## Business Logic Operations

### 8. Deactivate Account
**PATCH** `/api/withdrawal-payment-accounts/:id/deactivate`

Soft deletes (deactivates) a withdrawal payment account.

**Path Parameters:**
- `id` (number): Account ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Withdrawal payment account deactivated successfully"
}
```

### 9. Set Account as Primary
**PATCH** `/api/withdrawal-payment-accounts/:id/set-primary`

Sets a withdrawal payment account as the primary for a user.

**Path Parameters:**
- `id` (number): Account ID

**Request Body:**
```json
{
  "userId": 123
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Withdrawal payment account set as primary successfully"
}
```

### 10. Update Verification Status
**PATCH** `/api/withdrawal-payment-accounts/:id/verification-status`

Updates the verification status of a withdrawal payment account.

**Path Parameters:**
- `id` (number): Account ID

**Request Body:**
```json
{
  "status": "verified",
  "notes": "Documents verified successfully"
}
```

**Valid Status Values:**
- `pending`: Account pending verification
- `verified`: Account verified successfully
- `rejected`: Account verification rejected

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification status updated successfully"
}
```

## Analytics & Statistics

### 11. Get Account Statistics
**GET** `/api/withdrawal-payment-accounts/stats`

Retrieves comprehensive statistics about withdrawal payment accounts.

**Query Parameters:**
- `userId` (number, optional): Filter statistics by specific user

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account statistics retrieved successfully",
  "data": {
    "totalAccounts": 150,
    "activeAccounts": 142,
    "verifiedAccounts": 120,
    "pendingVerification": 28,
    "providers": [
      {
        "provider": "bank",
        "count": 85
      },
      {
        "provider": "crypto",
        "count": 45
      },
      {
        "provider": "e-wallet",
        "count": 20
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: userId, holderName"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Withdrawal payment account not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create withdrawal payment account",
  "error": "Database connection error"
}
```

## Usage Examples

### JavaScript/Fetch API

```javascript
const createBankAccount = async (accountData) => {
  try {
    const response = await fetch('/api/withdrawal-payment-accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Account created:', data.data);
    } else {
      console.error('Failed to create account:', data.message);
    }
  } catch (error) {
    console.error('Error creating account:', error);
  }
};

// Example usage
createBankAccount({
  userId: 123,
  paymentGatewayId: 456,
  holderName: "John Doe",
  provider: "bank",
  bankName: "Chase Bank"
});
```

### cURL

```bash
# Create a bank account
curl -X POST \
  "http://localhost:3000/api/withdrawal-payment-accounts" \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": 123,
    "paymentGatewayId": 456,
    "holderName": "John Doe",
    "provider": "bank",
    "bankName": "Chase Bank"
  }'

# Get all accounts for a user
curl -X GET \
  "http://localhost:3000/api/withdrawal-payment-accounts/user/123" \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Set account as primary
curl -X PATCH \
  "http://localhost:3000/api/withdrawal-payment-accounts/1/set-primary" \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"userId": 123}'
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get all accounts with filters
const getAccounts = async (filters = {}) => {
  try {
    const response = await api.get('/api/withdrawal-payment-accounts', {
      params: filters
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

// Example usage
const accounts = await getAccounts({
  limit: 10,
  provider: 'bank',
  isActive: true
});
```

## Database Schema

The API uses the following database table structure:

```sql
CREATE TABLE withdrawal_payment_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_gateway_id INT,
  account_number VARCHAR(100),
  holder_name VARCHAR(100),
  provider VARCHAR(100),
  bank_name VARCHAR(100),
  branch_name VARCHAR(100),
  branch_address VARCHAR(255),
  swift_code VARCHAR(50),
  iban VARCHAR(100),
  routing_number VARCHAR(50),
  wallet_address TEXT,
  network VARCHAR(50),
  account_holder_phone VARCHAR(50),
  account_holder_email VARCHAR(255),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  postal_code VARCHAR(20),
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_status VARCHAR(50) DEFAULT 'pending',
  verification_notes TEXT,
  min_withdrawal_amount VARCHAR(50),
  max_withdrawal_amount VARCHAR(50),
  withdrawal_fee VARCHAR(50),
  processing_time VARCHAR(100),
  additional_info TEXT,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX user_id_idx (user_id),
  INDEX payment_gateway_id_idx (payment_gateway_id),
  INDEX is_active_idx (is_active),
  INDEX verification_status_idx (verification_status),
  INDEX is_primary_idx (is_primary),
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (payment_gateway_id) REFERENCES payment_gateway(id)
);
```

## Security Considerations

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own accounts (enforced at application level)
- **Input Validation**: Comprehensive validation for all input fields
- **SQL Injection Protection**: Uses parameterized queries via Drizzle ORM
- **Rate Limiting**: Consider implementing rate limiting for production use

## Performance Considerations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: Implemented for large datasets
- **Efficient Joins**: Optimized database queries with proper relationships
- **Caching**: Consider caching for frequently accessed data

## Future Enhancements

- **Bulk Operations**: Batch create/update/delete operations
- **Account Templates**: Predefined account templates for common providers
- **Verification Workflow**: Advanced verification process with document uploads
- **Audit Logging**: Comprehensive audit trail for all account changes
- **Webhook Support**: Real-time notifications for account status changes
- **Export Functionality**: CSV/Excel export of account data
- **Advanced Analytics**: Trend analysis and reporting features
