# GS365 Backend Developer Guide

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [API Development](#api-development)
- [Authentication & Authorization](#authentication--authorization)
- [Real-time Features](#real-time-features)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

**GS365 (GameStar365)** is a comprehensive gaming platform backend built with Node.js and TypeScript. It provides a robust API for managing users, games, transactions, betting, payments, and real-time communication.

### Key Features

- 🎮 **Gaming System**: Game management, betting, results tracking
- 💰 **Financial Management**: Deposits, withdrawals, balance calculation
- 👥 **User Management**: Players, agents, affiliates, admin users
- 💳 **Payment Integration**: Multiple payment gateways and providers
- 🌍 **Multi-currency & Multi-language**: International support
- 💬 **Real-time Chat**: Socket.IO-based messaging
- 📊 **Analytics & Reporting**: Dashboard, statistics, rankings
- 🔐 **Security**: JWT authentication, role-based access control

---

## 🛠 Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 16+ | Runtime environment |
| **TypeScript** | 5.9.2 | Type-safe development |
| **Express** | 5.1.0 | Web framework |
| **MySQL** | 8.0+ | Relational database |
| **Drizzle ORM** | 0.44.4 | Type-safe ORM |
| **Socket.IO** | 4.8.1 | Real-time communication |

### Key Dependencies

```json
{
  "express": "^5.1.0",           // Web framework
  "drizzle-orm": "^0.44.4",      // ORM
  "mysql2": "^3.14.1",           // MySQL driver
  "jsonwebtoken": "^9.0.2",      // JWT authentication
  "bcryptjs": "^3.0.2",          // Password hashing
  "socket.io": "^4.8.1",         // WebSocket
  "zod": "^4.1.5",               // Schema validation
  "multer": "^2.0.2",            // File uploads
  "node-cron": "^4.2.1",         // Scheduled tasks
  "swagger-jsdoc": "^6.2.8",     // API documentation
  "swagger-ui-express": "^5.0.1" // Swagger UI
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **MySQL**: v8.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gs365-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=mysql://user:password@localhost:3306/gs365_db
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Development Token (optional)
   DEV_TOKEN=your_dev_token_for_testing
   ```

4. **Set up the database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE gs365_db;"
   
   # Generate migrations
   npm run drizzle:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Verify installation**
   - Server: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs
   - Test endpoint: http://localhost:3000/

---

## 🏗 Architecture

### Project Structure

```
gs365-backend/
├── src/
│   ├── controllers/      # Request handlers (28 controllers)
│   ├── models/           # Business logic (24 models)
│   ├── routes/           # API routes (28 route files)
│   ├── db/
│   │   ├── schema/       # Database schemas (37 tables)
│   │   ├── seed-fn/      # Seed functions
│   │   ├── connection.ts # Database connection
│   │   └── seeder.ts     # Data seeder
│   ├── middlewares/      # Custom middleware
│   │   ├── verifyToken.ts
│   │   └── errorHandler.ts
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts
│   │   ├── asyncHandler.ts
│   │   ├── refCode.ts
│   │   └── swagger.ts
│   ├── types/            # TypeScript type definitions
│   ├── socket.ts         # Socket.IO setup
│   └── index.ts          # Application entry point
├── backups/              # Database backups
├── drizzle/              # Drizzle migrations
├── test-*.js             # API test scripts
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

### Architectural Pattern: MVC + Services

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Routes    │  ← Define API endpoints
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controllers │  ← Handle HTTP requests/responses
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Models    │  ← Business logic & data operations
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  ← MySQL with Drizzle ORM
└─────────────┘
```

### Layer Responsibilities

1. **Routes** (`src/routes/`)
   - Define API endpoints
   - Apply middleware (authentication, validation)
   - Map endpoints to controllers

2. **Controllers** (`src/controllers/`)
   - Handle HTTP requests and responses
   - Validate request data
   - Call model functions
   - Format responses
   - Error handling

3. **Models** (`src/models/`)
   - Business logic
   - Database queries using Drizzle ORM
   - Data transformation
   - Complex operations

4. **Middleware** (`src/middlewares/`)
   - Authentication (JWT verification)
   - Error handling
   - Request logging

---

## 🗄 Database Design

### Database Schema Overview

The system uses **37 tables** organized into logical domains:

#### Core Tables

**User Management**
- `users` - Player accounts
- `admin_users` - Admin, agent, affiliate accounts
- `user_login_history` - Login tracking
- `user_phones` - Phone number management
- `users_token` - Token management
- `kyc` - KYC verification

**Gaming**
- `games` - Game catalog
- `game_providers` - Game providers
- `bet_results` - Betting history and results
- `user_favorites` - User favorite games
- `sports` - Sports catalog
- `sports_providers` - Sports providers

**Financial**
- `transactions` - All financial transactions
- `commission` - Commission tracking
- `turnover` - Turnover requirements
- `admin_main_balance` - Admin balance management
- `withdrawal_payment_accounts` - Withdrawal accounts

**Payment System**
- `payment_methods` - Payment methods
- `payment_method_types` - Payment types
- `payment_gateways` - Payment gateways
- `payment_providers` - Payment providers
- `payment_gateway_providers` - Gateway-provider mapping
- `payment_gateway_provider_accounts` - Provider accounts

**Localization**
- `countries` - Country list
- `currencies` - Currency list
- `languages` - Language list
- `country_languages` - Country-language mapping
- `currency_conversion` - Exchange rates

**CMS & Configuration**
- `promotions` - Promotional campaigns
- `banners` - Banner management
- `events` - Event management
- `announcements` - Announcements
- `social_media` - Social media links
- `featured_games` - Featured games
- `dropdowns` - Dropdown configurations
- `dropdown_options` - Dropdown options
- `settings` - System settings
- `designation` - User designations/roles

**Communication**
- `chats` - Chat rooms
- `messages` - Chat messages
- `auto_replies` - Auto-reply templates
- `notifications` - User notifications

### Key Relationships

```mermaid
graph TD
    users -->|has many| transactions
    users -->|has many| bet_results
    users -->|belongs to| currencies
    admin_users -->|creates| users
    admin_users -->|processes| transactions
    transactions -->|belongs to| payment_gateway_provider_accounts
    transactions -->|belongs to| promotions
    bet_results -->|belongs to| games
    games -->|belongs to| game_providers
```

### Database Connection

```typescript
// src/db/connection.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

const db = drizzle(pool, { schema, mode: "default" });

export { pool, db };
```

### Schema Example

```typescript
// src/db/schema/users.ts
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).unique(),
  fullname: varchar("fullname", { length: 100 }),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  currency_id: int("currency_id"),
  status: ActivityStatus,
  isVerified: boolean("is_verified").default(false),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  // ... more fields
});

export const usersRelations = relations(users, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [users.currency_id],
    references: [currencies.id],
  }),
  chats: many(chats),
}));
```

---

## 🔌 API Development

### Creating a New API Endpoint

#### 1. Define the Schema (if needed)

```typescript
// src/db/schema/example.ts
import { mysqlTable, int, varchar, datetime } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const examples = mysqlTable("examples", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
```

#### 2. Create the Model

```typescript
// src/models/example.model.ts
import { db } from "../db/connection";
import { examples } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getAllExamples() {
  return await db.select().from(examples);
}

export async function getExampleById(id: number) {
  const [example] = await db
    .select()
    .from(examples)
    .where(eq(examples.id, id))
    .limit(1);
  return example;
}

export async function createExample(data: { name: string; description?: string }) {
  const [result] = await db.insert(examples).values(data);
  return result;
}

export async function updateExample(id: number, data: Partial<typeof examples.$inferInsert>) {
  await db.update(examples).set(data).where(eq(examples.id, id));
}

export async function deleteExample(id: number) {
  await db.delete(examples).where(eq(examples.id, id));
}
```

#### 3. Create the Controller

```typescript
// src/controllers/example.controller.ts
import { Request, Response } from "express";
import {
  getAllExamples,
  getExampleById,
  createExample,
  updateExample,
  deleteExample,
} from "../models/example.model";

export async function getExamples(req: Request, res: Response) {
  try {
    const examples = await getAllExamples();
    res.json({
      status: true,
      data: examples,
      message: "Examples retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve examples",
      error: error.message,
    });
  }
}

export async function getExample(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const example = await getExampleById(Number(id));
    
    if (!example) {
      return res.status(404).json({
        status: false,
        message: "Example not found",
      });
    }
    
    res.json({
      status: true,
      data: example,
      message: "Example retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve example",
      error: error.message,
    });
  }
}

export async function createExampleController(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: false,
        message: "Name is required",
      });
    }
    
    const result = await createExample({ name, description });
    
    res.status(201).json({
      status: true,
      data: result,
      message: "Example created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to create example",
      error: error.message,
    });
  }
}
```

#### 4. Create the Route

```typescript
// src/routes/example.route.ts
import { Router } from "express";
import {
  getExamples,
  getExample,
  createExampleController,
} from "../controllers/example.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes
router.get("/", getExamples);
router.get("/:id", getExample);

// Protected routes
router.post("/", verifyToken, createExampleController);

export default router;
```

#### 5. Register the Route

```typescript
// src/index.ts
import exampleRouter from "./routes/example.route";

// ... other imports

app.use("/api/examples", exampleRouter);
```

### API Response Format

All API responses follow a consistent format:

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

## 🔐 Authentication & Authorization

### JWT-Based Authentication

The system uses JWT (JSON Web Tokens) for authentication with two user types:

1. **Admin Users** (admin_users table)
   - Roles: superAdmin, admin, superAgent, agent, superAffiliate, affiliate
   
2. **Players** (users table)
   - Role: player

### Token Generation

```typescript
// src/utils/jwt.ts
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  email: string;
  username: string;
  role?: string;
  userType: "user" | "admin";
  tokenVersion?: number;
}

export function generateJwtToken(
  payload: JwtPayload,
  expiresIn: string | number = "1D"
): string {
  return jwt.sign(
    { ...payload },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn }
  );
}

export function verifyJwt(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
}
```

### Token Verification Middleware

```typescript
// src/middlewares/verifyToken.ts
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyJwt(token) as DecodedUser;
    
    // Verify user exists and token version matches
    if (decoded.userType === "user") {
      const [player] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1);
        
      if (!player || player.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({
          status: false,
          message: "Session expired. Please log in again."
        });
      }
    }
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
}
```

### Login Flow

```typescript
// Admin Login Example
export async function adminLogin(req: Request, res: Response) {
  const { username, password } = req.body;
  
  // 1. Find admin by username/email
  const admin = await findAdminByUsernameOrEmail(username);
  
  if (!admin) {
    return res.status(401).json({
      status: false,
      message: "Invalid credentials"
    });
  }
  
  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      status: false,
      message: "Invalid credentials"
    });
  }
  
  // 3. Generate JWT token
  const token = generateJwtToken({
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: admin.role,
    userType: "admin"
  }, "7d");
  
  // 4. Update login status
  await updateAdmin(admin.id, {
    isLoggedIn: true,
    lastLogin: new Date(),
    lastIp: getClientIp(req)
  });
  
  // 5. Return token and user data
  res.json({
    status: true,
    data: {
      token,
      user: { /* sanitized user data */ }
    },
    message: "Login successful"
  });
}
```

### Token Versioning (Players Only)

Players have a `tokenVersion` field that increments on logout or password change, invalidating all existing tokens:

```typescript
// Logout - increment token version
await db
  .update(users)
  .set({
    tokenVersion: sql`${users.tokenVersion} + 1`,
    isLoggedIn: false
  })
  .where(eq(users.id, userId));
```

### Development Token

For development/testing, a static DEV_TOKEN can be used:

```env
DEV_TOKEN=your_dev_token_here
```

```typescript
if (token === process.env.DEV_TOKEN) {
  (req as any).user = {
    id: 0,
    email: "dev@example.com",
    username: "dev_admin",
    role: "admin",
    tokenVersion: 0,
  };
  next();
  return;
}
```

---

## 🔄 Real-time Features

### Socket.IO Implementation

The system uses Socket.IO for real-time communication, primarily for chat functionality.

#### Setup

```typescript
// src/index.ts
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 3000,
  transports: ["websocket", "polling"],
});

setupSocketIO(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Socket Events

```typescript
// src/socket.ts
export function setupSocketIO(io: Server) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join chat room
    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Handle user login (force logout other sessions)
    socket.on("loggedin-user", (data: { id: number; token: string }) => {
      socket.broadcast.emit(`logout-user-${data.id}`, data);
    });

    // Send message
    socket.on("sendMessage", (data) => {
      socket.broadcast.emit("newMessage", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
```

#### Emitting Events from Controllers

```typescript
// src/controllers/message.controller.ts
import { io } from "..";

export async function sendMessage(req: Request, res: Response) {
  // ... save message to database
  
  // Emit real-time event
  io.emit("newMessage", {
    chatId: message.chatId,
    senderId: message.senderId,
    message: message.content,
  });
  
  res.json({ status: true, data: message });
}
```

---

## 💻 Development Workflow

### Running the Development Server

```bash
# Start with nodemon (auto-reload)
npm run dev

# Start without auto-reload
npm start

# Build TypeScript
npm run build
```

### Database Operations

```bash
# Generate Drizzle migrations
npm run drizzle:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### Code Organization Best Practices

1. **One controller per resource**
   - `user.controller.ts` handles all user-related endpoints
   - `transaction.controller.ts` handles all transaction endpoints

2. **Models contain business logic**
   - Database queries
   - Data validation
   - Complex calculations

3. **Controllers handle HTTP**
   - Request/response formatting
   - Error handling
   - Calling model functions

4. **Middleware for cross-cutting concerns**
   - Authentication
   - Logging
   - Error handling

### Environment Variables

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/gs365_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=3000
NODE_ENV=development

# Development
DEV_TOKEN=your_dev_token_for_testing
```

---

## 🧪 Testing

### API Testing Scripts

The project includes test scripts for major features:

```bash
# Test gaming API
node test-gaming-api.js

# Test bet results API
node test-bet-results-api.js

# Test dashboard API
node test-dashboard-api.js

# Test game stats API
node test-game-stats-api.js

# Test withdraw API
node test-withdraw-api.js
```

### Manual API Testing

Use tools like:
- **Postman**: Import endpoints from Swagger
- **cURL**: Command-line testing
- **Swagger UI**: http://localhost:3000/api-docs

### Example cURL Request

```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Get users (authenticated)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Deployment

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Environment Configuration

Set `NODE_ENV=production` and configure production database:

```env
NODE_ENV=production
DATABASE_URL=mysql://prod_user:prod_pass@prod_host:3306/prod_db
JWT_SECRET=production_secret_key_very_long_and_secure
PORT=3000
```

### Database Backup

The system includes automatic backup functionality:

```typescript
// Scheduled daily backups
import { scheduleAutoBackup } from "./controllers/backupRestore.controller";

scheduleAutoBackup(); // Runs daily at configured time
```

### Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure CORS properly
   - Use environment variables for secrets

2. **Performance**
   - Increase database connection pool
   - Enable caching (Redis recommended)
   - Use CDN for static assets
   - Enable compression

3. **Monitoring**
   - Set up logging (Winston, Morgan)
   - Monitor server health
   - Track API performance
   - Set up alerts

4. **Scalability**
   - Use load balancer
   - Horizontal scaling with PM2
   - Database replication
   - Separate Socket.IO server if needed

---

## ✅ Best Practices

### Code Style

1. **Use TypeScript types**
   ```typescript
   // Good
   function getUser(id: number): Promise<User | null>
   
   // Avoid
   function getUser(id: any): Promise<any>
   ```

2. **Async/await over callbacks**
   ```typescript
   // Good
   const user = await getUserById(id);
   
   // Avoid
   getUserById(id, (err, user) => { ... });
   ```

3. **Consistent error handling**
   ```typescript
   try {
     const result = await someOperation();
     res.json({ status: true, data: result });
   } catch (error) {
     res.status(500).json({
       status: false,
       message: "Operation failed",
       error: error.message
     });
   }
   ```

### Database Queries

1. **Use Drizzle ORM query builder**
   ```typescript
   // Good
   const users = await db
     .select()
     .from(users)
     .where(eq(users.status, "active"))
     .limit(10);
   
   // Avoid raw SQL unless necessary
   ```

2. **Use transactions for multiple operations**
   ```typescript
   await db.transaction(async (tx) => {
     await tx.insert(users).values(userData);
     await tx.insert(transactions).values(transactionData);
   });
   ```

3. **Optimize queries with indexes**
   - Index foreign keys
   - Index frequently queried columns
   - Use composite indexes for multi-column queries

### Security

1. **Never expose sensitive data**
   ```typescript
   // Good - exclude password
   const { password, ...userWithoutPassword } = user;
   res.json({ data: userWithoutPassword });
   
   // Bad
   res.json({ data: user }); // includes password hash
   ```

2. **Validate all inputs**
   ```typescript
   if (!email || !password) {
     return res.status(400).json({
       status: false,
       message: "Email and password required"
     });
   }
   ```

3. **Use parameterized queries** (Drizzle ORM handles this)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `❌ Database connection failed`

**Solution**:
- Check DATABASE_URL in `.env`
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials and permissions

#### 2. JWT Token Invalid

**Error**: `Invalid or expired token`

**Solution**:
- Check JWT_SECRET matches between token generation and verification
- Verify token hasn't expired
- Check token version for players
- Use fresh token after login

#### 3. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

#### 4. Drizzle Migration Issues

**Error**: Migration or schema sync errors

**Solution**:
```bash
# Regenerate migrations
npm run drizzle:generate

# Force push schema
npm run db:push

# Check drizzle.config.ts is correct
```

#### 5. TypeScript Compilation Errors

**Solution**:
```bash
# Clean build
rm -rf dist/
npm run build

# Check tsconfig.json
# Verify all imports are correct
```

### Debug Mode

Enable detailed logging:

```typescript
// Add to index.ts
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### Getting Help

1. Check existing API documentation files
2. Review Swagger docs: http://localhost:3000/api-docs
3. Check test scripts for usage examples
4. Review controller implementations

---

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Guide](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT.io](https://jwt.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Related Documentation

- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration
- [GAMING_SYSTEM_README.md](./GAMING_SYSTEM_README.md) - Gaming system details
- [BALANCE_API_DOCUMENTATION.md](./BALANCE_API_DOCUMENTATION.md) - Balance calculation

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintainer**: Development Team
