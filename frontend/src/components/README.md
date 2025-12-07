# Frontend Components

Overview of React components in the SketchQL frontend application.

## 📁 Component Structure

```
components/
├── codeGenerator/     # Code export functionality
├── DbDesign/          # ERD diagram components
├── Landing/           # Landing page components
├── Navbar/           # Navigation components
├── schema/            # Schema feature modals
└── Sidebar/          # Schema editor sidebar
```

## 🎨 Component Categories

### Schema Design Components (`DbDesign/`)

Core components for the visual ERD editor:

- **Table.jsx**: Main React Flow canvas component
  - Manages React Flow instance
  - Handles node/edge interactions
  - Auto-layout integration
  
- **TableNode.jsx**: Individual table node
  - Displays table name and columns
  - Handles selection and editing
  - Color-coded visualization
  
- **TableEdge.jsx**: Relationship connections
  - Visual relationship lines
  - Cardinality indicators
  - Animated connections
  
- **TableColumn.jsx**: Column display
  - Field name, type, constraints
  - Primary key indicators
  - Nullable/unique badges

### Schema Feature Components (`schema/`)

AI-powered and utility features:

- **RefactorModal.jsx**: AI schema refactoring
  - Diff view (original vs refactored)
  - AI explanations
  - Accept/reject functionality
  
- **MigrationPanel.jsx**: Database migration tool
  - Source/target DB selection
  - DDL preview and download
  - Type mapping summary
  
- **VersionsPanel.jsx**: Schema versioning
  - Version history
  - Version comparison
  - Restore functionality
  
- **MockDataPanel.jsx**: Mock data generator
  - Entity count controls
  - JSON/SQL export
  - Data preview tables
  
- **QueryGeneratorPanel.jsx**: Query code generator
  - Technology selection (SQL/Prisma/Mongoose)
  - Entity-based query browsing
  - Copy to clipboard
  
- **GitHubSyncPanel.jsx**: GitHub repository sync
  - Repo URL input
  - Branch and path selection
  - Schema import from code

### Code Generator Components (`codeGenerator/`)

Code export functionality:

- **CodeExportModal.jsx**: Main export modal
  - Technology selection
  - Code preview
  - Copy/download options
  
- **CodeBlock.jsx**: Syntax-highlighted code display
- **AiModal.jsx**: AI schema generation interface
- **generate*.js**: Code generation utilities
  - `generateMongoose.js`
  - `generateMySQL.js`
  - `generatePrisma.js`
  - `generateSpringBoot.js`
  - `generateJava.js`
  - `generateCSharp.js`
  - `generateFlaskSQLAlchemy.js`

### Navigation Components

- **NavBar.jsx**: Main application navigation
  - File menu with all features
  - Save/share functionality
  - Project name editing
  - AI generation button

- **Sidebar.jsx**: Schema editor sidebar
  - Table list with expand/collapse
  - Table management (add, edit, delete)
  - Column editing interface

### Landing Page Components (`Landing/`)

Marketing and public pages:

- **Hero.jsx**: Hero section
- **Features.jsx**: Feature showcase
- **Pricing.jsx**: Pricing plans
- **TechStack.jsx**: Supported technologies
- **Footer.jsx**: Site footer
- **LandingPageNavbar.jsx**: Public navigation

## 🔧 Component Patterns

### Modal Pattern

All feature modals follow this pattern:

```jsx
export default function FeatureModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" onClick={handleBackdropClick}>
      <div className="modal-dialog" onClick={stopPropagation}>
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### State Management

Components use Zustand stores:

```jsx
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';

const { nodes, edges } = useStore();
const { token } = useAuthStore();
```

### API Calls

Consistent API call pattern:

```jsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const res = await axios.post(
  `${API_URL}/api/endpoint`,
  { data },
  { headers: { 'auth-token': token } }
);
```

## 🎯 Component Usage

### Using Schema Feature Modals

```jsx
import RefactorModal from '../schema/RefactorModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>Refactor</button>
      <RefactorModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
```

### Accessing Store State

```jsx
import { useStore } from '../Store/store';

function MyComponent() {
  const nodes = useStore((state) => state.nodes);
  const loadProject = useStore((state) => state.loadProject);
  
  // Use nodes and loadProject
}
```

## 📝 Adding New Components

1. Create component file in appropriate directory
2. Follow naming convention: `PascalCase.jsx`
3. Use functional components with hooks
4. Add PropTypes or TypeScript types
5. Include error handling
6. Add loading states
7. Follow existing modal/panel patterns

Example:

```jsx
import React, { useState } from 'react';
import { useStore } from '../../Store/store';

export default function NewFeature({ isOpen, onClose }) {
  const { nodes } = useStore();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal show d-block">
      {/* Component content */}
    </div>
  );
}
```

## 🎨 Styling

- **Bootstrap 5**: Primary CSS framework
- **Custom CSS**: Component-specific styles in `App.css`
- **Inline Styles**: For dynamic styling (colors, positions)
- **React Flow**: Diagram-specific styling

## 🔮 Component Roadmap

- [ ] Component library documentation
- [ ] Storybook integration
- [ ] Unit tests for components
- [ ] Accessibility improvements
- [ ] Dark mode support
- [ ] Animation library integration

