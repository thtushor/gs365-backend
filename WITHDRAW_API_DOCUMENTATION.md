# Withdraw API Documentation

## Overview
The Withdraw API allows users to create withdrawal requests after validating their eligibility based on balance and turnover requirements.

## Endpoint
```
POST /api/transactions/withdraw
```

## Authentication
- **Required**: JWT Token in Authorization header
- **Header**: `Authorization: Bearer <token>`

## Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | number | Yes | The ID of the user making the withdrawal |
| `amount` | number | Yes | The amount to withdraw (must be positive) |
| `currencyId` | number | Yes | The ID of the currency for the withdrawal |
| `withdrawalPaymentAccountId` | number | No | ID of the withdrawal payment account (optional) |
| `notes` | string | No | Additional notes for the withdrawal |
| `attachment` | string | No | File attachment or reference |
| **Bank-specific fields** | | | |
| `accountNumber` | string | No | Bank account number |
| `accountHolderName` | string | No | Name of the account holder |
| `bankName` | string | No | Name of the bank |
| `branchName` | string | No | Bank branch name |
| `branchAddress` | string | No | Bank branch address |
| `swiftCode` | string | No | SWIFT/BIC code |
| `iban` | string | No | International Bank Account Number |
| **Wallet-specific fields** | | | |
| `walletAddress` | string | No | Cryptocurrency wallet address |
| `network` | string | No | Blockchain network (e.g., Bitcoin, Ethereum) |

## Business Logic

### Withdrawal Eligibility Rules
A user can withdraw if **ALL** conditions are met:

1. **Sufficient Balance**: `currentBalance >= minWithdrawableBalance`
2. **No Pending Turnover**: No active turnover requirements
3. **Valid Amount**: Amount > 0 and Amount <= currentBalance

### Validation Process
1. **Input Validation**: Check required fields and amount validity
2. **User Existence**: Verify user exists in the system
3. **Balance Check**: Calculate current balance using BalanceModel
4. **Turnover Check**: Verify no pending turnover requirements
5. **Amount Validation**: Ensure withdrawal amount doesn't exceed balance
6. **Transaction Creation**: Create pending withdrawal transaction

## Response Examples

### Success Response (201)
```json
{
  "status": true,
  "message": "Withdrawal request created successfully",
  "data": {
    "transactionId": 456,
    "customTransactionId": "WD_20241201_001",
    "amount": 50000.00,
    "status": "pending",
    "currentBalance": 150000.00,
    "remainingBalance": 100000.00
  }
}
```

### Error Response - Insufficient Balance
```json
{
  "status": false,
  "message": "Withdrawal not allowed",
  "data": {
    "canWithdraw": false,
    "withdrawReason": "Insufficient balance. Current balance: 15000.00, Minimum required: 25000.00"
  }
}
```

## Related Endpoints
- `GET /api/transactions/withdraw-capability/:userId` - Check withdrawal eligibility
- `POST /api/transactions/:id/status` - Update transaction status

## Request Examples

### Bank Withdrawal Example
```json
{
  "userId": 123,
  "amount": 50000.00,
  "currencyId": 1,
  "notes": "Bank withdrawal to main account",
  "attachment": "bank_statement.pdf",
  "accountNumber": "1234567890",
  "accountHolderName": "John Doe",
  "bankName": "Chase Bank",
  "branchName": "Downtown Branch",
  "branchAddress": "123 Main St, New York, NY 10001",
  "swiftCode": "CHASUS33",
  "iban": "US64CHAS1234567890123456"
}
```

### Cryptocurrency Withdrawal Example
```json
{
  "userId": 123,
  "amount": 25000.00,
  "currencyId": 1,
  "notes": "Bitcoin withdrawal",
  "attachment": "wallet_screenshot.png",
  "walletAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "network": "Bitcoin"
}
```

### Basic Withdrawal Example
```json
{
  "userId": 123,
  "amount": 30000.00,
  "currencyId": 1,
  "notes": "Monthly withdrawal"
}
```

