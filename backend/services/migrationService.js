const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Type mapping tables for common database migrations
 */
const TYPE_MAPPINGS = {
  mongo: {
    to: {
      postgres: {
        'String': 'VARCHAR(255)',
        'Number': 'INTEGER',
        'Date': 'TIMESTAMP',
        'Boolean': 'BOOLEAN',
        'ObjectId': 'UUID',
        'Array': 'JSONB',
        'Object': 'JSONB',
        'Mixed': 'TEXT'
      },
      mysql: {
        'String': 'VARCHAR(255)',
        'Number': 'INT',
        'Date': 'DATETIME',
        'Boolean': 'TINYINT(1)',
        'ObjectId': 'VARCHAR(36)',
        'Array': 'JSON',
        'Object': 'JSON',
        'Mixed': 'TEXT'
      },
      sql: {
        'String': 'NVARCHAR(255)',
        'Number': 'INT',
        'Date': 'DATETIME2',
        'Boolean': 'BIT',
        'ObjectId': 'UNIQUEIDENTIFIER',
        'Array': 'NVARCHAR(MAX)',
        'Object': 'NVARCHAR(MAX)',
        'Mixed': 'NVARCHAR(MAX)'
      }
    }
  },
  postgres: {
    to: {
      mongo: {
        'VARCHAR': 'String',
        'TEXT': 'String',
        'INTEGER': 'Number',
        'BIGINT': 'Number',
        'SMALLINT': 'Number',
        'DECIMAL': 'Number',
        'NUMERIC': 'Number',
        'REAL': 'Number',
        'DOUBLE PRECISION': 'Number',
        'BOOLEAN': 'Boolean',
        'DATE': 'Date',
        'TIMESTAMP': 'Date',
        'TIMESTAMPTZ': 'Date',
        'UUID': 'ObjectId',
        'JSONB': 'Object',
        'JSON': 'Object',
        'ARRAY': 'Array'
      },
      mysql: {
        'VARCHAR': 'VARCHAR',
        'TEXT': 'TEXT',
        'INTEGER': 'INT',
        'BIGINT': 'BIGINT',
        'SMALLINT': 'SMALLINT',
        'DECIMAL': 'DECIMAL',
        'NUMERIC': 'DECIMAL',
        'REAL': 'FLOAT',
        'DOUBLE PRECISION': 'DOUBLE',
        'BOOLEAN': 'TINYINT(1)',
        'DATE': 'DATE',
        'TIMESTAMP': 'DATETIME',
        'TIMESTAMPTZ': 'DATETIME',
        'UUID': 'VARCHAR(36)',
        'JSONB': 'JSON',
        'JSON': 'JSON',
        'ARRAY': 'JSON'
      }
    }
  },
  mysql: {
    to: {
      mongo: {
        'VARCHAR': 'String',
        'TEXT': 'String',
        'INT': 'Number',
        'BIGINT': 'Number',
        'SMALLINT': 'Number',
        'DECIMAL': 'Number',
        'FLOAT': 'Number',
        'DOUBLE': 'Number',
        'TINYINT(1)': 'Boolean',
        'BOOLEAN': 'Boolean',
        'DATE': 'Date',
        'DATETIME': 'Date',
        'TIMESTAMP': 'Date',
        'JSON': 'Object',
        'CHAR': 'String'
      },
      postgres: {
        'VARCHAR': 'VARCHAR',
        'TEXT': 'TEXT',
        'INT': 'INTEGER',
        'BIGINT': 'BIGINT',
        'SMALLINT': 'SMALLINT',
        'DECIMAL': 'DECIMAL',
        'FLOAT': 'REAL',
        'DOUBLE': 'DOUBLE PRECISION',
        'TINYINT(1)': 'BOOLEAN',
        'BOOLEAN': 'BOOLEAN',
        'DATE': 'DATE',
        'DATETIME': 'TIMESTAMP',
        'TIMESTAMP': 'TIMESTAMP',
        'JSON': 'JSONB',
        'CHAR': 'CHAR'
      }
    }
  }
};

/**
 * Converts SketchQL schema format to target database DDL
 * @param {Object} schema - Schema with nodes and edges
 * @param {string} sourceDbType - Source database type
 * @param {string} targetDbType - Target database type
 * @returns {Promise<Object>} - { targetDDL, mappingSummary }
 */
async function migrateSchema(schema, sourceDbType, targetDbType) {
  try {
    // Normalize database type names
    const normalizedSource = normalizeDbType(sourceDbType);
    const normalizedTarget = normalizeDbType(targetDbType);

    if (normalizedSource === normalizedTarget) {
      throw new Error('Source and target database types cannot be the same');
    }

    // Check if we have a direct mapping
    const hasDirectMapping = TYPE_MAPPINGS[normalizedSource]?.to?.[normalizedTarget];

    // Use AI for complex migrations or when direct mapping is insufficient
    const useAI = !hasDirectMapping || needsAIAssistance(schema, normalizedSource, normalizedTarget);

    if (useAI) {
      return await migrateWithAI(schema, normalizedSource, normalizedTarget);
    } else {
      return await migrateWithMapping(schema, normalizedSource, normalizedTarget);
    }
  } catch (error) {
    console.error('Migration error:', error);
    throw new Error(`Failed to migrate schema: ${error.message}`);
  }
}

/**
 * Normalizes database type names
 */
function normalizeDbType(dbType) {
  const normalized = dbType.toLowerCase();
  if (normalized.includes('mongo')) return 'mongo';
  if (normalized.includes('postgres') || normalized.includes('postgresql')) return 'postgres';
  if (normalized.includes('mysql')) return 'mysql';
  if (normalized.includes('sql') && !normalized.includes('mysql')) return 'sql';
  return normalized;
}

/**
 * Determines if AI assistance is needed for migration
 */
function needsAIAssistance(schema, sourceType, targetType) {
  // Use AI for complex schemas or when going to/from MongoDB
  if (sourceType === 'mongo' || targetType === 'mongo') {
    return true;
  }
  // Use AI if schema has many relationships or complex structures
  if (schema.edges.length > 10 || schema.nodes.length > 15) {
    return true;
  }
  return false;
}

/**
 * Migrates schema using direct type mapping
 */
function migrateWithMapping(schema, sourceType, targetType) {
  const mapping = TYPE_MAPPINGS[sourceType].to[targetType];
  const ddlStatements = [];
  const mappingSummary = [];

  schema.nodes.forEach(node => {
    const tableName = node.data.label.toLowerCase().replace(/\s+/g, '_');
    let ddl = `CREATE TABLE ${tableName} (\n`;

    const columns = [];
    const constraints = [];

    node.data.columns.forEach(col => {
      const sourceType = col.type.toUpperCase();
      let mappedType = mapping[sourceType] || 'VARCHAR(255)';

      // Handle special cases for primary keys
      if (col.isPK) {
        if (targetType === 'postgres') {
          mappedType = 'SERIAL';
        } else if (targetType === 'mysql') {
          mappedType = 'INT AUTO_INCREMENT';
        } else if (targetType === 'sql') {
          mappedType = 'INT IDENTITY(1,1)';
        } else {
          mappedType = 'INT';
        }
      }

      let colDef = `  ${col.name} ${mappedType}`;
      
      if (!col.isNullable && !col.isPK) {
        colDef += ' NOT NULL';
      }

      if (col.isUnique && !col.isPK) {
        constraints.push(`  UNIQUE (${col.name})`);
      }

      columns.push(colDef);
      mappingSummary.push({
        table: node.data.label,
        column: col.name,
        sourceType: sourceType,
        targetType: mappedType,
        reason: 'Direct type mapping'
      });
    });

    // Add foreign keys from edges
    schema.edges.forEach(edge => {
      if (edge.source === node.id) {
        const sourceHandle = edge.sourceHandle.replace('-right', '').replace('-left', '');
        const targetNode = schema.nodes.find(n => n.id === edge.target);
        if (targetNode) {
          const targetTable = targetNode.data.label.toLowerCase().replace(/\s+/g, '_');
          const targetCol = edge.targetHandle.replace('-left', '').replace('-right', '');
          constraints.push(`  FOREIGN KEY (${sourceHandle}) REFERENCES ${targetTable}(${targetCol})`);
        }
      }
    });

    ddl += columns.join(',\n');
    if (constraints.length > 0) {
      ddl += ',\n' + constraints.join(',\n');
    }
    ddl += '\n);\n';

    ddlStatements.push(ddl);
  });

  return {
    targetDDL: ddlStatements.join('\n'),
    mappingSummary
  };
}

/**
 * Migrates schema using AI for complex cases
 */
async function migrateWithAI(schema, sourceType, targetType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
You are a database migration expert. Convert the following database schema from ${sourceType} to ${targetType}.

SOURCE SCHEMA (${sourceType}):
${JSON.stringify(schema, null, 2)}

TARGET DATABASE: ${targetType}

Your task:
1. Convert the schema to ${targetType} DDL (Data Definition Language)
2. Map data types appropriately
3. Handle relationships and foreign keys
4. Preserve constraints (primary keys, unique, nullable)
5. Generate proper CREATE TABLE statements

You MUST return a JSON object with this exact structure:
{
  "targetDDL": "CREATE TABLE users (...);\\nCREATE TABLE orders (...);",
  "mappingSummary": [
    {
      "table": "Users",
      "column": "email",
      "sourceType": "VARCHAR",
      "targetType": "TEXT",
      "reason": "PostgreSQL uses TEXT for variable-length strings"
    }
  ]
}

IMPORTANT:
- Generate valid ${targetType} DDL syntax
- Include all tables from the schema
- Preserve all relationships
- Add appropriate indexes for foreign keys
- Use proper ${targetType} data types
- Explain type mappings in mappingSummary
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonResult = JSON.parse(text);

    // Validate response
    if (!jsonResult.targetDDL || !Array.isArray(jsonResult.mappingSummary)) {
      throw new Error('Invalid AI response structure');
    }

    return jsonResult;
  } catch (error) {
    console.error('AI migration error:', error);
    // Fallback to direct mapping if AI fails
    return migrateWithMapping(schema, sourceType, targetType);
  }
}

module.exports = {
  migrateSchema,
  TYPE_MAPPINGS
};

