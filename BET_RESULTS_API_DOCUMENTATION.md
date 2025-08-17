# Bet Results API Documentation

## Overview
This document describes the Bet Results API endpoints for retrieving and filtering betting results with comprehensive game and provider information in the Fashion Glory gaming platform.

## Base URL
```
http://localhost:3000/api/bet-results
```

## Authentication
Most endpoints are public, but user-specific routes require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Bet Results with Filtering
**GET** `/`

Retrieves bet results with comprehensive filtering and pagination capabilities.

**Query Parameters:**
- `userId` (optional): Filter by specific user ID
- `gameId` (optional): Filter by specific game ID
- `betStatus` (optional): Filter by bet status (win, loss, pending, cancelled) - can be multiple
- `playingStatus` (optional): Filter by playing status (playing, completed, abandoned) - can be multiple
- `dateFrom` (optional): Filter from specific date (ISO string)
- `dateTo` (optional): Filter to specific date (ISO string)
- `minBetAmount` (optional): Minimum bet amount filter
- `maxBetAmount` (optional): Maximum bet amount filter
- `gameName` (optional): Filter by game name (partial match)
- `providerName` (optional): Filter by provider name (partial match)
- `isMobile` (optional): Filter by mobile device (true/false)
- `limit` (optional): Number of results per page (default: 50)
- `offset` (optional): Number of results to skip (default: 0)
- `sortBy` (optional): Sort field (createdAt, betAmount, userScore, betPlacedAt) - default: createdAt
- `sortOrder` (optional): Sort order (asc, desc) - default: desc

**Example Request:**
```
GET /api/bet-results?userId=1&betStatus=win&limit=20&sortBy=betAmount&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Bet results retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "gameId": 1,
      "betAmount": "100.00",
      "betStatus": "win",
      "playingStatus": "completed",
      "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "gameSessionId": "game_1_1_1704067200000",
      "winAmount": "200.00",
      "lossAmount": "0.00",
      "multiplier": "2.0000",
      "gameName": "Slot Machine Deluxe",
      "gameProvider": "{\"id\":1,\"name\":\"Game Provider Inc\"}",
      "gameCategory": "{\"id\":1,\"name\":\"Slots\"}",
      "userScore": 1500,
      "userLevel": "intermediate",
      "betPlacedAt": "2024-01-01T12:00:00.000Z",
      "gameStartedAt": "2024-01-01T12:00:00.000Z",
      "gameCompletedAt": "2024-01-01T12:05:00.000Z",
      "ipAddress": "192.168.1.1",
      "deviceInfo": "Chrome 120.0.0.0 on Windows 10",
      "isMobile": false,
      "createdBy": "system",
      "updatedBy": "system",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:05:00.000Z",
      "gameDetails": {
        "id": 1,
        "name": "Slot Machine Deluxe",
        "gameLogo": "https://example.com/logo.png",
        "gameUrl": "https://game.example.com/slot",
        "status": "active"
      },
      "providerDetails": {
        "id": 1,
        "name": "Game Provider Inc",
        "logo": "https://example.com/provider-logo.png",
        "status": "active",
        "country": "Malta"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "filters": {
    "userId": 1,
    "betStatus": ["win"],
    "limit": 20,
    "sortBy": "betAmount",
    "sortOrder": "desc"
  },
  "count": 20
}
```

### 2. Get Bet Result by ID
**GET** `/:id`

Retrieves a specific bet result by its ID.

**Parameters:**
- `id` (path): Bet result ID

**Response:**
```json
{
  "success": true,
  "message": "Bet result retrieved successfully",
  "data": {
    // Same structure as above
  }
}
```

### 3. Get Bet Result Statistics
**GET** `/stats`

Retrieves comprehensive statistics for bet results with optional filtering.

**Query Parameters:**
- `userId` (optional): Filter by specific user ID
- `gameId` (optional): Filter by specific game ID
- `betStatus` (optional): Filter by bet status
- `dateFrom` (optional): Filter from specific date
- `dateTo` (optional): Filter to specific date

**Response:**
```json
{
  "success": true,
  "message": "Bet result statistics retrieved successfully",
  "data": {
    "totalBets": 150,
    "totalBetAmount": 15000.00,
    "totalWins": 45,
    "totalLosses": 105,
    "totalWinAmount": 18000.00,
    "totalLossAmount": 15000.00,
    "averageBetAmount": 100.00,
    "winRate": 30.0
  }
}
```

### 4. Get Recent Bet Results
**GET** `/recent`

Retrieves the most recent bet results.

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Recent bet results retrieved successfully",
  "data": [...],
  "count": 20
}
```

### 5. Get Bet Results by Status
**GET** `/status/:status`

Retrieves bet results filtered by a specific status.

**Parameters:**
- `status` (path): Bet status (win, loss, pending, cancelled)

**Query Parameters:**
- `limit` (optional): Number of results per page
- `offset` (optional): Number of results to skip

**Response:**
```json
{
  "success": true,
  "message": "Bet results with status 'win' retrieved successfully",
  "data": [...],
  "pagination": {...},
  "count": 45
}
```

### 6. Get Bet Results by Game
**GET** `/game/:gameId`

Retrieves all bet results for a specific game.

**Parameters:**
- `gameId` (path): Game ID

**Query Parameters:**
- `limit` (optional): Number of results per page
- `offset` (optional): Number of results to skip

**Response:**
```json
{
  "success": true,
  "message": "Game bet results retrieved successfully",
  "data": [...],
  "pagination": {...},
  "count": 25
}
```

### 7. Get Bet Results by User (Protected)
**GET** `/user/:userId`

Retrieves all bet results for a specific user. Requires authentication.

**Parameters:**
- `userId` (path): User ID

**Query Parameters:**
- `limit` (optional): Number of results per page
- `offset` (optional): Number of results to skip

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User bet results retrieved successfully",
  "data": [...],
  "pagination": {...},
  "count": 30
}
```

## Filtering Examples

### Filter by Date Range
```
GET /api/bet-results?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T23:59:59.999Z
```

### Filter by Multiple Statuses
```
GET /api/bet-results?betStatus=win&betStatus=loss
```

### Filter by Bet Amount Range
```
GET /api/bet-results?minBetAmount=50&maxBetAmount=500
```

### Filter by Game Name
```
GET /api/bet-results?gameName=Slot
```

### Filter by Provider
```
GET /api/bet-results?providerName=Game Provider
```

### Filter by Mobile Device
```
GET /api/bet-results?isMobile=true
```

### Complex Filtering
```
GET /api/bet-results?userId=1&betStatus=win&minBetAmount=100&dateFrom=2024-01-01T00:00:00.000Z&sortBy=betAmount&sortOrder=desc&limit=25
```

## Data Structure

### Bet Result Object
```typescript
interface BetResultWithDetails {
  id: number;
  userId: number;
  gameId: number;
  betAmount: string;
  betStatus: string;
  playingStatus: string;
  sessionToken: string;
  gameSessionId: string | null;
  winAmount: string;
  lossAmount: string;
  multiplier: string;
  gameName: string;
  gameProvider: string; // JSON string
  gameCategory: string; // JSON string
  userScore: number;
  userLevel: string;
  betPlacedAt: Date;
  gameStartedAt: Date | null;
  gameCompletedAt: Date | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  isMobile: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Joined data
  gameDetails?: {
    id: number;
    name: string;
    gameLogo: string;
    gameUrl: string;
    status: string;
  };
  
  providerDetails?: {
    id: number;
    name: string;
    logo: string;
    status: string;
    country: string;
  };
}
```

### Provider Information Parsing
The `gameProvider` field contains JSON data that can be parsed to extract provider details:

```javascript
// Example gameProvider JSON
{
  "id": 1,
  "name": "Game Provider Inc",
  "apiKey": "provider_api_key",
  "endpoint": "https://api.gameprovider.com"
}

// Parse in your application
const providerInfo = JSON.parse(betResult.gameProvider);
console.log(providerInfo.name); // "Game Provider Inc"
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token for protected routes)
- `404`: Not Found (bet result not found)
- `500`: Internal Server Error

## Pagination

All list endpoints support pagination with the following response structure:

```json
{
  "pagination": {
    "total": 150,        // Total number of results
    "limit": 20,         // Results per page
    "offset": 0,         // Current offset
    "hasMore": true      // Whether there are more results
  }
}
```

## Sorting

Results can be sorted by the following fields:
- `createdAt`: When the bet result was created
- `betAmount`: Bet amount
- `userScore`: User's score
- `betPlacedAt`: When the bet was placed

Sort order can be:
- `asc`: Ascending order
- `desc`: Descending order (default)

## Performance Considerations

1. **Indexing**: Ensure proper database indexes on frequently filtered fields
2. **Pagination**: Always use pagination for large result sets
3. **Filtering**: Apply filters early in the query to reduce data transfer
4. **Caching**: Consider caching frequently accessed statistics

## Rate Limiting

Consider implementing rate limiting for:
- High-frequency filtering requests
- Statistics queries
- User-specific data retrieval

## Testing

Use the following test queries to verify functionality:

```bash
# Get all bet results
curl "http://localhost:3000/api/bet-results"

# Filter by user
curl "http://localhost:3000/api/bet-results?userId=1"

# Get statistics
curl "http://localhost:3000/api/bet-results/stats"

# Get recent results
curl "http://localhost:3000/api/bet-results/recent?limit=10"
```

## Support

For technical support or questions about the Bet Results API, please contact the development team.

