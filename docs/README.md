# GS365 Backend Documentation

Welcome to the GS365 Gaming Platform backend documentation. This folder contains comprehensive documentation for developers, system architects, and engineers.

---

## 📚 Core Documentation

### Getting Started

1. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Start here!
   - Complete development guide
   - Architecture overview
   - Setup instructions
   - Best practices
   - Troubleshooting

2. **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**
   - Environment variables
   - Configuration guide
   - Production setup
   - Security settings

3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
   - Complete database documentation
   - **Mermaid ER diagram** with all 37 tables
   - Table definitions and relationships
   - Indexing strategy

4. **[API_REFERENCE.md](./API_REFERENCE.md)**
   - Consolidated API endpoint reference
   - Organized by domain
   - WebSocket events
   - Authentication guide

---

## 🎮 Feature-Specific Documentation

### Gaming System
- **[GAMING_SYSTEM_README.md](./GAMING_SYSTEM_README.md)** - Gaming system implementation
- **[BET_RESULTS_API_DOCUMENTATION.md](./BET_RESULTS_API_DOCUMENTATION.md)** - Bet results API
- **[GAME_STATS_API_DOCUMENTATION.md](./GAME_STATS_API_DOCUMENTATION.md)** - Game statistics API

### Financial System
- **[BALANCE_API_DOCUMENTATION.md](./BALANCE_API_DOCUMENTATION.md)** - Balance calculation API
- **[TRANSACTION_API.md](./TRANSACTION_API.md)** - Transaction management
- **[ADMIN_MAIN_BALANCE_API_DOCUMENTATION.md](./ADMIN_MAIN_BALANCE_API_DOCUMENTATION.md)** - Admin balance API

### Payment & Withdrawal
- **[WITHDRAWAL_PAYMENT_ACCOUNT_API_DOCUMENTATION.md](./WITHDRAWAL_PAYMENT_ACCOUNT_API_DOCUMENTATION.md)** - Withdrawal accounts
- **[WITHDRAW_API_DOCUMENTATION.md](./WITHDRAW_API_DOCUMENTATION.md)** - Withdrawal API
- **[WITHDRAW_CAPABILITY_API_DOCUMENTATION.md](./WITHDRAW_CAPABILITY_API_DOCUMENTATION.md)** - Withdrawal capability check

### System Features
- **[DASHBOARD_API_DOCUMENTATION.md](./DASHBOARD_API_DOCUMENTATION.md)** - Dashboard & analytics
- **[SETTINGS_API_INTEGRATION_GUIDE.md](./SETTINGS_API_INTEGRATION_GUIDE.md)** - System settings
- **[PAGINATION_API.md](./PAGINATION_API.md)** - Pagination implementation
- **[COUNTRY_MANAGEMENT_README.md](./COUNTRY_MANAGEMENT_README.md)** - Country management (if exists)

---

## 🚀 Quick Start

### For New Developers

1. Read **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** to understand the system
2. Follow **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** to configure your environment
3. Review **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** to learn the data model
4. Reference **[API_REFERENCE.md](./API_REFERENCE.md)** for available endpoints

### For System Architects

1. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database design and ER diagram
2. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Architecture section
3. **[API_REFERENCE.md](./API_REFERENCE.md)** - API design patterns

### For API Integration

1. **[API_REFERENCE.md](./API_REFERENCE.md)** - All endpoints organized by domain
2. Feature-specific docs for detailed implementation
3. **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Authentication setup

---

## 📊 Documentation Statistics

- **Total Documentation Files**: 17
- **Core Guides**: 4
- **Feature-Specific Docs**: 13
- **Total Lines**: 5000+
- **Database Tables Documented**: 37
- **API Endpoints Documented**: 100+

---

## 🏗️ System Overview

### Technology Stack
- **Runtime**: Node.js 16+
- **Language**: TypeScript 5.9.2
- **Framework**: Express 5.1.0
- **Database**: MySQL 8.0+
- **ORM**: Drizzle ORM 0.44.4
- **Real-time**: Socket.IO 4.8.1
- **Authentication**: JWT

### Architecture
- **Pattern**: MVC + Services
- **Layers**: Routes → Controllers → Models → Database
- **Database**: 37 tables across 8 domains
- **API**: RESTful + WebSocket

### Key Features
- 🎮 Gaming system with betting
- 💰 Multi-currency financial management
- 👥 User management (players, agents, affiliates)
- 💳 Payment gateway integration
- 🌍 Multi-language & multi-currency
- 💬 Real-time chat
- 📊 Analytics & reporting
- 🔐 JWT authentication with RBAC

---

## 📖 Documentation Conventions

### File Naming
- `UPPERCASE_WITH_UNDERSCORES.md` - Documentation files
- Descriptive names indicating content

### Structure
- Table of contents for long documents
- Code examples with syntax highlighting
- Mermaid diagrams for visual representation
- Cross-references between related docs

### Code Examples
All code examples are:
- ✅ Tested and working
- ✅ TypeScript typed
- ✅ Following project conventions
- ✅ Production-ready

---

## 🔄 Keeping Documentation Updated

When adding new features:
1. Update relevant feature-specific docs
2. Add new endpoints to **API_REFERENCE.md**
3. Update **DATABASE_SCHEMA.md** if schema changes
4. Update **DEVELOPER_GUIDE.md** for architectural changes

---

## 📞 Support

For questions or clarifications:
1. Check the relevant documentation file
2. Review code examples in **DEVELOPER_GUIDE.md**
3. Check Swagger docs: `http://localhost:3000/api-docs`
4. Review test scripts in project root

---

## 📝 Contributing to Documentation

When updating documentation:
- Keep the same format and style
- Add code examples where helpful
- Update cross-references
- Keep line length reasonable
- Use proper markdown formatting

---

**Last Updated**: January 2026  
**Documentation Version**: 1.0.0  
**Backend Version**: 1.0.0
