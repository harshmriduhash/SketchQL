const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Standard query templates
 */
const QUERY_TEMPLATES = {
  sql: {
    create: (table, fields) => `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')});`,
    read: (table, conditions = '') => `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''};`,
    update: (table, fields, conditions) => `UPDATE ${table} SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE ${conditions};`,
    delete: (table, conditions) => `DELETE FROM ${table} WHERE ${conditions};`,
    listWithPagination: (table, page = 1, limit = 10) => `SELECT * FROM ${table} ORDER BY id LIMIT ${limit} OFFSET ${(page - 1) * limit};`,
    join: (table1, table2, on) => `SELECT * FROM ${table1} JOIN ${table2} ON ${on};`
  },
  prisma: {
    create: (model) => `await prisma.${model}.create({ data: { /* fields */ } });`,
    read: (model, conditions = '') => `await prisma.${model}.findMany(${conditions ? `{ where: ${conditions} }` : ''});`,
    update: (model, conditions) => `await prisma.${model}.update({ where: ${conditions}, data: { /* fields */ } });`,
    delete: (model, conditions) => `await prisma.${model}.delete({ where: ${conditions} });`,
    listWithPagination: (model, page = 1, limit = 10) => `await prisma.${model}.findMany({ skip: ${(page - 1) * limit}, take: ${limit} });`,
    join: (model1, model2) => `await prisma.${model1}.findMany({ include: { ${model2}: true } });`
  },
  mongoose: {
    create: (model) => `await ${model}.create({ /* fields */ });`,
    read: (model, conditions = '') => `await ${model}.find(${conditions ? conditions : ''});`,
    update: (model, conditions) => `await ${model}.updateOne(${conditions}, { /* fields */ });`,
    delete: (model, conditions) => `await ${model}.deleteOne(${conditions});`,
    listWithPagination: (model, page = 1, limit = 10) => `await ${model}.find().skip(${(page - 1) * limit}).limit(${limit});`,
    join: (model1, model2) => `await ${model1}.find().populate('${model2}');`
  }
};

/**
 * Generates queries based on schema and target type
 * @param {Object} schema - Schema with nodes and edges
 * @param {string} targetType - "sql", "prisma", or "mongoose"
 * @param {Array} queryIntents - Optional array of query intents
 * @returns {Promise<Object>} - Object with query types and generated code
 */
async function generateQueries(schema, targetType, queryIntents = []) {
  try {
    // If specific intents provided, use AI for custom queries
    if (queryIntents.length > 0) {
      return await generateCustomQueries(schema, targetType, queryIntents);
    }

    // Otherwise, generate standard CRUD queries for each entity
    const queries = {};

    schema.nodes.forEach(node => {
      const entityName = node.data.label;
      const modelName = targetType === 'sql' 
        ? entityName.toLowerCase().replace(/\s+/g, '_')
        : entityName;

      queries[entityName] = {
        create: generateCreateQuery(modelName, node, targetType),
        read: generateReadQuery(modelName, node, targetType),
        update: generateUpdateQuery(modelName, node, targetType),
        delete: generateDeleteQuery(modelName, node, targetType),
        listWithPagination: generatePaginationQuery(modelName, node, targetType),
        ...generateRelationshipQueries(modelName, node, schema, targetType)
      };
    });

    return {
      queries,
      explanations: generateExplanations(schema, targetType)
    };
  } catch (error) {
    console.error('Query generation error:', error);
    throw new Error(`Failed to generate queries: ${error.message}`);
  }
}

function generateCreateQuery(modelName, node, targetType) {
  const fields = node.data.columns.filter(c => !c.isPK || targetType !== 'sql');
  const fieldNames = fields.map(f => f.name);

  if (targetType === 'sql') {
    return QUERY_TEMPLATES.sql.create(modelName, fieldNames);
  } else if (targetType === 'prisma') {
    return QUERY_TEMPLATES.prisma.create(modelName);
  } else {
    return QUERY_TEMPLATES.mongoose.create(modelName);
  }
}

function generateReadQuery(modelName, node, targetType) {
  if (targetType === 'sql') {
    return QUERY_TEMPLATES.sql.read(modelName);
  } else if (targetType === 'prisma') {
    return QUERY_TEMPLATES.prisma.read(modelName);
  } else {
    return QUERY_TEMPLATES.mongoose.read(modelName);
  }
}

function generateUpdateQuery(modelName, node, targetType) {
  const pkField = node.data.columns.find(c => c.isPK);
  const conditions = pkField ? `${pkField.name} = ?` : 'id = ?';

  if (targetType === 'sql') {
    const fields = node.data.columns.filter(c => !c.isPK).map(c => c.name);
    return QUERY_TEMPLATES.sql.update(modelName, fields, conditions);
  } else if (targetType === 'prisma') {
    return QUERY_TEMPLATES.prisma.update(modelName, `{ ${pkField?.name || 'id'}: id }`);
  } else {
    return QUERY_TEMPLATES.mongoose.update(modelName, `{ ${pkField?.name || '_id'}: id }`);
  }
}

function generateDeleteQuery(modelName, node, targetType) {
  const pkField = node.data.columns.find(c => c.isPK);
  const conditions = pkField ? `${pkField.name} = ?` : 'id = ?';

  if (targetType === 'sql') {
    return QUERY_TEMPLATES.sql.delete(modelName, conditions);
  } else if (targetType === 'prisma') {
    return QUERY_TEMPLATES.prisma.delete(modelName, `{ ${pkField?.name || 'id'}: id }`);
  } else {
    return QUERY_TEMPLATES.mongoose.delete(modelName, `{ ${pkField?.name || '_id'}: id }`);
  }
}

function generatePaginationQuery(modelName, node, targetType) {
  if (targetType === 'sql') {
    return QUERY_TEMPLATES.sql.listWithPagination(modelName);
  } else if (targetType === 'prisma') {
    return QUERY_TEMPLATES.prisma.listWithPagination(modelName);
  } else {
    return QUERY_TEMPLATES.mongoose.listWithPagination(modelName);
  }
}

function generateRelationshipQueries(modelName, node, schema, targetType) {
  const relationshipQueries = {};
  
  schema.edges.forEach(edge => {
    if (edge.source === node.id) {
      const targetNode = schema.nodes.find(n => n.id === edge.target);
      if (targetNode) {
        const targetModel = targetType === 'sql' 
          ? targetNode.data.label.toLowerCase().replace(/\s+/g, '_')
          : targetNode.data.label;

        if (targetType === 'sql') {
          const fkColumn = edge.sourceHandle.replace('-right', '').replace('-left', '');
          const pkColumn = edge.targetHandle.replace('-left', '').replace('-right', '');
          relationshipQueries[`join_${targetModel}`] = 
            QUERY_TEMPLATES.sql.join(modelName, targetModel, `${modelName}.${fkColumn} = ${targetModel}.${pkColumn}`);
        } else if (targetType === 'prisma') {
          relationshipQueries[`include_${targetModel}`] = 
            QUERY_TEMPLATES.prisma.join(modelName, targetModel);
        } else {
          relationshipQueries[`populate_${targetModel}`] = 
            QUERY_TEMPLATES.mongoose.join(modelName, targetModel);
        }
      }
    }
  });

  return relationshipQueries;
}

function generateExplanations(schema, targetType) {
  return [
    {
      queryType: 'CRUD Operations',
      explanation: `Standard Create, Read, Update, Delete operations for each entity in ${targetType} syntax.`
    },
    {
      queryType: 'Pagination',
      explanation: `Queries to fetch data with pagination support (skip/take or LIMIT/OFFSET).`
    },
    {
      queryType: 'Relationships',
      explanation: `Queries to fetch related data using ${targetType === 'sql' ? 'JOINs' : targetType === 'prisma' ? 'include' : 'populate'}.`
    }
  ];
}

async function generateCustomQueries(schema, targetType, queryIntents) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
You are a query generation expert. Generate ${targetType} queries based on the following schema and requirements.

SCHEMA:
${JSON.stringify(schema, null, 2)}

QUERY INTENTS:
${queryIntents.join('\n')}

TARGET TYPE: ${targetType}

Generate queries that:
1. Match the query intents exactly
2. Use proper ${targetType} syntax
3. Include all necessary fields and relationships
4. Are production-ready and optimized

Return a JSON object with this structure:
{
  "queries": {
    "intent_name": {
      "code": "actual query code",
      "explanation": "what this query does"
    }
  }
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.warn('AI query generation failed, using templates:', error);
    return generateQueries(schema, targetType, []);
  }
}

module.exports = {
  generateQueries
};

