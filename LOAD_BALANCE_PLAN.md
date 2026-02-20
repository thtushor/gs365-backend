# High Traffic and Load Balancing Strategy

This document outlines the technical plan to handle a large number of concurrent players and server requests for the Gramestar 365 backend.

## 1. Vertical Scaling (Single Server Optimization)

### Database Connection Pooling
- **Issue**: The current pool size is limited to 5 connections.
- **Solution**: Increase `connectionLimit` in `src/db/connection.ts` to 50 or 100, depending on the server's RAM and MySQL configuration (`max_connections`).

### Multi-core Utilization (PM2 Cluster Mode)
- **Issue**: Node.js runs on a single thread by default.
- **Solution**: Use PM2 to run the application in "Cluster Mode" to utilize all available CPU cores.
  ```bash
  # Start app with max available cores
  pm2 start dist/index.js -i max
  ```

## 2. Horizontal Scaling (Multiple Backend Instances)

### Socket.io Synchronization (Redis Adapter)
- **Issue**: When running multiple instances, a user connected to Instance A cannot send a message to a user on Instance B.
- **Solution**: Integrate `@socket.io/redis-adapter`. This uses a Redis server to broadcast events across all backend instances.

### Session Management
- Ensure JWT-based authentication is used (stateless) so any backend instance can verify the user without local session storage.

## 3. Infrastructure & Traffic Management

### Nginx Reverse Proxy & Load Balancer
- Use Nginx to distribute incoming traffic across the Node.js instances.
- Handle SSL (HTTPS) termination at the Nginx level to reduce load on the Node processes.

### Caching Layer (Redis)
- Cache frequently accessed, slow-changing data (e.g., game results, user profiles, settings) in Redis to prevent hitting the MySQL database for every request.

### API Rate Limiting
- Implement `express-rate-limit` to prevent DDoS attacks or script-based spamming of login/transaction endpoints during peak hours.

## 4. Database Optimization
- **Indexing**: Ensure all frequently searched columns (e.g., `userId`, `transactionId`, `gameId`) have proper indexes.
- **Read/Write Splitting**: For very high traffic, consider a Master-Slave MySQL setup where writes go to the Master and reads go to the Slaves.

---

*This plan is a roadmap. Implementation should be done in phases, starting with Database Pooling and PM2 Cluster mode.*
