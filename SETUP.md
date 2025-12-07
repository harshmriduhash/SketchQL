# SketchQL Setup Guide

Quick setup guide to get SketchQL running locally.

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- (Optional) **GitHub Personal Access Token** for GitHub sync feature

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SketchQL
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/sketchql
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_random_secret_key_here
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Start MongoDB (if running locally):
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

Start the backend:
```bash
node server.js
```

You should see:
```
✅ MongoDB Connected Successfully
✅ Secure Server running on port 5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## First Steps

1. **Register an Account**
   - Click "Register" on the landing page
   - Or use Google/GitHub OAuth (if configured)

2. **Create Your First Schema**
   - Click "AI Generate" button
   - Describe your application (e.g., "E-commerce app with users, products, and orders")
   - Review and edit the generated schema

3. **Explore Features**
   - Try "Refactor with AI" to optimize your schema
   - Use "Database Migration" to convert between database types
   - Generate mock data for testing
   - Export code for your preferred stack

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoDB Connection Error`

**Solutions**:
- Verify MongoDB is running: `mongosh` or `mongo`
- Check `MONGO_URI` in `.env` matches your MongoDB setup
- For MongoDB Atlas: Ensure IP whitelist includes your IP
- Check firewall settings

### Gemini API Errors

**Error**: `Failed to generate schema`

**Solutions**:
- Verify `GEMINI_API_KEY` is correct in `.env`
- Check API quota/limits in Google Cloud Console
- Ensure internet connectivity
- Verify API key has proper permissions

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solutions**:
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend `server.js` CORS configuration
- Ensure both servers are running

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solutions**:
- Change `PORT` in backend `.env` to another port (e.g., 5001)
- Update `VITE_API_URL` in frontend `.env` to match
- Or kill the process using port 5000:
  ```bash
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Module Not Found Errors

**Error**: `Cannot find module '@octokit/rest'`

**Solutions**:
```bash
cd backend
npm install @octokit/rest
```

Or reinstall all dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017/sketchql` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | `AIza...` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | Random string |
| `FRONTEND_URL` | Yes | Frontend URL for CORS | `http://localhost:5173` |
| `PORT` | No | Backend server port | `5000` (default) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID | For OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret | For OAuth |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID | For OAuth |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth secret | For OAuth |

### Frontend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | No | Backend API URL | `http://localhost:5000` (default) |

## Production Deployment

### Backend (Node.js)

1. Set production environment variables
2. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name sketchql-backend
   ```
3. Configure reverse proxy (Nginx)
4. Set up SSL/TLS certificates

### Frontend (Vite)

1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

### Database (MongoDB)

- Use MongoDB Atlas for cloud hosting
- Configure connection string
- Set up backups
- Configure IP whitelist

## Next Steps

- Read [Main README.md](./README.md) for feature overview
- Check [Backend README.md](./backend/README.md) for API details
- Review [Frontend README.md](./frontend/README.md) for UI components
- Explore [Services README.md](./backend/services/README.md) for business logic

## Getting Help

- Check existing issues on GitHub
- Review error logs in console
- Verify all environment variables
- Ensure all dependencies are installed
- Check MongoDB and API service status

---

**Happy Schema Designing! 🚀**

