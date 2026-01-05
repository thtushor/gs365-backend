# Dashboard API Documentation

## Overview
The Dashboard API provides aggregated statistics and metrics for the gaming platform's administrative dashboard. This endpoint consolidates data from multiple database tables into a single response for efficient dashboard rendering.

## Endpoint

### GET /api/dashboard

**Description:** Retrieves comprehensive dashboard statistics including financial metrics, user counts, betting statistics, and system information.

**URL:** `GET /api/dashboard`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
         "mainBalance": "1000000.00",
     
     "totalWin": "75000.00",
     "totalLoss": "25000.00",
    
    "totalDeposit": "200000.00",
    "totalWithdraw": "150000.00",
    
    "pendingDeposit": "5000.00",
    "pendingWithdraw": "3000.00",
    
    "totalBonusCoin": "10000.00",
    
    "totalAffiliate": 25,
    "totalAgent": 15,
    
    "totalPlayers": 1000,
    "totalOnlinePlayers": 150,
    
    "totalBetPlaced": "500000.00",
    "totalBetWin": "300000.00",
    "totalBetLost": "200000.00",
    
    "totalGameProvidersPayment": 0,
    "totalSportsProvidersPayment": 0,
    "gameProviderPendingPayment": 0,
    "sportsProviderPendingPayment": 0,
    
    "totalGames": 500
  }
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to fetch dashboard statistics",
  "error": "Error message details"
}
```

## Data Fields Explanation

### Financial Metrics

| Field | Description | Source Table | Calculation |
|-------|-------------|--------------|-------------|
| `mainBalance` | Admin balance from settings | `settings` | `adminBalance` field |
| `totalWin` | Total win amounts | `transactions` | Sum of amounts where `type = 'win'` |
| `totalLoss` | Total loss amounts | `transactions` | Sum of amounts where `type = 'loss'` |

### Transaction Statistics

| Field | Description | Source Table | Calculation |
|-------|-------------|--------------|-------------|
| `totalDeposit` | Total deposit amounts | `transactions` | Sum of amounts where `type = 'deposit'` |
| `totalWithdraw` | Total withdrawal amounts | `transactions` | Sum of amounts where `type = 'withdraw'` |
| `pendingDeposit` | Pending deposit amounts | `transactions` | Sum where `type = 'deposit'` AND `status = 'pending'` |
| `pendingWithdraw` | Pending withdrawal amounts | `transactions` | Sum where `type = 'withdraw'` AND `status = 'pending'` |
| `totalBonusCoin` | Total bonus coin amounts | `transactions` | Sum where `promotion_id IS NOT NULL` |

### User Statistics

| Field | Description | Source Table | Calculation |
|-------|-------------|--------------|-------------|
| `totalAffiliate` | Count of affiliate users | `admin_users` | Count where `role IN ('affiliate', 'superAffiliate')` |
| `totalAgent` | Count of agent users | `admin_users` | Count where `role IN ('agent', 'superAgent')` |
| `totalPlayers` | Total registered players | `users` | Count all records |
| `totalOnlinePlayers` | Currently online players | `users` | Count where `isLoggedIn = true` |

### Betting Statistics

| Field | Description | Source Table | Calculation |
|-------|-------------|--------------|-------------|
| `totalBetPlaced` | Total bet amounts placed | `bet_results` | Sum of `betAmount` |
| `totalBetWin` | Total bet wins | `bet_results` | Sum of `winAmount` |
| `totalBetLost` | Total bet losses | `bet_results` | Sum of `lossAmount` |

### System Information

| Field | Description | Source Table | Calculation |
|-------|-------------|--------------|-------------|
| `totalGames` | Total available games | `games` | Count all records |
| `totalGameProvidersPayment` | Game provider payments | Static | Currently set to 0 |
| `totalSportsProvidersPayment` | Sports provider payments | Static | Currently set to 0 |
| `gameProviderPendingPayment` | Pending game provider payments | Static | Currently set to 0 |
| `sportsProviderPendingPayment` | Pending sports provider payments | Static | Currently set to 0 |

## Database Schema Dependencies

The dashboard endpoint queries the following database tables:

1. **`settings`** - Admin balance information
2. **`transactions`** - Financial transaction data
3. **`admin_users`** - Affiliate and agent user data
4. **`users`** - Player user data
5. **`bet_results`** - Betting outcome data
6. **`games`** - Game catalog information

## Usage Examples

### JavaScript/Fetch API

```javascript
const fetchDashboardStats = async () => {
  try {
    const response = await fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Dashboard stats:', data.data);
      // Update your dashboard UI with data.data
    } else {
      console.error('Failed to fetch dashboard stats:', data.message);
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
};
```

### cURL

```bash
curl -X GET \
  http://localhost:3000/api/dashboard \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### Axios

```javascript
import axios from 'axios';

const getDashboardStats = async () => {
  try {
    const response = await axios.get('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
```

## Performance Considerations

- The endpoint performs multiple database queries with aggregation functions
- Consider implementing caching for dashboard data if real-time updates are not critical
- Monitor query performance on large datasets
- Consider pagination or time-based filtering for historical data if needed

## Security Notes

- Endpoint requires valid JWT authentication
- Only authenticated users can access dashboard statistics
- Consider implementing role-based access control for sensitive financial data
- Audit logging should be implemented for dashboard access

## Future Enhancements

- Real-time updates using WebSocket connections
- Time-based filtering (daily, weekly, monthly statistics)
- Export functionality for dashboard data
- Customizable dashboard widgets
- Historical trend analysis
- Provider payment integration for dynamic values
