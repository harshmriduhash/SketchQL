# SketchQL Frontend

React + Vite frontend application for SketchQL, providing an interactive UI for database schema design, visualization, and AI-powered features.

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── codeGenerator/    # Code export components
│   │   ├── DbDesign/          # ERD diagram components
│   │   ├── Landing/           # Landing page components
│   │   ├── Navbar/            # Navigation bar
│   │   ├── schema/            # Schema feature modals
│   │   └── Sidebar/           # Schema editor sidebar
│   ├── pages/             # Page components
│   │   ├── Auth/              # Authentication pages
│   │   ├── Dashboard/         # User dashboard
│   │   ├── Designer/          # Schema designer page
│   │   └── Landing/           # Landing page
│   ├── Store/              # Zustand state management
│   │   ├── authStore.js       # Authentication state
│   │   └── store.js           # Main application state
│   ├── utils/              # Utility functions
│   │   └── autoLayout.js      # Auto-layout algorithm
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Public assets
├── dist/                   # Build output
├── package.json            # Dependencies
└── vite.config.js         # Vite configuration
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory (optional):

```env
VITE_API_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Components Overview

### Core Components

#### DbDesign Components
- **Table.jsx**: Main React Flow canvas component
- **TableNode.jsx**: Individual table node component
- **TableEdge.jsx**: Relationship edge component
- **TableColumn.jsx**: Column display component

#### Schema Feature Components
- **RefactorModal.jsx**: AI schema refactoring interface
- **MigrationPanel.jsx**: Database migration tool
- **VersionsPanel.jsx**: Schema versioning interface
- **MockDataPanel.jsx**: Mock data generator
- **QueryGeneratorPanel.jsx**: Query code generator
- **GitHubSyncPanel.jsx**: GitHub repository sync

#### Navigation
- **NavBar.jsx**: Main navigation with feature access
- **Sidebar.jsx**: Schema editor sidebar with table list

### Pages

- **LandingPage.jsx**: Marketing landing page
- **Login.jsx / Register.jsx**: Authentication pages
- **Dashboard.jsx**: User project dashboard
- **DbDesigner.jsx**: Main schema designer interface
- **SharedDiagram.jsx**: Public shared diagram view

## 🗄️ State Management

### Zustand Stores

#### `store.js` - Main Application State
- `nodes`: Array of React Flow nodes (tables)
- `edges`: Array of React Flow edges (relationships)
- `selectedNodeId`: Currently selected table
- `currentProjectId`: Active project ID
- `projectName`: Current project name
- Actions: `loadProject`, `addNewTable`, `updateNodeLabel`, `addColumn`, etc.

#### `authStore.js` - Authentication State
- `token`: JWT token
- `user`: Current user object
- `isAuthenticated`: Auth status
- Actions: `login`, `logout`

## 🔌 API Integration

All API calls use Axios with the base URL from `VITE_API_URL` environment variable.

### Authentication
All authenticated requests include the JWT token in headers:
```javascript
headers: { 'auth-token': token }
```

### Example API Call
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const res = await axios.post(
  `${API_URL}/api/schema/refactor`,
  { schema: { nodes, edges } },
  { headers: { 'auth-token': token } }
);
```

## 🎯 Key Features

### Schema Editor
- Drag-and-drop table positioning
- Visual relationship connections
- Inline column editing
- Color-coded tables
- Auto-layout algorithm

### AI Features
- **Schema Generation**: Natural language to schema
- **Refactoring**: AI-powered schema optimization
- **Migration**: Convert between database types
- **Mock Data**: Generate test data
- **Queries**: Auto-generate query code

### Code Export
Supports multiple frameworks and languages:
- MongoDB (Mongoose)
- MySQL, PostgreSQL, SQL Server
- Prisma, Sequelize
- Spring Boot, Flask
- C#, Java, Python

## 🎨 Styling

- **Bootstrap 5**: Main UI framework
- **Custom CSS**: Component-specific styles in `App.css` and `index.css`
- **React Flow**: Diagram styling via React Flow themes

## 🔧 Utilities

### `autoLayout.js`
Automatic layout algorithm for positioning tables in the ERD canvas. Uses a hierarchical layout approach.

## 📱 Responsive Design

The application is responsive and works on:
- Desktop (primary)
- Tablet
- Mobile (limited functionality)

## 🚨 Common Issues

### API Connection Errors
- Verify `VITE_API_URL` matches backend URL
- Check CORS configuration on backend
- Ensure backend server is running

### Authentication Issues
- Clear localStorage if tokens are corrupted
- Verify JWT token expiration
- Check backend authentication middleware

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify all environment variables

## 📦 Dependencies

Key dependencies:
- `react`: UI library
- `react-dom`: React DOM renderer
- `react-router-dom`: Routing
- `@xyflow/react`: React Flow diagram library
- `zustand`: State management
- `axios`: HTTP client
- `bootstrap`: CSS framework
- `html-to-image`: Image export

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Advanced search and filter
- [ ] Custom themes
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration UI
- [ ] Export to PDF/PNG improvements

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 Code Style

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Keep components focused and small
