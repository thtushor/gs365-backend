# Pagination API Documentation

## Updated Payment Provider & Gateway-Provider APIs with Pagination

The `getAll` endpoints for both payment providers and gateway-provider relationships now support pagination.

## Pagination Parameters

### Query Parameters

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)
- `status` (optional): Filter by status ('active' or 'inactive')
- `name` (optional): Search by name (partial match)
- `commissionPercentage` (optional): Filter by commission percentage
- `gatewayId` (optional): Filter by gateway ID (for gateway-provider relationships)
- `providerId` (optional): Filter by provider ID (for gateway-provider relationships)

## API Endpoints with Pagination

### Payment Providers

#### GET `/api/payment-providers`

Get all payment providers with pagination and filtering.

**Example Request:**

```
GET /api/payment-providers?page=1&limit=10&status=active&name=Company
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Company A",
      "contact_info": "contact@companya.com",
      "commission_percentage": 5,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Gateway-Provider Relationships

#### GET `/api/gateway-providers`

Get all gateway-provider relationships with pagination and filtering.

**Example Request:**

```
GET /api/gateway-providers?page=2&limit=5&gatewayId=1
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "gatewayId": 1,
      "providerId": 1,
      "priority": 1
    }
  ],
  "pagination": {
    "page": 2,
    "pageSize": 5,
    "total": 15,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Pagination Response Structure

All paginated endpoints return the following structure:

```json
{
  "success": true,
  "data": [...], // Array of items for current page
  "pagination": {
    "page": 1,           // Current page number
    "pageSize": 10,         // Items per page
    "total": 100,        // Total number of items
    "totalPages": 10,    // Total number of pages
    "hasNext": true,     // Whether there's a next page
    "hasPrev": false     // Whether there's a previous page
  }
}
```

## Usage Examples

### Example 1: Get first page of active providers

```bash
GET /api/payment-providers?page=1&limit=10&status=active
```

### Example 2: Search providers by name with pagination

```bash
GET /api/payment-providers?page=2&limit=5&name=Company
```

### Example 3: Get gateway-provider relationships for a specific gateway

```bash
GET /api/gateway-providers?page=1&limit=20&gatewayId=1
```

### Example 4: Get providers with specific commission percentage

```bash
GET /api/payment-providers?page=1&limit=10&commissionPercentage=5
```

## Commission Percentage Field

The payment provider schema now includes a `commission_percentage` field:

- **Type**: Integer
- **Default**: 0
- **Range**: 0-100
- **Validation**: Must be between 0 and 100

### Creating a provider with commission:

```json
POST /api/payment-providers
{
  "name": "Company A",
  "contact_info": "contact@companya.com",
  "commission_percentage": 5,
  "status": "active"
}
```

## Error Handling

Invalid pagination parameters will be handled gracefully:

- Invalid `page` or `limit` values will use defaults
- Negative values will be ignored
- Non-numeric values will be ignored

## Performance Notes

- Pagination is implemented at the database level for optimal performance
- Total count queries are optimized
- Results are ordered by ID for consistent pagination
- Gateway-provider relationships are ordered by priority first, then by ID

## Status Update API

### PUT `/api/gateway-providers/:id/status`

Update the status of a gateway-provider relationship.

**Request Body:**

```json
{
  "status": "active"
}
```

**Valid Status Values:**

- `"active"` - Enable the relationship
- `"inactive"` - Disable the relationship

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "gatewayId": 1,
    "providerId": 1,
    "priority": 1,
    "status": "active"
  },
  "message": "Status updated to active successfully"
}
```

**Usage Examples:**

```bash
# Activate a relationship
PUT /api/gateway-providers/1/status
{
  "status": "active"
}

# Deactivate a relationship
PUT /api/gateway-providers/1/status
{
  "status": "inactive"
}
```
