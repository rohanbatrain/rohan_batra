# API Reference

Complete API documentation for the Braindump platform.

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [CSRF Protection](#csrf-protection)
- [Endpoints](#endpoints)
  - [Braindumps](#braindumps)
  - [Comments](#comments)
  - [Reactions](#reactions)
  - [Search](#search)
  - [RSS Feed](#rss-feed)
  - [Admin](#admin)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Authentication

Most endpoints are publicly accessible. Protected endpoints require Clerk authentication.

### Getting an Auth Token

```bash
# Using Clerk SDK
const { getToken } = useAuth();
const token = await getToken();
```

### Making Authenticated Requests

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.braindump.dev/api/admin/braindump
```

## Rate Limiting

Rate limits vary by endpoint:

- **Public endpoints**: 100 requests/minute
- **Write operations**: 20 requests/minute
- **Search**: 100 requests/minute
- **Admin**: 50 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## CSRF Protection

Write operations require CSRF tokens.

### Get CSRF Token

```bash
GET /api/csrf-token
```

Response:
```json
{
  "token": "abc123...",
  "expiresAt": "2025-01-02T00:00:00Z"
}
```

### Use CSRF Token

```bash
POST /api/braindump/123/comments
X-CSRF-Token: abc123...
```

## Endpoints

### Braindumps

#### List Braindumps

```http
GET /api/braindump
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 50) - Items per page
- `sort` (enum: recent, popular, trending) - Sort order
- `tags` (string) - Comma-separated tags

**Response:**
```json
{
  "braindumps": [
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a1",
      "content": "My thoughts on...",
      "slug": "my-thoughts-on",
      "userId": "user_123",
      "tags": ["tech", "ai"],
      "category": "Technology",
      "visibility": "public",
      "viewCount": 42,
      "shareCount": 5,
      "commentCount": 3,
      "reactionCount": 12,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Get Single Braindump

```http
GET /api/braindump/{id}
```

**Path Parameters:**
- `id` (string, required) - Braindump ID or slug

**Response:**
```json
{
  "_id": "60d5ec49f1b2c8b1f8e4e1a1",
  "content": "My detailed thoughts...",
  "slug": "my-thoughts",
  "userId": "user_123",
  "tags": ["tech"],
  "visibility": "public",
  "viewCount": 42,
  "comments": [...],
  "reactions": [...]
}
```

### Comments

#### List Comments

```http
GET /api/braindump/{id}/comments
```

**Query Parameters:**
- `sort` (enum: recent, popular) - Sort order
- `status` (enum: approved, pending, rejected) - Filter by status

**Response:**
```json
{
  "comments": [
    {
      "_id": "60d5ec49...",
      "content": "Great post!",
      "userId": "user_456",
      "userName": "John Doe",
      "parentId": null,
      "status": "approved",
      "replies": [],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "totalCount": 5
}
```

#### Create Comment

```http
POST /api/braindump/{id}/comments
```

**Headers:**
- `Authorization: Bearer {token}` (required)
- `X-CSRF-Token: {token}` (required)

**Body:**
```json
{
  "content": "This is my comment",
  "parentId": "60d5ec49..." // Optional, for replies
}
```

**Response:**
```json
{
  "_id": "60d5ec49...",
  "content": "This is my comment",
  "userId": "user_123",
  "status": "approved",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Reactions

#### Toggle Reaction

```http
POST /api/braindump/{id}/reactions
```

**Headers:**
- `Authorization: Bearer {token}` (required)
- `X-CSRF-Token: {token}` (required)

**Body:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "added": true,
  "reactionCount": 13
}
```

### Search

#### Search Braindumps

```http
GET /api/braindump/search
```

**Query Parameters:**
- `q` (string, required, 2-100 chars) - Search query
- `tags` (string) - Comma-separated tags
- `sort` (enum: relevance, recent, popular) - Sort order
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 50) - Items per page
- `suggestions` (boolean) - Return suggestions instead

**Response:**
```json
{
  "results": [
    {
      "_id": "60d5ec49...",
      "content": "Matching content...",
      "score": 8.5,
      "highlights": [
        "...matching <mark>text</mark>..."
      ]
    }
  ],
  "pagination": {...},
  "suggestions": {
    "tags": ["javascript", "typescript"],
    "categories": ["Programming"]
  }
}
```

### RSS Feed

#### Get RSS Feed

```http
GET /api/braindump/feed.xml
```

**Response:** RSS 2.0 XML feed

### Admin

#### Create Braindump (Admin)

```http
POST /api/admin/braindump
```

**Headers:**
- `Authorization: Bearer {token}` (required)
- `X-CSRF-Token: {token}` (required)

**Body:**
```json
{
  "content": "New braindump content",
  "tags": ["tech", "ai"],
  "category": "Technology",
  "visibility": "public"
}
```

**Response:**
```json
{
  "_id": "60d5ec49...",
  "content": "New braindump content",
  "slug": "new-braindump-content",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### Update Braindump (Admin)

```http
PUT /api/admin/braindump/{id}
```

**Headers:**
- `Authorization: Bearer {token}` (required)
- `X-CSRF-Token: {token}` (required)

**Body:** Same as create

#### Delete Braindump (Admin)

```http
DELETE /api/admin/braindump/{id}
```

**Headers:**
- `Authorization: Bearer {token}` (required)
- `X-CSRF-Token: {token}` (required)

**Response:**
```json
{
  "success": true
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Examples

**Validation Error:**
```json
{
  "error": "Validation Error",
  "message": "Content must be between 1 and 10000 characters",
  "statusCode": 400
}
```

**Rate Limit:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "statusCode": 429
}
```

**Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "statusCode": 401
}
```

## Examples

### JavaScript/TypeScript

```typescript
// List braindumps
const response = await fetch('/api/braindump?page=1&limit=10&sort=recent');
const data = await response.json();

// Search
const searchResponse = await fetch('/api/braindump/search?q=react&tags=javascript');
const searchData = await searchResponse.json();

// Create comment (with auth and CSRF)
const { getToken } = useAuth();
const token = await getToken();
const csrfResponse = await fetch('/api/csrf-token');
const { token: csrfToken } = await csrfResponse.json();

const commentResponse = await fetch('/api/braindump/123/comments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Great post!',
  }),
});
```

### cURL

```bash
# List braindumps
curl "https://api.braindump.dev/api/braindump?page=1&limit=10"

# Search
curl "https://api.braindump.dev/api/braindump/search?q=react"

# Create comment
TOKEN="your_clerk_token"
CSRF_TOKEN=$(curl https://api.braindump.dev/api/csrf-token | jq -r '.token')

curl -X POST "https://api.braindump.dev/api/braindump/123/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!"}'
```

### Python

```python
import requests

# List braindumps
response = requests.get('https://api.braindump.dev/api/braindump', params={
    'page': 1,
    'limit': 10,
    'sort': 'recent'
})
data = response.json()

# Search
search_response = requests.get('https://api.braindump.dev/api/braindump/search', params={
    'q': 'react',
    'tags': 'javascript'
})
search_data = search_response.json()

# Create comment
csrf_response = requests.get('https://api.braindump.dev/api/csrf-token')
csrf_token = csrf_response.json()['token']

comment_response = requests.post(
    'https://api.braindump.dev/api/braindump/123/comments',
    headers={
        'Authorization': f'Bearer {token}',
        'X-CSRF-Token': csrf_token,
        'Content-Type': 'application/json'
    },
    json={'content': 'Great post!'}
)
```

## Rate Limit Handling

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
      const waitTime = resetTime * 1000 - Date.now();
      
      if (i < maxRetries - 1) {
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

## Pagination

```typescript
async function fetchAllPages(baseUrl: string) {
  const allItems = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${baseUrl}?page=${page}&limit=50`);
    const data = await response.json();
    
    allItems.push(...data.braindumps);
    hasMore = data.pagination.hasNextPage;
    page++;
  }
  
  return allItems;
}
```

## Interactive Documentation

For interactive API testing, visit: [/api-docs](/api-docs)

## Support

- **Documentation**: [https://docs.braindump.dev](https://docs.braindump.dev)
- **Support**: support@braindump.dev
- **GitHub**: [https://github.com/yourusername/braindump](https://github.com/yourusername/braindump)
