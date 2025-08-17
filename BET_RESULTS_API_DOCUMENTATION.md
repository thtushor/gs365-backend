# Bet Results API Documentation

## Overview
This API provides comprehensive access to bet results, player rankings, leaderboards, and performance analytics. It includes flexible filtering, pagination, and various ranking options.

## Base URL
```
/api/bet-results
```

## Authentication
- **Public Endpoints**: No authentication required
- **Protected Endpoints**: Require valid JWT token in Authorization header

---

## 1. Get All Bet Results
**GET** `/api/bet-results`

Get bet results with comprehensive filtering and pagination.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | No | Filter by specific user ID |
| `gameId` | number | No | Filter by specific game ID |
| `betStatus` | string[] | No | Filter by bet status: `win`, `loss`, `pending`, `cancelled` |
| `playingStatus` | string[] | No | Filter by playing status: `playing`, `completed`, `abandoned` |
| `dateFrom` | string | No | Filter from date (ISO format) |
| `dateTo` | string | No | Filter to date (ISO format) |
| `minBetAmount` | number | No | Minimum bet amount filter |
| `maxBetAmount` | number | No | Maximum bet amount filter |
| `gameName` | string | No | Filter by game name (partial match) |
| `providerName` | string | No | Filter by provider name (partial match) |
| `isMobile` | boolean | No | Filter by mobile device usage |
| `limit` | number | No | Number of results per page (default: 50) |
| `offset` | number | No | Number of results to skip (default: 0) |
| `sortBy` | string | No | Sort field: `createdAt`, `betAmount`, `userScore`, `betPlacedAt` (default: `createdAt`) |
| `sortOrder` | string | No | Sort order: `asc`, `desc` (default: `desc`) |

### Example Request
```bash
GET /api/bet-results?betStatus=win&dateFrom=2024-01-01&limit=20&sortBy=betAmount&sortOrder=desc
```

### Response
```json
{
  "success": true,
  "message": "Bet results retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 0,
    "pageSize": 20,
    "totalPages": 5,
    "hasMore": true
  },
  "filters": {...},
  "count": 20
}
```

---

## 2. Player Rankings & Leaderboards

### 2.1 Get Player Rankings
**GET** `/api/bet-results/rankings/players`

Get comprehensive player rankings with various ranking criteria.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rankBy` | string | No | Ranking criteria: `totalWins`, `totalWinAmount`, `winRate`, `totalProfit`, `totalBets`, `avgBetAmount` (default: `totalWins`) |
| `sortOrder` | string | No | Sort order: `asc`, `desc` (default: `desc`) |
| `limit` | number | No | Number of results per page (default: 50) |
| `offset` | number | No | Number of results to skip (default: 0) |
| `dateFrom` | string | No | Filter from date (ISO format) |
| `dateTo` | string | No | Filter to date (ISO format) |
| `gameId` | number | No | Filter by specific game ID |
| `minGames` | number | No | Minimum games played to be included (default: 1) |
| `includeStats` | boolean | No | Include detailed player stats (default: true) |

#### Example Request
```bash
GET /api/bet-results/rankings/players?rankBy=totalWinAmount&limit=10&minGames=5&dateFrom=2024-01-01
```

#### Response
```json
{
  "success": true,
  "message": "Player rankings retrieved successfully",
  "data": [
    {
      "userId": 123,
      "rank": 1,
      "totalBets": 50,
      "totalWins": 35,
      "totalLosses": 15,
      "totalWinAmount": 2500.50,
      "totalLossAmount": 750.25,
      "totalBetAmount": 2000.00,
      "winRate": 70.00,
      "totalProfit": 1750.25,
      "avgBetAmount": 40.00,
      "lastPlayed": "2024-01-15T10:30:00Z",
      "stats": {
        "gamesPlayed": ["Crash Game", "Dice Game", "Roulette"],
        "favoriteGame": "Crash Game",
        "bestWin": 500.00,
        "worstLoss": 100.00
      }
    }
  ],
  "pagination": {...},
  "ranking": {
    "rankBy": "totalWinAmount",
    "sortOrder": "desc",
    "minGames": 5
  },
  "count": 10
}
```

### 2.2 Get Top Winners
**GET** `/api/bet-results/rankings/winners`

Get top winners leaderboard sorted by total win amount.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of results per page (default: 50) |
| `offset` | number | No | Number of results to skip (default: 0) |
| `dateFrom` | string | No | Filter from date (ISO format) |
| `dateTo` | string | No | Filter to date (ISO format) |
| `gameId` | number | No | Filter by specific game ID |
| `minGames` | number | No | Minimum games played to be included (default: 1) |

#### Example Request
```bash
GET /api/bet-results/rankings/winners?limit=20&minGames=3&dateFrom=2024-01-01
```

### 2.3 Get Top Losers
**GET** `/api/bet-results/rankings/losers`

Get top losers leaderboard sorted by total loss amount.

#### Query Parameters
Same as Top Winners endpoint.

---

## 3. Performance Analytics

### 3.1 Get Player Performance
**GET** `/api/bet-results/performance/player`

Get detailed performance analytics for a specific player.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | **Yes** | User ID to get performance for |
| `dateFrom` | string | No | Filter from date (ISO format) |
| `dateTo` | string | No | Filter to date (ISO format) |
| `gameId` | number | No | Filter by specific game ID |
| `groupBy` | string | No | Grouping: `day`, `week`, `month`, `game` (default: `day`) |

#### Example Request
```bash
GET /api/bet-results/performance/player?userId=123&groupBy=week&dateFrom=2024-01-01
```

#### Response
```json
{
  "success": true,
  "message": "Player performance analytics retrieved successfully",
  "data": {
    "userId": 123,
    "groupBy": "week",
    "dateFormat": "YYYY-WW",
    "data": [
      {
        "period": "2024-01",
        "totalBets": 15,
        "totalWins": 10,
        "totalLosses": 5,
        "totalWinAmount": 750.00,
        "totalLossAmount": 250.00,
        "totalBetAmount": 600.00,
        "avgBetAmount": 40.00,
        "winRate": 66.67,
        "totalProfit": 500.00
      }
    ]
  }
}
```

### 3.2 Get Game Performance
**GET** `/api/bet-results/performance/game`

Get detailed performance analytics for a specific game.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `gameId` | number | **Yes** | Game ID to get performance for |
| `dateFrom` | string | No | Filter from date (ISO format) |
| `dateTo` | string | No | Filter to date (ISO format) |
| `groupBy` | string | No | Grouping: `day`, `week`, `month`, `user` (default: `day`) |

---

## 4. Dashboard Statistics
**GET** `/api/bet-results/dashboard/stats`

Get comprehensive dashboard statistics with overview, top performers, recent activity, and game popularity.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateFrom` | string | No | Filter from date (ISO format) |
| `dateTo` | string | No | Filter to date (ISO format) |
| `gameId` | number | No | Filter by specific game ID |
| `userId` | number | No | Filter by specific user ID |

#### Response
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "overview": {
      "totalBets": 1250,
      "totalBetAmount": 50000.00,
      "totalWins": 750,
      "totalLosses": 500,
      "totalWinAmount": 45000.00,
      "totalLossAmount": 30000.00,
      "uniquePlayers": 150,
      "uniqueGames": 25,
      "winRate": 60.00,
      "totalProfit": 15000.00,
      "averageBetAmount": 40.00
    },
    "topPerformers": [
      {
        "rank": 1,
        "userId": 123,
        "totalWins": 35,
        "totalWinAmount": 2500.50
      }
    ],
    "recentActivity": [...],
    "gamePopularity": [...]
  }
}
```

---

## 5. Individual Bet Result Operations

### 5.1 Get Bet Result by ID
**GET** `/api/bet-results/:id`

### 5.2 Get Bet Results by User (Protected)
**GET** `/api/bet-results/user/:userId`

### 5.3 Get Bet Results by Game
**GET** `/api/bet-results/game/:gameId`

### 5.4 Get Bet Results by Status
**GET** `/api/bet-results/status/:status`

### 5.5 Get Bet Result Statistics
**GET** `/api/bet-results/stats`

---

## Ranking Criteria Options

### `rankBy` Parameter Values

1. **`totalWins`** - Rank by total number of wins
2. **`totalWinAmount`** - Rank by total amount won
3. **`winRate`** - Rank by win percentage
4. **`totalProfit`** - Rank by net profit (wins - losses)
5. **`totalBets`** - Rank by total number of bets placed
6. **`avgBetAmount`** - Rank by average bet amount

### Sorting Options

- **`sortOrder`**: `asc` (ascending) or `desc` (descending)
- **Default**: `desc` for most ranking criteria (higher values first)

---

## Filtering Examples

### Get Top 10 Winners in Last Month
```bash
GET /api/bet-results/rankings/winners?limit=10&dateFrom=2024-01-01&dateTo=2024-01-31&minGames=5
```

### Get Player Performance by Week
```bash
GET /api/bet-results/performance/player?userId=123&groupBy=week&dateFrom=2024-01-01
```

### Get Game Performance by User
```bash
GET /api/bet-results/performance/game?gameId=456&groupBy=user&dateFrom=2024-01-01
```

### Get Rankings by Win Rate
```bash
GET /api/bet-results/rankings/players?rankBy=winRate&sortOrder=desc&minGames=10&limit=25
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- **200** - Success
- **400** - Bad Request (invalid parameters)
- **401** - Unauthorized (missing/invalid token for protected routes)
- **404** - Not Found
- **500** - Internal Server Error

---

## Pagination

All list endpoints support pagination with the following response structure:

```json
{
  "pagination": {
    "total": 1000,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Performance Considerations

- All endpoints include proper database indexing recommendations
- Pagination is enforced to prevent large result sets
- Date range filters are recommended for large datasets
- The `minGames` filter helps ensure meaningful rankings
- Complex analytics queries are optimized with proper SQL aggregation

---

## Rate Limiting

- Public endpoints: 100 requests per minute per IP
- Protected endpoints: 200 requests per minute per user
- Analytics endpoints: 50 requests per minute per user

---

## Data Freshness

- Real-time data for recent bet results
- Aggregated statistics updated every 5 minutes
- Historical data available for up to 2 years
- Performance metrics calculated on-demand

