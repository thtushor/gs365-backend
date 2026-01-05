# GS365 Environment Setup Guide

## 📋 Overview

This guide covers all environment variables and configuration needed for the GS365 backend.

---

## 🔧 Environment Variables

Create a `.env` file in the root directory of the backend project:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================

# MySQL Connection String
# Format: mysql://username:password@host:port/database
DATABASE_URL=mysql://root:password@localhost:3306/gs365_db

# Alternative format with separate variables (if needed)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gs365_db


# ============================================
# JWT AUTHENTICATION
# ============================================

# JWT Secret Key (MUST be strong and unique in production)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# JWT Token Expiration
# Format: number + unit (s=seconds, m=minutes, h=hours, d=days)
JWT_EXPIRATION=7d


# ============================================
# SERVER CONFIGURATION
# ============================================

# Server Port
PORT=3000

# Node Environment
# Options: development, production, test
NODE_ENV=development


# ============================================
# DEVELOPMENT TOOLS
# ============================================

# Development Token (for testing without login)
# Only use in development! Remove in production!
DEV_TOKEN=dev_token_for_testing_only_remove_in_production


# ============================================
# CORS CONFIGURATION
# ============================================

# Allowed Origins (comma-separated for multiple)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# In production, use specific domains:
# CORS_ORIGIN=https://gamestar365.com,https://admin.gamestar365.com


# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================

# Upload Directory
UPLOAD_DIR=./uploads

# Max File Size (in bytes)
# 5MB = 5242880 bytes
MAX_FILE_SIZE=5242880

# Allowed File Types (comma-separated)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf


# ============================================
# SOCKET.IO CONFIGURATION
# ============================================

# Socket.IO Ping Interval (milliseconds)
SOCKET_PING_INTERVAL=10000

# Socket.IO Ping Timeout (milliseconds)
SOCKET_PING_TIMEOUT=3000


# ============================================
# EMAIL CONFIGURATION (if implemented)
# ============================================

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@gamestar365.com


# ============================================
# PAYMENT GATEWAY CREDENTIALS
# ============================================

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox  # or 'live' for production


# ============================================
# EXTERNAL API KEYS
# ============================================

# Game Provider API Keys (examples)
GAME_PROVIDER_API_KEY=your_game_provider_api_key
GAME_PROVIDER_SECRET=your_game_provider_secret

# Sports Provider API Keys
SPORTS_PROVIDER_API_KEY=your_sports_provider_api_key


# ============================================
# BACKUP CONFIGURATION
# ============================================

# Backup Directory
BACKUP_DIR=./backups

# Backup Schedule (cron format)
# Default: Daily at 2 AM
BACKUP_SCHEDULE=0 2 * * *

# Backup Retention (days)
BACKUP_RETENTION_DAYS=30


# ============================================
# LOGGING CONFIGURATION
# ============================================

# Log Level
# Options: error, warn, info, debug
LOG_LEVEL=info

# Log Directory
LOG_DIR=./logs


# ============================================
# REDIS CONFIGURATION (if using caching)
# ============================================

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0


# ============================================
# RATE LIMITING (if implemented)
# ============================================

# Max requests per window
RATE_LIMIT_MAX=100

# Time window (milliseconds)
RATE_LIMIT_WINDOW=60000


# ============================================
# SECURITY
# ============================================

# Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS=10

# Session Secret
SESSION_SECRET=your_session_secret_key

# Cookie Settings
COOKIE_SECURE=false  # Set to true in production with HTTPS
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax


# ============================================
# FRONTEND URLs (for CORS and redirects)
# ============================================

# Frontend URLs
FRONTEND_URL=http://localhost:5173
ADMIN_CONSOLE_URL=http://localhost:3000

# In production:
# FRONTEND_URL=https://gamestar365.com
# ADMIN_CONSOLE_URL=https://admin.gamestar365.com
```

---

## 🔐 Production Environment Variables

### Critical Changes for Production

1. **Database**
   ```env
   DATABASE_URL=mysql://prod_user:strong_password@prod-db-host:3306/gs365_prod
   ```

2. **JWT Secret**
   ```bash
   # Generate a strong secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   ```env
   JWT_SECRET=<generated_64_byte_hex_string>
   ```

3. **Node Environment**
   ```env
   NODE_ENV=production
   ```

4. **Remove Development Token**
   ```env
   # DEV_TOKEN=  # Comment out or remove entirely
   ```

5. **CORS Origins**
   ```env
   CORS_ORIGIN=https://gamestar365.com,https://admin.gamestar365.com
   ```

6. **Cookie Security**
   ```env
   COOKIE_SECURE=true  # Requires HTTPS
   ```

---

## 🗄️ Database Configuration

### MySQL Setup

1. **Install MySQL 8.0+**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mysql-server
   
   # macOS
   brew install mysql
   
   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE gs365_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Create User**
   ```sql
   CREATE USER 'gs365_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON gs365_db.* TO 'gs365_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Update .env**
   ```env
   DATABASE_URL=mysql://gs365_user:strong_password@localhost:3306/gs365_db
   ```

### Connection Pool Settings

The default connection pool is configured in `src/db/connection.ts`:

```typescript
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,      // Increase for production (10-20)
  queueLimit: 0,           // Unlimited queue
});
```

**Production Recommendations:**
- `connectionLimit`: 10-20 (based on load)
- Monitor connection usage
- Consider read replicas for scaling

---

## 🔑 JWT Configuration

### Token Expiration

Configure token expiration based on security requirements:

```env
# Short-lived tokens (more secure)
JWT_EXPIRATION=1h

# Medium-lived tokens (balanced)
JWT_EXPIRATION=1d

# Long-lived tokens (convenient)
JWT_EXPIRATION=7d
```

### Token Versioning

Players have automatic token invalidation via `tokenVersion`:
- Increments on logout
- Increments on password change
- Invalidates all existing tokens

Admins currently don't have token versioning (can be added if needed).

---

## 📁 File Upload Configuration

### Upload Directory Structure

```
uploads/
├── images/
│   ├── profiles/
│   ├── games/
│   ├── banners/
│   └── kyc/
└── documents/
```

### File Size Limits

```env
# 5MB for images
MAX_FILE_SIZE=5242880

# 10MB for documents
MAX_DOCUMENT_SIZE=10485760
```

### Allowed File Types

```env
# Images only
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Images + PDFs
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

---

## 🔌 Socket.IO Configuration

### Connection Settings

```env
# Ping every 10 seconds
SOCKET_PING_INTERVAL=10000

# Disconnect if no pong within 3 seconds
SOCKET_PING_TIMEOUT=3000
```

### CORS for Socket.IO

Configured in `src/index.ts`:

```typescript
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || "*",
    methods: ["GET", "POST"],
  },
  pingInterval: Number(process.env.SOCKET_PING_INTERVAL) || 10000,
  pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT) || 3000,
  transports: ["websocket", "polling"],
});
```

---

## 📧 Email Configuration (Optional)

If implementing email features:

### Gmail SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password  # Not your regular password!
SMTP_FROM=noreply@gamestar365.com
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASSWORD`

### SendGrid

```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM=noreply@gamestar365.com
```

---

## 💳 Payment Gateway Configuration

### Stripe

```env
# Test keys (development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Live keys (production)
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### PayPal

```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PAYPAL_MODE=sandbox  # or 'live'
```

---

## 🗄️ Backup Configuration

### Automatic Backups

```env
# Backup directory
BACKUP_DIR=./backups

# Cron schedule (daily at 2 AM)
BACKUP_SCHEDULE=0 2 * * *

# Keep backups for 30 days
BACKUP_RETENTION_DAYS=30
```

### Manual Backup

```bash
# Create backup via API
curl -X POST http://localhost:3000/api/database/backup \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or use npm script (if implemented)
npm run backup
```

---

## 🔒 Security Best Practices

### Environment File Security

1. **Never commit .env to Git**
   ```bash
   # .gitignore should include:
   .env
   .env.local
   .env.production
   ```

2. **Use different .env files per environment**
   ```
   .env.development
   .env.staging
   .env.production
   ```

3. **Restrict file permissions**
   ```bash
   chmod 600 .env
   ```

### Secret Management

For production, consider using:
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Cloud Secret Manager**

---

## 🧪 Environment-Specific Configurations

### Development

```env
NODE_ENV=development
DATABASE_URL=mysql://root:password@localhost:3306/gs365_dev
JWT_SECRET=dev_secret_key
DEV_TOKEN=dev_token_123
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
DATABASE_URL=mysql://staging_user:password@staging-db:3306/gs365_staging
JWT_SECRET=staging_secret_key_change_me
LOG_LEVEL=info
```

### Production

```env
NODE_ENV=production
DATABASE_URL=mysql://prod_user:strong_password@prod-db:3306/gs365_prod
JWT_SECRET=<64-byte-hex-string>
LOG_LEVEL=warn
COOKIE_SECURE=true
```

---

## 📊 Performance Tuning

### Database Connection Pool

```typescript
// For high-traffic production
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 20,        // Increase for more concurrent requests
  queueLimit: 0,
  maxIdle: 10,                // Maximum idle connections
  idleTimeout: 60000,         // Close idle connections after 60s
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
```

### Node.js Memory

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify MySQL is running
   - Check firewall rules
   - Verify user permissions

2. **JWT Token Invalid**
   - Ensure `JWT_SECRET` is set
   - Check token expiration
   - Verify token format

3. **File Upload Fails**
   - Check `UPLOAD_DIR` exists and is writable
   - Verify `MAX_FILE_SIZE` is sufficient
   - Check `ALLOWED_FILE_TYPES`

4. **Socket.IO Connection Issues**
   - Verify `CORS_ORIGIN` includes frontend URL
   - Check firewall allows WebSocket connections
   - Verify `SOCKET_PING_INTERVAL` and `SOCKET_PING_TIMEOUT`

---

## 📚 Related Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Complete development guide
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints

---

**Last Updated**: January 2026  
**Version**: 1.0.0
