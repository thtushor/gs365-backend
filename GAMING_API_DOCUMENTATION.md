# Gaming API Documentation

## Overview
This document describes the Gaming API endpoints for managing games, game sessions, and betting results in the Fashion Glory gaming platform.

## Base URL
```
http://localhost:3000/api/games
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Games with Provider Information
**GET** `/games`

Retrieves all active games with their provider information.

**Response:**
```json
{
  "success": true,
  "message": "Games retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Slot Machine Deluxe",
      "status": "active",
      "isFavorite": false,
      "gameLogo": "https://example.com/logo.png",
      "gameUrl": "https://game.example.com/slot",
      "ggrPercent": "5.5",
      "categoryInfo": {
        "id": 1,
        "name": "Slots",
        "label": "Slot Games"
      },
      "providerInfo": {
        "id": 1,
        "name": "Game Provider Inc",
        "apiKey": "provider_api_key"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "provider": {
        "id": 1,
        "name": "Game Provider Inc",
        "logo": "https://example.com/provider-logo.png",
        "status": "active",
        "country": "Malta"
      }
    }
  ],
  "count": 1
}
```

### 2. Get Games by Category
**GET** `/games/category/:category`

Retrieves games filtered by category.

**Parameters:**
- `category` (path): Category name to filter by
- `status` (query, optional): Game status filter (default: "active")

**Response:**
```json
{
  "success": true,
  "message": "Games in category 'Slots' retrieved successfully",
  "data": [...],
  "count": 5
}
```

### 3. Get Favorite Games
**GET** `/games/favorites`

Retrieves all games marked as favorites.

**Response:**
```json
{
  "success": true,
  "message": "Favorite games retrieved successfully",
  "data": [...],
  "count": 3
}
```

### 4. Get Game Statistics
**GET** `/games/:gameId/stats`

Retrieves statistics for a specific game.

**Parameters:**
- `gameId` (path): ID of the game

**Response:**
```json
{
  "success": true,
  "message": "Game statistics retrieved successfully",
  "data": {
    "totalBets": 150,
    "totalBetAmount": 15000.00,
    "totalWins": 45,
    "totalLosses": 105,
    "totalWinAmount": 18000.00,
    "totalLossAmount": 15000.00
  }
}
```

### 5. Play Game (Create Session)
**POST** `/play`

Creates a new game session and validates user balance.

**Authentication:** Required

**Request Body:**
```json
{
  "userId": 123,
  "gameId": 1,
  "betAmount": 100.00,
  "userScore": 1500
}
```

**Note:** IP address and device information are automatically detected from the request headers and do not need to be provided in the request body.

**Response:**
```json
{
  "success": true,
  "message": "Game session created successfully",
  "data": {
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "game_123_1_1704067200000",
    "expiresIn": "1 hour"
  }
}
```

### 6. Verify Game Token
**GET** `/verify/:token`

Verifies a game session token and returns session information.

**Authentication:** Required

**Parameters:**
- `token` (path): JWT session token

**Response:**
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "userId": 123,
    "userScore": 1500,
    "gameId": 1,
    "gameName": "Slot Machine Deluxe",
    "userName": "User",
    "betAmount": 100.00,
    "sessionId": "game_123_1_1704067200000",
    "issuedAt": "2024-01-01T12:00:00.000Z",
    "expiresAt": "2024-01-01T13:00:00.000Z"
  }
}
```

### 7. Update Bet Result
**PUT** `/bet-result`

Updates the result of a bet (win/loss) and creates corresponding transactions.

**Authentication:** Required

**Request Body:**
```json
{
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "betStatus": "win",
  "winAmount": 200.00,
  "gameSessionId": "game_session_123",
  "multiplier": 2.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bet result updated successfully: win",
  "data": {
    "betStatus": "win",
    "winAmount": 200.00,
    "lossAmount": 0,
    "multiplier": 2.0
  }
}
```

### 8. Get User Bet History
**GET** `/user/:userId/bet-history`

Retrieves betting history for a specific user.

**Authentication:** Required

**Parameters:**
- `userId` (path): ID of the user
- `limit` (query, optional): Maximum number of records to return (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Bet history retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "gameId": 1,
      "betAmount": "100.00",
      "betStatus": "win",
      "playingStatus": "completed",
      "winAmount": "200.00",
      "lossAmount": "0.00",
      "multiplier": "2.0000",
      "gameName": "Slot Machine Deluxe",
      "gameProvider": "Game Provider Inc",
      "gameCategory": "Slots",
      "userScore": 1500,
      "userLevel": "intermediate",
      "betPlacedAt": "2024-01-01T12:00:00.000Z",
      "gameCompletedAt": "2024-01-01T12:05:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

## Database Schema

### Bet Results Table
The system uses a comprehensive `bet_results` table to track all betting activities:

```sql
CREATE TABLE bet_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  bet_amount DECIMAL(20,2) NOT NULL,
  bet_status ENUM('win', 'loss', 'pending', 'cancelled') DEFAULT 'pending',
  playing_status ENUM('playing', 'completed', 'abandoned') DEFAULT 'playing',
  
  -- Game session details
  session_token VARCHAR(500) NOT NULL,
  game_session_id VARCHAR(200),
  
  -- Betting details
  win_amount DECIMAL(20,2) DEFAULT 0,
  loss_amount DECIMAL(20,2) DEFAULT 0,
  multiplier DECIMAL(10,4) DEFAULT 1.0000,
  
  -- Game metadata
  game_name VARCHAR(300) NOT NULL,
  game_provider TEXT,
  game_category VARCHAR(200),
  
  -- User context
  user_score INT DEFAULT 0,
  user_level VARCHAR(50) DEFAULT 'beginner',
  
  -- Timing
  bet_placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  game_started_at DATETIME,
  game_completed_at DATETIME,
  
  -- Additional tracking
  ip_address VARCHAR(45),
  device_info TEXT,
  is_mobile BOOLEAN DEFAULT FALSE,
  
  -- Audit fields
  created_by VARCHAR(200),
  updated_by VARCHAR(200),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
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
- `401`: Unauthorized (invalid/missing token)
- `500`: Internal Server Error

## Security Features

1. **JWT Authentication**: All protected endpoints require valid JWT tokens
2. **Token Expiration**: Game session tokens expire after 1 hour
3. **Balance Validation**: System validates user balance before allowing bets
4. **Session Tracking**: Each game session has a unique identifier
5. **Audit Trail**: All betting activities are logged with timestamps

## Integration Notes

1. **Balance System**: Integrates with the existing balance model for transaction management
2. **Transaction Creation**: Automatically creates win/loss transactions when updating bet results
3. **Provider Integration**: Supports game provider information for external integrations
4. **Category System**: Flexible categorization system for organizing games
5. **Statistics**: Built-in analytics for game performance tracking

## Rate Limiting

Consider implementing rate limiting for:
- Game session creation (prevent abuse)
- Token verification (prevent brute force)
- Bet result updates (prevent rapid updates)

## Testing

Use the following test data for development:

```json
{
  "userId": 1,
  "gameId": 1,
  "betAmount": 100.00,
  "userScore": 1000,
  "ipAddress": "127.0.0.1",
  "deviceInfo": "Test Device"
}
```

## Support

For technical support or questions about the Gaming API, please contact the development team.
