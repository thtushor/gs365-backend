# 🎯 Player Balance Calculation API

## 📋 Overview

The Player Balance API calculates player balances based on transaction types using the following formula:

**Current Balance = Deposits + Wins - Withdrawals - Losses**

## 🔢 Balance Calculation Logic

### Transaction Type Impact:
- **`deposit`** → **+ (Add to balance)**
- **`withdraw`** → **- (Subtract from balance)**
- **`win`** → **+ (Add to balance)**
- **`loss`** → **- (Subtract from balance)**

### Status Filtering:
- **Approved transactions** → Included in current balance calculation
- **Pending transactions** → Shown separately but not included in current balance

## 🔗 API Endpoints

### Public Routes (No Authentication Required)

#### 1. Get Player Balance
```http
GET /api/balance/player/{userId}?currencyId={currencyId}
```

**Parameters:**
- `userId` (path): Player's user ID
- `currencyId` (query, optional): Specific currency ID to filter

**Response:**
```json
{
  "status": true,
  "data": {
    "userId": 123,
    "currencyId": 1,
    "currencyCode": "N/A",
    "totalDeposits": 1000.00,
    "totalWithdrawals": 200.00,
    "totalWins": 150.00,
    "totalLosses": 50.00,
    "currentBalance": 900.00,
    "pendingDeposits": 100.00,
    "pendingWithdrawals": 0.00,
    "approvedDeposits": 1000.00,
    "approvedWithdrawals": 200.00
  },
  "message": "Player balance calculated successfully"
}
```

#### 2. Get Player Balance Summary
```http
GET /api/balance/player/{userId}/summary
```

**Response:**
```json
{
  "status": true,
  "data": {
    "totalBalance": 900.00,
    "currencyBalances": [...],
    "summary": {
      "totalDeposits": 1000.00,
      "totalWithdrawals": 200.00,
      "totalWins": 150.00,
      "totalLosses": 50.00,
      "netGamblingResult": 100.00
    }
  },
  "message": "Player balance summary retrieved successfully"
}
```

#### 3. Get Currency-Specific Balance
```http
GET /api/balance/player/{userId}/currency/{currencyId}
```

#### 4. Get All Player Balances
```http
GET /api/balance/all?userId={userId}&currencyId={currencyId}&status={status}
```

**Query Parameters:**
- `userId`: Filter by specific user
- `currencyId`: Filter by specific currency
- `status`: Filter by status (`all`, `approved`, `pending`)

### Private Routes (Authentication Required)

#### 5. Get My Balance
```http
GET /api/balance/my-balance?currencyId={currencyId}
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

#### 6. Get My Balance Summary
```http
GET /api/balance/my-balance/summary
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Data Structure

### PlayerBalance Interface
```typescript
interface PlayerBalance {
  userId: number;           // User ID
  currencyId: number;       // Currency ID
  currencyCode: string;     // Currency code (e.g., "USD", "EUR") or "N/A"
  totalDeposits: number;    // Sum of all approved deposits
  totalWithdrawals: number; // Sum of all approved withdrawals
  totalWins: number;        // Sum of all approved wins
  totalLosses: number;      // Sum of all approved losses
  currentBalance: number;   // Calculated: deposits + wins - withdrawals - losses
  pendingDeposits: number;  // Sum of pending deposits
  pendingWithdrawals: number; // Sum of pending withdrawals
  approvedDeposits: number;   // Same as totalDeposits
  approvedWithdrawals: number; // Same as totalWithdrawals
}
```

### Balance Summary Interface
```typescript
interface BalanceSummary {
  totalBalance: number;           // Total balance across all currencies
  currencyBalances: PlayerBalance[]; // Balance for each currency
  summary: {
    totalDeposits: number;        // Total deposits across all currencies
    totalWithdrawals: number;     // Total withdrawals across all currencies
    totalWins: number;           // Total wins across all currencies
    totalLosses: number;         // Total losses across all currencies
    netGamblingResult: number;   // wins - losses
  };
}
```

## 🧮 Calculation Examples

### Example 1: Simple Balance
```
User 123 has:
- Deposits: $1000 (approved)
- Withdrawals: $200 (approved)
- Wins: $150 (approved)
- Losses: $50 (approved)

Current Balance = $1000 + $150 - $200 - $50 = $900
```

### Example 2: With Pending Transactions
```
User 456 has:
- Deposits: $500 (approved) + $100 (pending)
- Withdrawals: $100 (approved) + $50 (pending)
- Wins: $75 (approved)
- Losses: $25 (approved)

Current Balance = $500 + $75 - $100 - $25 = $450
Pending: +$100 (deposits) - $50 (withdrawals) = +$50
```

### Example 3: Multiple Currencies
```
User 789 has:
USD:
- Deposits: $1000, Wins: $200, Withdrawals: $300, Losses: $100
- Balance: $1000 + $200 - $300 - $100 = $800

EUR:
- Deposits: €500, Wins: €100, Withdrawals: €150, Losses: €50
- Balance: €500 + €100 - €150 - €50 = €400

Total Balance: $800 + €400
```

## 🔍 SQL Query Logic

The balance calculation uses optimized Drizzle ORM queries with CASE statements:

```typescript
const result = await db
  .select({
    userId: transactions.userId,
    currencyId: transactions.currencyId,
    totalDeposits: sql<number>`
      COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
        AND ${transactions.status} = 'approved' 
        THEN ${transactions.amount} ELSE 0 END), 0)
    `,
    totalWithdrawals: sql<number>`
      COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
        AND ${transactions.status} = 'approved' 
        THEN ${transactions.amount} ELSE 0 END), 0)
    `,
    totalWins: sql<number>`
      COALESCE(SUM(CASE WHEN ${transactions.type} = 'win' 
        AND ${transactions.status} = 'approved' 
        THEN ${transactions.amount} ELSE 0 END), 0)
    `,
    totalLosses: sql<number>`
      COALESCE(SUM(CASE WHEN ${transactions.type} = 'loss' 
        AND ${transactions.status} = 'approved' 
        THEN ${transactions.amount} ELSE 0 END), 0)
    `,
    pendingDeposits: sql<number>`
      COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
        AND ${transactions.status} = 'pending' 
        THEN ${transactions.amount} ELSE 0 END), 0)
    `,
    pendingWithdrawals: sql<number>`
      COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
        AND ${transactions.status} = 'pending' 
        THEN ${transactions.amount} ELSE 0 END), 0)
    `,
  })
  .from(transactions)
  .where(and(...whereConditions))
  .groupBy(transactions.userId, transactions.currencyId);
```

## 🚀 Usage Examples

### Frontend Integration (React Query + Axios)

```typescript
// Get player balance (returns single object)
const { data: balance } = useQuery({
  queryKey: ['balance', userId],
  queryFn: () => axios.get(`/api/balance/player/${userId}`)
});

// Access balance data
console.log(balance?.data.currentBalance); // 900.00
console.log(balance?.data.totalDeposits);  // 1000.00

// Get my balance (authenticated)
const { data: myBalance } = useQuery({
  queryKey: ['myBalance'],
  queryFn: () => axios.get('/api/balance/my-balance', {
    headers: { Authorization: `Bearer ${token}` }
  })
});
```

### cURL Examples

```bash
# Get player balance
curl -X GET "http://localhost:3000/api/balance/player/123"

# Get player balance for specific currency
curl -X GET "http://localhost:3000/api/balance/player/123?currencyId=1"

# Get my balance (authenticated)
curl -X GET "http://localhost:3000/api/balance/my-balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all balances with filters
curl -X GET "http://localhost:3000/api/balance/all?userId=123&status=approved"
```

## ⚠️ Important Notes

1. **Status Matters**: Only `approved` transactions affect the current balance
2. **Pending Transactions**: Shown separately but don't impact current balance
3. **Currency Conversion**: Balances are calculated per currency, not converted
4. **Real-time**: Balances are calculated on-demand from transaction data
5. **Performance**: Uses optimized Drizzle ORM with proper indexing on user_id, currency_id, type, and status
6. **Single Object**: `calculatePlayerBalance` returns a single `PlayerBalance` object, not an array

## 🔒 Security

- **Public Routes**: Available for admin/system use
- **Private Routes**: Require valid JWT token
- **User Isolation**: Users can only access their own balance data
- **Input Validation**: All parameters are validated and sanitized

## 📈 Performance Considerations

- **Indexing**: Ensure proper database indexes on:
  - `transactions.user_id`
  - `transactions.currency_id`
  - `transactions.type`
  - `transactions.status`
- **Caching**: Consider caching balance results for frequently accessed users
- **Pagination**: For large datasets, implement pagination in the `all` endpoint

## 🔧 Key Changes

- **Single Object Return**: `calculatePlayerBalance` now returns `PlayerBalance` instead of `PlayerBalance[]`
- **Default Values**: Returns default balance object with zeros if no transactions found
- **Error Handling**: Improved error handling and validation
- **Type Safety**: Full TypeScript support with proper interfaces

This API provides a robust and accurate way to calculate player balances based on their transaction history! 🎉
