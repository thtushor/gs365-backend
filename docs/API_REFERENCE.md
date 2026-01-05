# GS365 API Reference

## 📋 Overview

Complete API reference for the GS365 Gaming Platform backend. All endpoints follow RESTful principles and return JSON responses.

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://api.gamestar365.com/api`

**Swagger Documentation**: `http://localhost:3000/api-docs`

---

## 🔐 Authentication

Most endpoints require JWT authentication via Bearer token.

### Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Response Format

**Success Response:**
```json
{
  "status": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "status": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 📚 API Endpoints by Domain

### 🔑 Authentication & User Management

#### Admin Authentication
- `POST /api/admin/registration` - Register new admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile (protected)

#### Player Authentication
- `POST /api/users/register` - Register new player
- `POST /api/users/login` - Player login
- `POST /api/users/logout` - Player logout
- `GET /api/users/profile` - Get player profile (protected)

#### User Management
- `GET /api/admin/players` - Get all players
- `GET /api/admin/players/:playerID/profile` - Get player details
- `PUT /api/users/update` - Update user
- `DELETE /api/users/delete` - Delete user
- `GET /api/admin/admins` - Get all admins
- `GET /api/admin/agents` - Get all agents
- `GET /api/admin/affiliates` - Get all affiliates

**See**: [BALANCE_API_DOCUMENTATION.md](./BALANCE_API_DOCUMENTATION.md)

---

### 💰 Balance & Transactions

#### Balance Endpoints
- `GET /api/balance/player/:userId` - Get player balance
- `GET /api/balance/player/:userId/summary` - Get balance summary
- `GET /api/balance/player/:userId/currency/:currencyId` - Currency-specific balance
- `GET /api/balance/my-balance` - Get my balance (protected)
- `GET /api/balance/all` - Get all balances

#### Transaction Endpoints
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions/deposit` - Create deposit
- `POST /api/transactions/withdraw` - Create withdrawal
- `POST /api/transactions/affiliate-withdraw` - Affiliate withdrawal
- `PUT /api/transactions/update-status` - Update transaction status
- `GET /api/transactions/:id` - Get transaction details

**See**: [TRANSACTION_API.md](./TRANSACTION_API.md)

---

### 🎮 Gaming System

#### Game Management
- `GET /api/games/games` - Get all games
- `GET /api/games/category/:category` - Get games by category
- `GET /api/games/favorites` - Get favorite games
- `POST /api/games/favorites/add` - Add favorite
- `DELETE /api/games/favorites/remove` - Remove favorite
- `GET /api/games/:gameId/stats` - Get game statistics

#### Game Sessions
- `POST /api/games/play` - Create game session
- `GET /api/games/verify/:token` - Verify session token
- `PUT /api/games/bet-result` - Update bet result

#### Bet Results
- `GET /api/bet-results` - Get all bet results
- `GET /api/bet-results/user/:userId` - Get user bet history
- `GET /api/bet-results/rankings/players` - Get player rankings

**See**: [GAMING_SYSTEM_README.md](./GAMING_SYSTEM_README.md), [BET_RESULTS_API_DOCUMENTATION.md](./BET_RESULTS_API_DOCUMENTATION.md), [GAME_STATS_API_DOCUMENTATION.md](./GAME_STATS_API_DOCUMENTATION.md)

---

### 💳 Payment System

#### Payment Methods
- `GET /api/payment-method` - Get all payment methods
- `POST /api/payment-method` - Create payment method
- `PUT /api/payment-method/update` - Update payment method
- `DELETE /api/payment-method/delete` - Delete payment method

#### Payment Method Types
- `GET /api/payment-method-types` - Get all types
- `POST /api/payment-method-types` - Create type
- `PUT /api/payment-method-types/update` - Update type
- `DELETE /api/payment-method-types/delete` - Delete type

#### Payment Gateways
- `GET /api/payment-gateways` - Get all gateways
- `POST /api/payment-gateways` - Create gateway
- `PUT /api/payment-gateways/update` - Update gateway
- `DELETE /api/payment-gateways/delete` - Delete gateway

#### Payment Providers
- `GET /api/payment-providers` - Get all providers
- `POST /api/payment-providers` - Create provider
- `PUT /api/payment-providers/update` - Update provider
- `DELETE /api/payment-providers/delete` - Delete provider

#### Gateway Providers
- `GET /api/gateway-providers` - Get all gateway-provider links
- `GET /api/gateway-providers/gateway/:id` - Get by gateway
- `GET /api/gateway-providers/provider/:id` - Get by provider
- `POST /api/gateway-providers` - Link gateway to provider
- `PUT /api/gateway-providers/:id` - Update priority/status
- `DELETE /api/gateway-providers/delete-provider-from-gateway` - Unlink

#### Gateway Provider Accounts
- `GET /api/gateway-provider-accounts` - Get all accounts
- `GET /api/gateway-provider-accounts/provider/:id` - Get by provider
- `POST /api/gateway-provider-accounts` - Create account
- `PUT /api/gateway-provider-accounts/:id` - Update account
- `DELETE /api/gateway-provider-accounts/:id` - Delete account

#### Withdrawal Payment Accounts
- `GET /api/withdrawal-payment-accounts` - Get all accounts
- `GET /api/withdrawal-payment-accounts/user/:userId` - Get user accounts
- `POST /api/withdrawal-payment-accounts` - Create account
- `PUT /api/withdrawal-payment-accounts/:id` - Update account
- `DELETE /api/withdrawal-payment-accounts/:id` - Delete account
- `PUT /api/withdrawal-payment-accounts/:id/set-primary` - Set as primary
- `PUT /api/withdrawal-payment-accounts/:id/verify` - Verify account

**See**: [WITHDRAWAL_PAYMENT_ACCOUNT_API_DOCUMENTATION.md](./WITHDRAWAL_PAYMENT_ACCOUNT_API_DOCUMENTATION.md), [WITHDRAW_API_DOCUMENTATION.md](./WITHDRAW_API_DOCUMENTATION.md)

---

### 🌍 Localization

#### Countries
- `GET /api/countries` - Get all countries
- `POST /api/countries/update-country-status` - Update country status

#### Currencies
- `GET /api/countries/currencies` - Get all currencies
- `POST /api/admin/currency-rate` - Create/update conversion rate
- `GET /api/admin/currency-rate` - Get conversion rates
- `DELETE /api/admin/delete-currency/:id` - Delete conversion

#### Languages
- `GET /api/countries/languages` - Get all languages
- `POST /api/countries/update-language-status` - Update language status

#### Country-Language Assignment
- `POST /api/countries/assign-country-languages` - Assign language to country
- `POST /api/countries/update-country-language` - Update assignment

---

### 📊 Dashboard & Analytics

#### Dashboard
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/dashboard/revenue` - Revenue statistics
- `GET /api/dashboard/users` - User statistics

#### Game Statistics
- `GET /api/game-stats` - Get game statistics
- `GET /api/game-stats/popular` - Popular games
- `GET /api/game-stats/revenue` - Game revenue

#### Commission
- `GET /api/commissions` - Get all commissions
- `GET /api/commissions/total-commission` - Get total commission
- `GET /api/commissions/affiliate/:id` - Get affiliate commissions

**See**: [DASHBOARD_API_DOCUMENTATION.md](./DASHBOARD_API_DOCUMENTATION.md), [GAME_STATS_API_DOCUMENTATION.md](./GAME_STATS_API_DOCUMENTATION.md)

---

### ⚙️ Settings & Configuration

#### System Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/update` - Update settings

**See**: [SETTINGS_API_INTEGRATION_GUIDE.md](./SETTINGS_API_INTEGRATION_GUIDE.md)

#### Dropdowns
- `GET /api/admin/get-dropdowns` - Get all dropdowns
- `POST /api/admin/create-dropdowns` - Create/update dropdown
- `PUT /api/admin/update-dropdown-option-status` - Update option status
- `DELETE /api/admin/dropdown/:id` - Delete dropdown option

#### Designations (Roles/Permissions)
- `GET /api/designations` - Get all designations
- `POST /api/designations` - Create designation
- `PUT /api/designations/:id` - Update designation
- `DELETE /api/designations/:id` - Delete designation

#### Menu Management
- `GET /api/admin/menu-list` - Get all menus
- `PUT /api/admin/update-menu-priority` - Update menu priority

---

### 📢 CMS & Content

#### Promotions
- `GET /api/admin/promotions` - Get all promotions
- `GET /api/public/promotions` - Get public promotions
- `POST /api/admin/promotion` - Create promotion
- `PUT /api/admin/promotion/:id` - Update promotion

#### Banners
- `GET /api/admin/get-banner` - Get all banners
- `POST /api/admin/banner` - Create/update banner

#### Events
- `GET /api/admin/events` - Get all events
- `POST /api/admin/event` - Create/update event

#### Announcements
- `GET /api/admin/get-announcements` - Get all announcements
- `POST /api/admin/announcement` - Create/update announcement
- `DELETE /api/admin/delete-announcement/:id` - Delete announcement

#### Social Media
- `GET /api/admin/social-media` - Get social media links
- `POST /api/admin/social-media` - Create/update social link

#### Featured Games
- `GET /api/admin/featured-games` - Get featured games
- `POST /api/admin/featured-games` - Create/update featured game

#### FAQs
- `GET /api/admin/get-faqs` - Get all FAQs
- `POST /api/admin/create-update-faq` - Create/update FAQ
- `DELETE /api/admin/delete-faq/:id` - Delete FAQ

---

### 💬 Communication

#### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id` - Get chat details

#### Messages
- `GET /api/messages/chat/:chatId` - Get chat messages
- `POST /api/messages/send-message` - Send message
- `PUT /api/messages/read/:chatId` - Mark messages as read
- `GET /api/messages/user-admin/:userId` - Get user-admin messages

#### Auto Replies
- `GET /api/auto-replies` - Get all auto replies
- `POST /api/auto-replies` - Create auto reply
- `PUT /api/auto-replies/:id` - Update auto reply
- `DELETE /api/auto-replies/:id` - Delete auto reply

#### Notifications
- `GET /api/admin/notifications` - Get all notifications
- `POST /api/admin/notifications` - Create notification
- `PUT /api/admin/:id/status` - Update notification status

---

### 📱 User Phones

- `GET /api/user-phones/user/:userId` - Get user phones
- `POST /api/user-phones` - Add phone number
- `PUT /api/user-phones/update` - Update phone
- `DELETE /api/user-phones/delete` - Delete phone

---

### 🔍 KYC Verification

- `GET /api/admin/kyc` - Get all KYC submissions
- `POST /api/admin/create-update-kyc` - Submit KYC
- `PUT /api/admin/update-kyc-status` - Update KYC status
- `POST /api/admin/send-kyc-verification-request` - Request KYC

---

### 📈 Turnover

- `GET /api/turnover` - Get turnover data
- `GET /api/turnover/user/:userId` - Get user turnover

---

### 🗄️ Database Management

- `POST /api/database/backup` - Create database backup
- `POST /api/database/restore` - Restore database
- `GET /api/database/backup-files` - List backup files
- `GET /api/database/download-backup/:filename` - Download backup
- `DELETE /api/database/delete-backup/:filename` - Delete backup
- `DELETE /api/database/drop-all-tables` - Drop all tables (dangerous!)

---

### 📊 Admin Main Balance

- `GET /api/admin-main-balance` - Get admin balance history
- `POST /api/admin-main-balance` - Add balance transaction

**See**: [ADMIN_MAIN_BALANCE_API_DOCUMENTATION.md](./ADMIN_MAIN_BALANCE_API_DOCUMENTATION.md)

---

### 📜 User Login History

- `GET /api/user-login-history/user/:playerId` - Get player login history

---

## 🔌 WebSocket Events (Socket.IO)

### Client → Server Events

#### `joinChat`
Join a chat room.
```javascript
socket.emit('joinChat', chatId);
```

#### `sendMessage`
Send a message.
```javascript
socket.emit('sendMessage', {
  chatId: '123',
  senderId: '456',
  message: 'Hello!'
});
```

#### `loggedin-user`
Notify server of user login (forces logout on other devices).
```javascript
socket.emit('loggedin-user', {
  id: 123,
  token: 'jwt_token_here'
});
```

### Server → Client Events

#### `newMessage`
Receive new message.
```javascript
socket.on('newMessage', (data) => {
  console.log('New message:', data);
});
```

#### `logout-user-{userId}`
Force logout notification.
```javascript
socket.on(`logout-user-${userId}`, (data) => {
  // Logout user
});
```

---

## 📝 Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=active
?type=deposit
?currencyId=1
```

### Search
```
?searchKey=john
?search=transaction
```

### Date Range
```
?startDate=2024-01-01
?endDate=2024-12-31
```

### Sorting
```
?sortBy=created_at
?sortOrder=desc
```

---

## 🔒 Authorization Levels

### Public Endpoints
No authentication required:
- `/api/public/*`
- `/api/balance/player/:userId`
- Login/registration endpoints

### Protected Endpoints
Require JWT token:
- `/api/users/profile`
- `/api/balance/my-balance`
- Most admin endpoints

### Admin Only
Require admin role:
- `/api/admin/*`
- CMS endpoints
- System settings

### Role-Based Access
Specific roles required:
- **superAdmin**: Full access
- **admin**: Most admin functions
- **agent**: Limited admin functions
- **affiliate**: Commission and referral management

---

## 📊 Rate Limiting

Currently no rate limiting implemented. Consider adding for production:
- Login attempts: 5 per 15 minutes
- API calls: 100 per minute per IP
- File uploads: 10 per hour

---

## 🔧 Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Internal Server Error |

---

## 📚 Related Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Complete development guide
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration
- [GAMING_SYSTEM_README.md](./GAMING_SYSTEM_README.md) - Gaming system details
- [BALANCE_API_DOCUMENTATION.md](./BALANCE_API_DOCUMENTATION.md) - Balance API
- [TRANSACTION_API.md](./TRANSACTION_API.md) - Transaction API
- [SETTINGS_API_INTEGRATION_GUIDE.md](./SETTINGS_API_INTEGRATION_GUIDE.md) - Settings API

---

**Last Updated**: January 2026  
**API Version**: 1.0.0  
**Swagger Docs**: http://localhost:3000/api-docs
