const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates realistic mock data based on field type
 */
function generateMockValue(field, entityName) {
  const fieldName = field.name.toLowerCase();
  const fieldType = field.type.toUpperCase();

  // Email fields
  if (fieldName.includes('email')) {
    return `user${Math.floor(Math.random() * 10000)}@example.com`;
  }

  // Name fields
  if (fieldName.includes('name') || fieldName.includes('username')) {
    const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    if (fieldName.includes('first')) {
      return names[Math.floor(Math.random() * names.length)];
    }
    if (fieldName.includes('last') || fieldName.includes('surname')) {
      return surnames[Math.floor(Math.random() * surnames.length)];
    }
    return `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
  }

  // Date fields
  if (fieldType.includes('DATE') || fieldType.includes('TIMESTAMP')) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  // Boolean fields
  if (fieldType === 'BOOLEAN' || fieldType === 'BIT') {
    return Math.random() > 0.5;
  }

  // Number fields
  if (fieldType === 'INT' || fieldType === 'INTEGER' || fieldType === 'BIGINT') {
    if (fieldName.includes('id') && !field.isPK) {
      // Foreign key - return a random ID (will be replaced with actual FK later)
      return Math.floor(Math.random() * 100) + 1;
    }
    if (fieldName.includes('age')) {
      return Math.floor(Math.random() * 50) + 18;
    }
    if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('cost')) {
      return (Math.random() * 1000).toFixed(2);
    }
    return Math.floor(Math.random() * 1000);
  }

  // Float/Double fields
  if (fieldType === 'FLOAT' || fieldType === 'DOUBLE' || fieldType === 'DECIMAL') {
    return (Math.random() * 1000).toFixed(2);
  }

  // String/VARCHAR fields
  if (fieldType.includes('VARCHAR') || fieldType === 'TEXT' || fieldType === 'STRING') {
    if (fieldName.includes('phone')) {
      return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    }
    if (fieldName.includes('address')) {
      const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'Elm St', 'Maple Dr'];
      return `${Math.floor(Math.random() * 9999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`;
    }
    if (fieldName.includes('city')) {
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
      return cities[Math.floor(Math.random() * cities.length)];
    }
    if (fieldName.includes('country')) {
      return 'USA';
    }
    if (fieldName.includes('zip') || fieldName.includes('postal')) {
      return `${Math.floor(Math.random() * 90000) + 10000}`;
    }
    // Generic string
    return `Sample ${fieldName} ${Math.floor(Math.random() * 100)}`;
  }

  // Default
  return `mock_${fieldName}_${Math.floor(Math.random() * 100)}`;
}

/**
 * Generates mock data for a schema
 * @param {Object} schema - Schema with nodes and edges
 * @param {Object} entityCounts - Object mapping entity names to counts
 * @param {boolean} useAI - Whether to use AI for domain-specific values
 * @returns {Promise<Object>} - Object with entity names as keys and arrays of data as values
 */
async function generateMockData(schema, entityCounts = {}, useAI = false) {
  try {
    const result = {};

    // Determine counts for each entity
    schema.nodes.forEach(node => {
      const entityName = node.data.label;
      const count = entityCounts[entityName] || entityCounts[entityName.toLowerCase()] || 10;
      
      result[entityName] = [];
      
      for (let i = 0; i < count; i++) {
        const record = {};
        
        node.data.columns.forEach(col => {
          // Skip primary key if it's auto-increment
          if (col.isPK && (col.type === 'INT' || col.type === 'BIGINT')) {
            record[col.name] = i + 1;
          } else {
            record[col.name] = generateMockValue(col, entityName);
          }
        });
        
        result[entityName].push(record);
      }
    });

    // Handle foreign key relationships
    schema.edges.forEach(edge => {
      const sourceNode = schema.nodes.find(n => n.id === edge.source);
      const targetNode = schema.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceEntity = sourceNode.data.label;
        const targetEntity = targetNode.data.label;
        const fkColumn = edge.sourceHandle.replace('-right', '').replace('-left', '');
        
        // Get target IDs
        const targetIds = result[targetEntity]?.map((_, idx) => idx + 1) || [];
        
        // Update source records with valid foreign keys
        if (result[sourceEntity]) {
          result[sourceEntity].forEach(record => {
            if (record[fkColumn] !== undefined) {
              record[fkColumn] = targetIds[Math.floor(Math.random() * targetIds.length)] || null;
            }
          });
        }
      }
    });

    // Use AI to enhance data if requested
    if (useAI && Object.keys(result).length > 0) {
      try {
        const enhanced = await enhanceWithAI(schema, result);
        return enhanced;
      } catch (error) {
        console.warn('AI enhancement failed, using basic mock data:', error);
        return result;
      }
    }

    return result;
  } catch (error) {
    console.error('Mock data generation error:', error);
    throw new Error(`Failed to generate mock data: ${error.message}`);
  }
}

/**
 * Enhances mock data using AI for more realistic domain-specific values
 */
async function enhanceWithAI(schema, basicData) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
You are a data generation expert. Enhance the following mock data to be more realistic and domain-appropriate.

SCHEMA:
${JSON.stringify(schema, null, 2)}

CURRENT MOCK DATA:
${JSON.stringify(basicData, null, 2)}

Your task:
1. Make the data more realistic and domain-appropriate
2. Ensure relationships between entities make sense
3. Keep the same structure and field names
4. Maintain referential integrity (foreign keys should reference valid IDs)

Return the enhanced data in the same JSON structure.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const enhanced = JSON.parse(text);

    return enhanced;
  } catch (error) {
    console.warn('AI enhancement failed:', error);
    return basicData;
  }
}

/**
 * Converts mock data to SQL INSERT statements
 */
function generateSQLInserts(mockData, schema) {
  const statements = [];

  schema.nodes.forEach(node => {
    const tableName = node.data.label.toLowerCase().replace(/\s+/g, '_');
    const records = mockData[node.data.label] || [];

    if (records.length === 0) return;

    records.forEach(record => {
      const columns = Object.keys(record).join(', ');
      const values = Object.values(record).map(val => {
        if (typeof val === 'string') {
          return `'${val.replace(/'/g, "''")}'`;
        }
        if (val === null) {
          return 'NULL';
        }
        return val;
      }).join(', ');

      statements.push(`INSERT INTO ${tableName} (${columns}) VALUES (${values});`);
    });
  });

  return statements.join('\n');
}

module.exports = {
  generateMockData,
  generateSQLInserts
};

