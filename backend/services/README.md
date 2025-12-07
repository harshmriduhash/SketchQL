# Backend Services

Business logic and AI-powered services for SketchQL. All services are modular, reusable, and handle their own error cases.

## 📁 Services Overview

### AI-Powered Services

#### `schemaRefactorService.js`
**Purpose**: AI-powered schema refactoring and optimization

**Main Functions**:
- `refactorSchema(schema, goal)`: Analyzes schema and returns optimized version with explanations
- `validateSchema(schema)`: Validates schema structure
- `validateRefactorResponse(response)`: Validates AI response format

**Usage**:
```javascript
const { refactorSchema } = require('./schemaRefactorService');
const result = await refactorSchema(schema, 'optimize for reads');
// Returns: { refactoredSchema, explanations }
```

**Features**:
- Normalization suggestions
- Redundancy reduction
- Relationship improvements
- Index recommendations

---

#### `migrationService.js`
**Purpose**: Convert schemas between different database types

**Main Functions**:
- `migrateSchema(schema, sourceDbType, targetDbType)`: Converts schema and generates DDL
- `migrateWithMapping()`: Direct type mapping (fast)
- `migrateWithAI()`: AI-assisted migration (complex cases)

**Supported Types**:
- MongoDB
- PostgreSQL
- MySQL
- SQL Server

**Usage**:
```javascript
const { migrateSchema } = require('./migrationService');
const result = await migrateSchema(schema, 'mongo', 'postgres');
// Returns: { targetDDL, mappingSummary }
```

**Type Mappings**:
- Comprehensive type mapping tables for common conversions
- AI fallback for complex or unsupported mappings
- Automatic foreign key handling

---

#### `mockDataService.js`
**Purpose**: Generate realistic mock data from schemas

**Main Functions**:
- `generateMockData(schema, entityCounts, useAI)`: Generates mock data
- `generateSQLInserts(mockData, schema)`: Converts to SQL INSERT statements
- `enhanceWithAI()`: AI enhancement for domain-specific values

**Usage**:
```javascript
const { generateMockData, generateSQLInserts } = require('./mockDataService');
const data = await generateMockData(schema, { Users: 50, Orders: 200 }, false);
const sql = generateSQLInserts(data, schema);
```

**Features**:
- Smart field type detection (email, name, date, etc.)
- Referential integrity (foreign keys)
- Optional AI enhancement
- JSON and SQL output formats

---

#### `queryGeneratorService.js`
**Purpose**: Generate query code for different technologies

**Main Functions**:
- `generateQueries(schema, targetType, queryIntents)`: Generates queries
- Template-based generation for standard queries
- AI generation for custom query intents

**Supported Targets**:
- SQL (raw SQL)
- Prisma (TypeScript)
- Mongoose (JavaScript)

**Query Types**:
- Create (INSERT)
- Read (SELECT)
- Update
- Delete
- List with Pagination
- Joins/Includes/Populates

**Usage**:
```javascript
const { generateQueries } = require('./queryGeneratorService');
const result = await generateQueries(schema, 'prisma', []);
// Returns: { queries: { EntityName: { create, read, ... } }, explanations }
```

---

### Utility Services

#### `versionService.js`
**Purpose**: Schema versioning and diff management

**Main Functions**:
- `createVersion(projectId, schemaJSON, userId, label, message)`: Create new version
- `getVersions(projectId)`: Get all versions for a project
- `getVersion(versionId)`: Get specific version
- `computeDiff(schema1, schema2)`: Compute differences between schemas

**Usage**:
```javascript
const { createVersion, computeDiff } = require('./versionService');
const version = await createVersion(projectId, schema, userId, 'v1.0', 'Initial schema');
const diff = computeDiff(oldSchema, newSchema);
```

**Diff Structure**:
```javascript
{
  nodes: { added: [], removed: [], modified: [] },
  edges: { added: [], removed: [], modified: [] }
}
```

---

#### `githubParserService.js`
**Purpose**: Parse database models from GitHub repositories

**Main Functions**:
- `parseModels(files)`: Parse array of file objects
- `detectParserType(content)`: Auto-detect parser type

**Supported Parsers**:
- `PrismaParser`: Prisma schema files (.prisma)
- `MongooseParser`: Mongoose model files (.js, .ts)
- `SequelizeParser`: Sequelize model files (.js, .ts)

**Usage**:
```javascript
const { parseModels } = require('./githubParserService');
const files = [
  { path: 'schema.prisma', content: '...' },
  { path: 'models/User.js', content: '...' }
];
const schema = parseModels(files);
// Returns: { nodes, edges }
```

**Parser Architecture**:
- Base parser class for extensibility
- Individual parsers for each framework
- Automatic type mapping to SketchQL format

---

## 🔧 Service Patterns

### Error Handling
All services follow consistent error handling:
```javascript
try {
  // Service logic
} catch (error) {
  console.error('Service error:', error);
  throw new Error(`User-friendly error message: ${error.message}`);
}
```

### Validation
Services validate inputs before processing:
- Schema structure validation
- Type checking
- Required field validation

### AI Integration
AI services use Google Gemini API:
- Consistent prompt engineering
- JSON response parsing
- Fallback to template-based approaches
- Error recovery

### Response Format
All services return consistent structures:
- Success: `{ data, ...metadata }`
- Errors: Thrown as Error objects with messages

## 🧪 Testing Services

```javascript
// Example test structure
const service = require('./serviceName');

describe('ServiceName', () => {
  it('should handle valid input', async () => {
    const result = await service.mainFunction(validInput);
    expect(result).toHaveProperty('data');
  });

  it('should throw on invalid input', async () => {
    await expect(service.mainFunction(invalidInput))
      .rejects.toThrow();
  });
});
```

## 📝 Adding New Services

1. Create new service file in `/services`
2. Export main functions
3. Add JSDoc comments
4. Implement error handling
5. Add validation
6. Update this README

Example:
```javascript
/**
 * Service description
 * @param {Type} param - Parameter description
 * @returns {Promise<Object>} Result description
 */
async function serviceFunction(param) {
  // Validation
  if (!param) {
    throw new Error('Parameter required');
  }

  try {
    // Service logic
    return { data: result };
  } catch (error) {
    console.error('Service error:', error);
    throw new Error(`Service failed: ${error.message}`);
  }
}

module.exports = { serviceFunction };
```

## 🔮 Future Services

- [ ] Documentation generator service
- [ ] Performance analysis service
- [ ] Schema validation service (advanced)
- [ ] API endpoint generator service
- [ ] Database connection tester
- [ ] Schema comparison service (advanced diff)

