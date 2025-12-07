# SketchQL Backend

Node.js + Express backend server for SketchQL, providing RESTful API endpoints, AI-powered services, and database management.

## 📁 Directory Structure

```
backend/
├── models/          # Mongoose schemas
│   ├── Diagrams.js      # Project/Diagram model
│   ├── SchemaVersion.js # Schema versioning model
│   └── Users.js         # User model
├── routes/          # Express route handlers
│   ├── ai.js            # AI schema generation
│   ├── auth.js          # Authentication routes
│   ├── diagrams.js      # Project/diagram CRUD
│   ├── github.js        # GitHub sync endpoint
│   ├── schema.js        # Schema operations (refactor, migrate, mock-data, queries)
│   ├── social.js        # OAuth callbacks
│   └── versions.js      # Schema versioning routes
├── services/        # Business logic and AI services
│   ├── githubParserService.js    # Parse models from GitHub
│   ├── migrationService.js        # Database migration logic
│   ├── mockDataService.js        # Mock data generation
│   ├── queryGeneratorService.js  # Query code generation
│   ├── schemaRefactorService.js  # AI schema refactoring
│   └── versionService.js         # Version management
├── middleware/      # Express middleware
│   ├── errorHandler.js  # Global error handler
│   └── fetchUser.js     # JWT authentication middleware
├── server.js       # Express app setup and configuration
├── passport.js     # Passport.js OAuth configuration
└── package.json     # Dependencies
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/sketchql

# AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Running the Server

```bash
# Development
node server.js

# Or with nodemon (if installed)
nodemon server.js
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Routes

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login (returns JWT token)

### Diagrams/Projects (`/api/diagramss`)
- `GET /diagrams` - Get all user's projects (requires auth)
- `POST /save` - Save or update project (requires auth)
- `DELETE /delete/:id` - Delete project (requires auth)
- `GET /shared/:id` - Get shared diagram (public, no auth)

### AI Generation (`/api/ai`)
- `POST /generate` - Generate schema from text description (requires auth, rate limited)

### Schema Operations (`/api/schema`)
- `POST /refactor` - AI-powered schema refactoring (requires auth)
- `POST /migrate` - Convert schema between database types (requires auth)
- `POST /mock-data` - Generate mock data from schema (requires auth)
- `POST /queries` - Generate queries for SQL/Prisma/Mongoose (requires auth)

### Versioning (`/api/projects/:projectId/versions` and `/api/versions`)
- `GET /:projectId/versions` - Get all versions for a project
- `POST /:projectId/versions` - Create new version
- `GET /versions/:versionId` - Get specific version
- `POST /versions/:versionId/restore` - Restore version schema
- `POST /versions/compare` - Compare two versions

### GitHub Sync (`/api/github`)
- `POST /sync` - Parse and import schema from GitHub repository (requires auth)

### OAuth (`/auth`)
- `GET /google` - Initiate Google OAuth
- `GET /github` - Initiate GitHub OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /github/callback` - GitHub OAuth callback

## 🔧 Services

### AI Services

All AI services use Google Gemini API and are located in `/services`:

- **schemaRefactorService.js**: Analyzes and optimizes schemas using AI
- **migrationService.js**: Converts schemas between database types (with AI fallback)
- **mockDataService.js**: Generates realistic test data (with optional AI enhancement)
- **queryGeneratorService.js**: Generates query code with template-based and AI approaches

### Utility Services

- **versionService.js**: Manages schema versioning, diffs, and restoration
- **githubParserService.js**: Parses Prisma, Mongoose, and Sequelize models from GitHub

## 🔐 Authentication

The backend uses JWT (JSON Web Tokens) for authentication. Protected routes require the `auth-token` header:

```javascript
headers: {
  'auth-token': 'your_jwt_token_here'
}
```

The `fetchUser` middleware validates tokens and attaches user info to `req.user`.

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing (configured for frontend URL)
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes
  - AI endpoints: 20 requests per hour
- **MongoDB Sanitization**: Prevents NoSQL injection
- **JWT**: Secure token-based authentication
- **OAuth**: Google and GitHub social login

## 📊 Database Models

### User Model
- `_id`: ObjectId
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed with bcrypt)
- `createdAt`, `updatedAt`: Timestamps

### Project/Diagram Model
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `name`: String
- `nodes`: Array (React Flow nodes)
- `edges`: Array (React Flow edges)
- `createdAt`, `updatedAt`: Timestamps

### SchemaVersion Model
- `_id`: ObjectId
- `projectId`: ObjectId (ref: Project)
- `versionNumber`: Number
- `schemaJSON`: Object (nodes and edges)
- `label`: String (optional)
- `message`: String (optional)
- `createdBy`: ObjectId (ref: User)
- `createdAt`, `updatedAt`: Timestamps

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 Error Handling

All routes use a consistent error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Success responses:

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

## 🔄 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **AI Endpoints**: 20 requests per hour per IP

Rate limit exceeded responses return HTTP 429 with a message.

## 🚨 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network connectivity

### Gemini API Errors
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota/limits
- Ensure internet connectivity

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend URL
- Check CORS configuration in `server.js`

## 📚 Dependencies

Key dependencies:
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `@google/generative-ai`: Gemini AI client
- `@octokit/rest`: GitHub API client
- `passport`: Authentication middleware
- `jsonwebtoken`: JWT handling
- `bcryptjs`: Password hashing
- `helmet`: Security headers
- `express-rate-limit`: Rate limiting
- `express-mongo-sanitize`: NoSQL injection prevention

## 🔮 Future Enhancements

- [ ] GraphQL API option
- [ ] WebSocket support for real-time collaboration
- [ ] Advanced caching with Redis
- [ ] Background job processing
- [ ] Comprehensive test suite
- [ ] API documentation with Swagger/OpenAPI

