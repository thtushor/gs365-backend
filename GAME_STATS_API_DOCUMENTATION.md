# Game Statistics API Documentation

## Overview
The Game Statistics API provides comprehensive game-wise statistics and analytics from the bet results table. This API aggregates data across multiple dimensions including betting metrics, player engagement, and game performance with full relationship joins.

## Endpoints

### 1. GET /api/game-stats

**Description:** Retrieves comprehensive game-wise statistics with filtering, sorting, and pagination capabilities.

**URL:** `GET /api/game-stats`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dateFrom` | string | No | - | Start date (ISO format: YYYY-MM-DD) |
| `dateTo` | string | No | - | End date (ISO format: YYYY-MM-DD) |
| `gameId` | number | No | - | Filter by specific game ID |
| `gameName` | string | No | - | Filter by game name (partial match) |
| `providerId` | number | No | - | Filter by game provider ID |
| `categoryId` | number | No | - | Filter by game category ID |
| `status` | string | No | - | Filter by game status (active/inactive) |
| `limit` | number | No | 50 | Number of results per page (1-100) |
| `offset` | number | No | 0 | Number of results to skip |
| `sortBy` | string | No | "totalBets" | Sort field |
| `sortOrder` | string | No | "desc" | Sort order (asc/desc) |

**Sort Options for `sortBy`:**
- `totalBets` - Sort by total number of bets
- `totalBetAmount` - Sort by total bet amount
- `totalWinAmount` - Sort by total win amount
- `totalLossAmount` - Sort by total loss amount
- `totalPlayers` - Sort by total unique players
- `winRate` - Sort by win rate percentage

### 2. GET /api/game-stats/:gameId

**Description:** Retrieves statistics for a specific game by ID.

**URL:** `GET /api/game-stats/{gameId}`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `gameId` - The ID of the game to get statistics for

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Game-wise statistics retrieved successfully",
  "data": [
    {
      "gameId": 1,
      "gameName": "Slot Machine Deluxe",
      "gameLogo": "https://example.com/logo.png",
      "gameUrl": "https://game.example.com/slot",
      "gameStatus": "active",
      "categoryId": 5,
      "categoryTitle": "Slot Games",
      "categoryImgUrl": "https://example.com/category.png",
      "providerId": 3,
      "providerName": "GameCorp",
      "providerLogo": "https://example.com/provider.png",
      "providerCountry": "Malta",
      
      "totalBets": 1250,
      "totalBetAmount": 125000.50,
      "totalWinAmount": 75000.25,
      "totalLossAmount": 50000.25,
      "totalPendingBets": 25,
      "totalPlayersPlayed": 450,
      "winRate": 60.0,
      "averageBetAmount": 100.00,
      "totalProfit": 25000.00,
      
      "lastBetPlaced": "2024-01-15T10:30:00Z",
      "lastWinAmount": 500.00,
      "lastLossAmount": 200.00,
      
      "uniquePlayersToday": 45,
      "uniquePlayersThisWeek": 180,
      "uniquePlayersThisMonth": 450
    }
  ],
  "summary": {
    "totalGames": 25,
    "totalBets": 31250,
    "totalBetAmount": 3125000.00,
    "totalWinAmount": 1875000.00,
    "totalLossAmount": 1250000.00,
    "totalPendingBets": 625,
    "totalPlayersPlayed": 2500,
    "overallWinRate": 58.5
  },
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "filters": {
    "dateFrom": null,
    "dateTo": null,
    "gameId": null,
    "gameName": null,
    "providerId": null,
    "categoryId": null,
    "status": null,
    "sortBy": "totalBets",
    "sortOrder": "desc"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid dateFrom parameter"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to fetch game-wise statistics",
  "error": "Error message details"
}
```

## Data Fields Explanation

### Game Information

| Field | Description | Source |
|-------|-------------|---------|
| `gameId` | Unique game identifier | `bet_results.gameId` |
| `gameName` | Name of the game | `bet_results.gameName` |
| `gameLogo` | Game logo URL | `games.gameLogo` |
| `gameUrl` | Game play URL | `games.gameUrl` |
| `gameStatus` | Game status (active/inactive) | `games.status` |

### Category Information

| Field | Description | Source |
|-------|-------------|---------|
| `categoryId` | Game category ID | `games.categoryId` |
| `categoryTitle` | Category name | `dropdown_options.title` |
| `categoryImgUrl` | Category image URL | `dropdown_options.imgUrl` |

### Provider Information

| Field | Description | Source |
|-------|-------------|---------|
| `providerId` | Game provider ID | `games.providerId` |
| `providerName` | Provider name | `game_providers.name` |
| `providerLogo` | Provider logo URL | `game_providers.logo` |
| `providerCountry` | Provider country | `game_providers.country` |

### Betting Statistics

| Field | Description | Calculation |
|-------|-------------|-------------|
| `totalBets` | Total number of bets placed | `COUNT(*)` |
| `totalBetAmount` | Sum of all bet amounts | `SUM(betAmount)` |
| `totalWinAmount` | Sum of all win amounts | `SUM(winAmount)` |
| `totalLossAmount` | Sum of all loss amounts | `SUM(lossAmount)` |
| `totalPendingBets` | Count of pending bets | `COUNT(CASE WHEN betStatus = 'pending' THEN 1 END)` |
| `totalPlayersPlayed` | Unique players who played | `COUNT(DISTINCT userId)` |

### Calculated Metrics

| Field | Description | Calculation |
|-------|-------------|-------------|
| `winRate` | Win rate percentage | `(totalWinAmount / (totalBets - totalPendingBets)) * 100` |
| `averageBetAmount` | Average bet per game | `totalBetAmount / totalBets` |
| `totalProfit` | Net profit/loss | `totalWinAmount - totalLossAmount` |

### Time-based Player Metrics

| Field | Description | Calculation |
|-------|-------------|-------------|
| `uniquePlayersToday` | Players who played today | `COUNT(DISTINCT userId WHERE createdAt >= today)` |
| `uniquePlayersThisWeek` | Players who played this week | `COUNT(DISTINCT userId WHERE createdAt >= week_ago)` |
| `uniquePlayersThisMonth` | Players who played this month | `COUNT(DISTINCT userId WHERE createdAt >= month_ago)` |

## Database Schema Dependencies

The API queries the following tables with LEFT JOINs:

1. **`bet_results`** - Main betting data
2. **`games`** - Game information
3. **`dropdown_options`** - Game categories
4. **`game_providers`** - Game providers

## Usage Examples

### JavaScript/Fetch API

```javascript
const fetchGameStats = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/game-stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Game stats:', data.data);
      console.log('Summary:', data.summary);
    } else {
      console.error('Failed to fetch game stats:', data.message);
    }
  } catch (error) {
    console.error('Error fetching game stats:', error);
  }
};

// Example usage
fetchGameStats({
  limit: 10,
  sortBy: 'totalBetAmount',
  sortOrder: 'desc',
  status: 'active'
});
```

### cURL

```bash
# Get all game stats
curl -X GET \
  "http://localhost:3000/api/game-stats?limit=20&sortBy=totalBets&sortOrder=desc" \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'

# Get stats for specific date range
curl -X GET \
  "http://localhost:3000/api/game-stats?dateFrom=2024-01-01&dateTo=2024-01-31" \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'

# Get stats for specific game
curl -X GET \
  "http://localhost:3000/api/game-stats/123" \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### Axios

```javascript
import axios from 'axios';

const getGameStats = async (filters = {}) => {
  try {
    const response = await axios.get('/api/game-stats', {
      params: filters,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching game stats:', error);
    throw error;
  }
};

// Example usage
const stats = await getGameStats({
  limit: 25,
  offset: 0,
  sortBy: 'winRate',
  sortOrder: 'desc',
  status: 'active'
});
```

## Performance Considerations

- **Efficient Aggregation**: Uses SQL aggregation functions for optimal performance
- **Smart Joins**: LEFT JOINs ensure all games are included even without bet results
- **Indexing**: Ensure proper indexes on `gameId`, `userId`, `createdAt`, and `betStatus`
- **Pagination**: Implemented to handle large datasets efficiently
- **Caching**: Consider caching for frequently accessed statistics

## Security Notes

- **Authentication Required**: All endpoints require valid JWT tokens
- **Input Validation**: Comprehensive parameter validation and sanitization
- **SQL Injection Protection**: Uses parameterized queries via Drizzle ORM
- **Rate Limiting**: Consider implementing rate limiting for heavy usage

## Advanced Filtering Examples

### Filter by Date Range
```
GET /api/game-stats?dateFrom=2024-01-01&dateTo=2024-01-31
```

### Filter by Game Provider
```
GET /api/game-stats?providerId=5&status=active
```

### Filter by Category and Sort by Win Rate
```
GET /api/game-stats?categoryId=3&sortBy=winRate&sortOrder=desc&limit=10
```

### Search by Game Name
```
GET /api/game-stats?gameName=slot&limit=20
```

### Get Top Performing Games
```
GET /api/game-stats?sortBy=totalBetAmount&sortOrder=desc&limit=10&status=active
```

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live statistics
- **Export Functionality**: CSV/Excel export of game statistics
- **Advanced Analytics**: Trend analysis and forecasting
- **Custom Dashboards**: User-configurable statistics views
- **Historical Comparisons**: Period-over-period analysis
- **Performance Metrics**: Response time and throughput statistics
