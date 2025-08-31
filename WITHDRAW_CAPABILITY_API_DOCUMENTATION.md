# Withdraw Capability Check API Documentation

## Overview
The Withdraw Capability Check API allows you to verify if a user is eligible to make withdrawals by checking their balance and turnover requirements.

## Endpoint
```
GET /api/transactions/withdraw-capability/:userId
```

## Authentication
- **Required**: JWT Token in Authorization header
- **Header**: `Authorization: Bearer <token>`

## URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | Yes | The ID of the user to check withdraw capability for |

## Request Example
```bash
curl -X GET \
  "http://localhost:3000/api/transactions/withdraw-capability/123" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Response Format

### Success Response (200)
```json
{
  "status": true,
  "message": "Withdraw capability check completed",
  "data": {
    "canWithdraw": true,
    "currentBalance": 50000.00,
    "minWithdrawableBalance": 25000.00,
    "hasSufficientBalance": true,
    "hasPendingTurnover": false,
    "pendingTurnover": [],
    "balanceBreakdown": {
      "totalDeposits": 80000.00,
      "totalWins": 15000.00,
      "totalWithdrawals": 30000.00,
      "totalLosses": 15000.00
    }
  }
}
```

### Error Responses

#### Bad Request (400)
```json
{
  "status": false,
  "message": "Invalid user ID"
}
```

#### Not Found (404)
```json
{
  "status": false,
  "message": "User not found"
}
```

#### Internal Server Error (500)
```json
{
  "status": false,
  "message": "Internal Server Error",
  "error": "Error details"
}
```

## Response Fields

### Main Response Object
| Field | Type | Description |
|-------|------|-------------|
| `status` | boolean | API call success status |
| `message` | string | Human-readable message |
| `data` | object | Response data object |

### Data Object
| Field | Type | Description |
|-------|------|-------------|
| `canWithdraw` | boolean | **Primary result**: Whether user can withdraw or not |
| `currentBalance` | number | User's current available balance |
| `minWithdrawableBalance` | number | Minimum balance required for withdrawal (from settings) |
| `hasSufficientBalance` | boolean | Whether user meets minimum balance requirement |
| `hasPendingTurnover` | boolean | Whether user has any pending turnover requirements |
| `pendingTurnover` | array | Array of pending turnover objects (empty if none) |
| `balanceBreakdown` | object | Detailed breakdown of user's financial position |

### Balance Breakdown
| Field | Type | Description |
|-------|------|-------------|
| `totalDeposits` | number | Total approved deposits (including bonuses) |
| `totalWins` | number | Total approved wins |
| `totalWithdrawals` | number | Total approved withdrawals |
| `totalLosses` | number | Total approved losses |

### Pending Turnover Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Turnover record ID |
| `remainingTurnover` | number | Amount of turnover still required |
| `targetTurnover` | number | Total turnover target amount |
| `type` | string | Turnover type (default/promotion) |
| `status` | string | Turnover status |

## Business Logic

### Withdrawal Eligibility Rules
A user can withdraw if **BOTH** conditions are met:

1. **Sufficient Balance**: `currentBalance >= minWithdrawableBalance`
2. **No Pending Turnover**: No active turnover requirements

### Balance Calculation
```
currentBalance = totalDeposits + totalWins - totalWithdrawals - totalLosses
```

Where:
- `totalDeposits` includes both transaction amount and bonus amounts
- All amounts are from approved transactions only

### Turnover Check
- Only checks turnovers with `status = 'active'`
- Includes both default and promotion-based turnovers
- Any active turnover blocks withdrawal regardless of amount

## Use Cases

### 1. Pre-Withdrawal Validation
Check if a user can withdraw before processing withdrawal requests.

### 2. User Dashboard Display
Show users their current withdrawal eligibility status.

### 3. Admin Monitoring
Monitor user withdrawal capabilities and turnover compliance.

### 4. Automated Systems
Integrate with withdrawal processing systems to prevent invalid requests.

## Examples

### Example 1: User Can Withdraw
```json
{
  "canWithdraw": true,
  "currentBalance": 75000.00,
  "minWithdrawableBalance": 25000.00,
  "hasSufficientBalance": true,
  "hasPendingTurnover": false
}
```

### Example 2: User Cannot Withdraw - Insufficient Balance
```json
{
  "canWithdraw": false,
  "currentBalance": 15000.00,
  "minWithdrawableBalance": 25000.00,
  "hasSufficientBalance": false,
  "hasPendingTurnover": false
}
```

### Example 3: User Cannot Withdraw - Pending Turnover
```json
{
  "canWithdraw": false,
  "currentBalance": 100000.00,
  "minWithdrawableBalance": 25000.00,
  "hasSufficientBalance": true,
  "hasPendingTurnover": true,
  "pendingTurnover": [
    {
      "id": 1,
      "remainingTurnover": 50000.00,
      "targetTurnover": 100000.00,
      "type": "promotion",
      "status": "active"
    }
  ]
}
```

## Performance Considerations

- **Database Queries**: Uses optimized SQL with proper indexing
- **Caching**: Consider caching results for frequently checked users
- **Rate Limiting**: Implement rate limiting for production use

## Security Considerations

- **Authentication Required**: All requests must include valid JWT token
- **User Isolation**: Users can only check their own withdrawal capability
- **Input Validation**: User ID is validated and sanitized
- **Error Handling**: Sensitive information is not exposed in error messages

## Related Endpoints

- `POST /api/transactions/withdraw` - Process withdrawal requests
- `GET /api/transactions/` - Get user transaction history
- `GET /api/dashboard` - Get overall financial dashboard

## Notes

- The minimum withdrawable balance is configurable via the settings table
- Bonus amounts from promotions are included in deposit calculations
- Turnover requirements are enforced regardless of balance amount
- All monetary values are returned as numbers with 2 decimal places
