# SketchQL - AI-Powered Database Architect

**SketchQL** is a full-stack MERN + AI application that serves as an AI-powered database architect for founders, engineers, and teams. Users can describe their product or paste existing schemas, and SketchQL generates clean, production-ready schemas, visualizes them as ERDs, exports code for different stacks, and provides AI assistance for refactoring, migration, and query/documentation generation.

## 🚀 Features

### Core Features
- **AI Schema Generation**: Describe your application in natural language and get a complete database schema
- **Visual ERD Editor**: Interactive React Flow-based diagram editor with drag-and-drop functionality
- **Multi-Stack Code Export**: Generate code for MongoDB, MySQL, PostgreSQL, Prisma, Mongoose, Spring Boot, Flask, C#, and more
- **Real-time Collaboration**: Share diagrams with team members via shareable links

### AI-Powered Features
1. **Schema Refactoring**: AI analyzes and optimizes schemas for better normalization, reduced redundancy, and improved relationships
2. **Database Migration**: Convert schemas between MongoDB, PostgreSQL, MySQL, and SQL Server with automatic type mapping
3. **Schema Versioning**: Track schema changes over time with version history, diffs, and rollback capabilities
4. **Mock Data Generator**: Generate realistic test data based on your schema with AI-enhanced domain-specific values
5. **Query Generator**: Auto-generate CRUD queries, pagination, and joins for SQL, Prisma, and Mongoose
6. **GitHub Sync**: Reverse engineer database schemas from existing codebases (Prisma, Mongoose, Sequelize)

## 📁 Project Structure

```
SketchQL/
├── backend/          # Node.js + Express API server
│   ├── models/      # Mongoose models (Users, Projects, SchemaVersions)
│   ├── routes/      # API route handlers
│   ├── services/    # Business logic and AI services
│   └── middleware/ # Authentication and error handling
├── frontend/        # React + Vite application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── Store/       # Zustand state management
│   │   └── utils/       # Utility functions
└── README.md        # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: Passport.js (Google OAuth, GitHub OAuth, JWT)
- **AI**: Google Gemini API
- **Security**: Helmet, CORS, Rate Limiting, MongoDB Sanitization

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Library**: Bootstrap 5
- **Diagram Library**: React Flow
- **HTTP Client**: Axios

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Google Gemini API key
- (Optional) GitHub Personal Access Token for GitHub sync

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# MONGO_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key
# JWT_SECRET=your_jwt_secret
# FRONTEND_URL=http://localhost:5173
# PORT=5000

npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000

npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/sketchql
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
PORT=5000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /auth/google` - Google OAuth
- `GET /auth/github` - GitHub OAuth

### Diagrams/Projects
- `GET /api/diagramss/diagrams` - Get user's projects
- `POST /api/diagramss/save` - Save/update project
- `DELETE /api/diagramss/delete/:id` - Delete project
- `GET /api/diagramss/shared/:id` - Get shared diagram (public)

### AI Features
- `POST /api/ai/generate` - Generate schema from description
- `POST /api/schema/refactor` - Refactor schema with AI
- `POST /api/schema/migrate` - Migrate schema between databases
- `POST /api/schema/mock-data` - Generate mock data
- `POST /api/schema/queries` - Generate queries

### Versioning
- `GET /api/projects/:projectId/versions` - Get all versions
- `POST /api/projects/:projectId/versions` - Create new version
- `GET /api/versions/:versionId` - Get specific version
- `POST /api/versions/:versionId/restore` - Restore version
- `POST /api/versions/compare` - Compare two versions

### GitHub Sync
- `POST /api/github/sync` - Sync schema from GitHub repository

## 🎯 Usage

### Creating a Schema

1. **AI Generation**: Click "AI Generate" button, describe your application, and get an instant schema
2. **Manual Creation**: Use "Add Table" to create tables manually
3. **Import**: Use "Sync from GitHub" to import from existing codebases

### Refactoring Schema

1. Click "File" → "Refactor with AI"
2. Optionally specify optimization goals
3. Review the diff and AI explanations
4. Accept or reject the refactored schema

### Database Migration

1. Click "File" → "Database Migration"
2. Select source and target database types
3. Review generated DDL and type mappings
4. Copy or download the migration script

### Version Management

1. Click "File" → "Schema Versions"
2. Create versions with labels and messages
3. Compare versions to see changes
4. Restore any previous version

### Generating Mock Data

1. Click "File" → "Generate Mock Data"
2. Set entity counts
3. Choose JSON or SQL format
4. Optionally enable AI for realistic values
5. Copy or download the data

### Query Generation

1. Click "File" → "Query Generator"
2. Select target technology (SQL, Prisma, Mongoose)
3. Browse generated queries by entity
4. Copy queries to clipboard

## 🔐 Authentication

SketchQL supports multiple authentication methods:
- **Email/Password**: Traditional registration and login
- **Google OAuth**: Sign in with Google account
- **GitHub OAuth**: Sign in with GitHub account

All authenticated requests require a JWT token in the `auth-token` header.

## 📝 Code Generation

SketchQL can generate code for:
- **MongoDB**: Mongoose schemas
- **SQL**: MySQL, PostgreSQL, SQL Server
- **ORM**: Prisma, Sequelize
- **Frameworks**: Spring Boot, Flask, Express.js
- **Languages**: JavaScript, TypeScript, Java, Python, C#

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues, questions, or feature requests, please open an issue on the repository.

## 🗺️ Roadmap

- [ ] Real-time collaborative editing
- [ ] More database type support
- [ ] Advanced query optimization
- [ ] Schema documentation generator
- [ ] API endpoint generator
- [ ] Database migration scripts
- [ ] Performance analysis tools

---

**Built with ❤️ for developers who want to design better databases faster.**

