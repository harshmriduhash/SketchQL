# API Routes

Express route handlers for SketchQL backend API. All routes follow RESTful conventions and include authentication where required.

## 📁 Route Files

### `auth.js`
**Base Path**: `/api/auth`

Authentication endpoints for user registration and login.

**Endpoints**:
- `POST /register` - Register new user
  - Body: `{ username, email, password }`
  - Returns: `{ userId, token }`
  
- `POST /login` - User login
  - Body: `{ email, password }`
  - Returns: `{ userId, token }`

**Middleware**: None (public endpoints)

---

### `diagrams.js`
**Base Path**: `/api/diagramss`

Project/diagram CRUD operations.

**Endpoints**:
- `GET /diagrams` - Get all user's projects
  - Auth: Required (`fetchUser`)
  - Returns: `Array<Project>`
  
- `POST /save` - Save or update project
  - Auth: Required
  - Body: `{ name, nodes, edges, projectId? }`
  - Returns: `Project`
  
- `DELETE /delete/:id` - Delete project
  - Auth: Required
  - Params: `id` (project ID)
  - Returns: `{ Success, project }`
  
- `GET /shared/:id` - Get shared diagram (public)
  - Auth: None (public)
  - Params: `id` (project ID)
  - Returns: `Project`

**Middleware**: `fetchUser` (except `/shared/:id`)

---

### `ai.js`
**Base Path**: `/api/ai`

AI-powered schema generation.

**Endpoints**:
- `POST /generate` - Generate schema from description
  - Auth: Required
  - Rate Limit: 20 requests/hour
  - Body: `{ userPrompt }`
  - Returns: `{ nodes, edges }` (React Flow format)

**Middleware**: `fetchUser`, rate limiting

---

### `schema.js`
**Base Path**: `/api/schema`

Schema operations: refactoring, migration, mock data, queries.

**Endpoints**:
- `POST /refactor` - AI schema refactoring
  - Auth: Required
  - Body: `{ schema: { nodes, edges }, goal? }`
  - Returns: `{ refactoredSchema, explanations }`
  
- `POST /migrate` - Database migration
  - Auth: Required
  - Body: `{ schema, sourceDbType, targetDbType }`
  - Returns: `{ targetDDL, mappingSummary }`
  
- `POST /mock-data` - Generate mock data
  - Auth: Required
  - Body: `{ schema, entityCounts?, useAI?, format? }`
  - Returns: `{ format, data }` (JSON or SQL)
  
- `POST /queries` - Generate queries
  - Auth: Required
  - Body: `{ schema, targetType, queryIntents? }`
  - Returns: `{ queries, explanations }`

**Middleware**: `fetchUser`

---

### `versions.js`
**Base Path**: `/api/projects/:projectId/versions` and `/api/versions`

Schema versioning and comparison.

**Endpoints**:
- `GET /:projectId/versions` - Get all versions
  - Auth: Required
  - Params: `projectId`
  - Returns: `Array<Version>`
  
- `POST /:projectId/versions` - Create new version
  - Auth: Required
  - Body: `{ schema, label?, message? }`
  - Returns: `Version`
  
- `GET /versions/:versionId` - Get specific version
  - Auth: Required
  - Params: `versionId`
  - Returns: `Version`
  
- `POST /versions/:versionId/restore` - Restore version
  - Auth: Required
  - Params: `versionId`
  - Returns: `{ schema, version }`
  
- `POST /versions/compare` - Compare two versions
  - Auth: Required
  - Body: `{ versionId1, versionId2 }`
  - Returns: `{ version1, version2, diff }`

**Middleware**: `fetchUser`

---

### `github.js`
**Base Path**: `/api/github`

GitHub repository synchronization.

**Endpoints**:
- `POST /sync` - Sync schema from GitHub
  - Auth: Required
  - Body: `{ repoUrl, branch?, path?, accessToken }`
  - Returns: `{ schema, filesProcessed }`

**Middleware**: `fetchUser`

---

### `social.js`
**Base Path**: `/auth`

OAuth authentication callbacks.

**Endpoints**:
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /github` - Initiate GitHub OAuth
- `GET /github/callback` - GitHub OAuth callback

**Middleware**: Passport.js OAuth strategies

---

## 🔐 Authentication

### Protected Routes
Most routes require authentication via JWT token:

```javascript
headers: {
  'auth-token': 'jwt_token_here'
}
```

The `fetchUser` middleware validates the token and attaches user to `req.user`.

### Public Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/diagramss/shared/:id`
- `GET /auth/*` (OAuth endpoints)

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

---

## 🛡️ Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **AI Endpoints** (`/api/ai/*`): 20 requests per hour per IP

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

---

## 🔧 Adding New Routes

1. Create route file in `/routes`
2. Import Express Router
3. Define endpoints
4. Add middleware (auth, validation)
5. Register in `server.js`:
   ```javascript
   app.use('/api/your-route', require('./routes/yourRoute'));
   ```

Example:
```javascript
const router = require("express").Router();
const fetchUser = require("../middleware/fetchUser");

router.get("/endpoint", fetchUser, async (req, res) => {
  try {
    // Route logic
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

---

## 🧪 Testing Routes

Use tools like Postman, Insomnia, or curl:

```bash
# Example: Generate schema
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "auth-token: your_token" \
  -d '{"userPrompt": "E-commerce app with users and orders"}'
```

---

## 📚 Route Dependencies

Routes depend on:
- **Models**: User, Project, SchemaVersion
- **Services**: All services in `/services`
- **Middleware**: `fetchUser`, `errorHandler`
- **External**: Google Gemini API, GitHub API (via Octokit)

---

## 🔮 Future Routes

- [ ] `GET /api/schema/validate` - Advanced schema validation
- [ ] `POST /api/schema/export` - Export to various formats
- [ ] `GET /api/analytics` - Usage analytics
- [ ] `POST /api/collaborate` - Real-time collaboration
- [ ] `GET /api/docs` - API documentation endpoint

