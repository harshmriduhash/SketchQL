/**
 * GitHub Parser Service
 * Parses model files from GitHub repositories to extract schema information
 */

/**
 * Base parser interface
 */
class BaseParser {
  parse(content) {
    throw new Error('parse() must be implemented by subclass');
  }
}

/**
 * Prisma Schema Parser
 */
class PrismaParser extends BaseParser {
  parse(content) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Match model definitions
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let modelMatch;

    while ((modelMatch = modelRegex.exec(content)) !== null) {
      const modelName = modelMatch[1];
      const modelBody = modelMatch[2];

      const columns = [];
      const relations = [];

      // Parse fields
      const fieldRegex = /(\w+)\s+(\w+(?:\[\])?)\s*(.*)/g;
      let fieldMatch;

      while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const attributes = fieldMatch[3] || '';

        const isPK = attributes.includes('@id');
        const isUnique = attributes.includes('@unique');
        const isNullable = !attributes.includes('@required') && !fieldType.includes('[]');
        const isArray = fieldType.includes('[]');

        // Check for relations
        if (attributes.includes('@relation') || fieldType.match(/^\w+$/)) {
          const relationMatch = attributes.match(/@relation\([^)]*fields:\s*\[([^\]]+)\]/);
          if (relationMatch) {
            relations.push({
              field: fieldName,
              type: fieldType.replace('[]', ''),
              isArray: isArray
            });
          }
        }

        columns.push({
          name: fieldName,
          type: this.mapPrismaType(fieldType),
          isPK,
          isNullable,
          isUnique
        });
      }

      const nodeId = `table_${nodes.length + 1}`;
      nodeMap.set(modelName, nodeId);

      nodes.push({
        id: nodeId,
        type: 'tableNode',
        position: { x: 0, y: 0 },
        data: {
          label: modelName,
          columns
        }
      });
    }

    // Parse relations
    const relationRegex = /@relation\([^)]*fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]/g;
    let relationMatch;

    while ((relationMatch = relationRegex.exec(content)) !== null) {
      // This is a simplified relation parser
      // Full implementation would need more context
    }

    return { nodes, edges };
  }

  mapPrismaType(type) {
    const typeMap = {
      'String': 'VARCHAR',
      'Int': 'INT',
      'BigInt': 'BIGINT',
      'Float': 'FLOAT',
      'Decimal': 'DECIMAL',
      'Boolean': 'BOOLEAN',
      'DateTime': 'DATETIME',
      'Date': 'DATE',
      'Json': 'JSON',
      'Bytes': 'BLOB'
    };

    const cleanType = type.replace('[]', '');
    return typeMap[cleanType] || 'VARCHAR';
  }
}

/**
 * Mongoose Schema Parser
 */
class MongooseParser extends BaseParser {
  parse(content) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Match schema definitions
    const schemaRegex = /(?:const|let|var)\s+(\w+)Schema\s*=\s*new\s+mongoose\.Schema\(/g;
    let schemaMatch;

    while ((schemaMatch = schemaRegex.exec(content)) !== null) {
      const schemaName = schemaMatch[1];
      const modelName = schemaName.replace('Schema', '');

      // Extract schema definition
      const schemaStart = schemaMatch.index + schemaMatch[0].length;
      let braceCount = 1;
      let schemaEnd = schemaStart;
      
      while (braceCount > 0 && schemaEnd < content.length) {
        if (content[schemaEnd] === '{') braceCount++;
        if (content[schemaEnd] === '}') braceCount--;
        schemaEnd++;
      }

      const schemaBody = content.substring(schemaStart, schemaEnd - 1);
      const columns = [];

      // Parse fields
      const fieldRegex = /(\w+):\s*\{[^}]*type:\s*mongoose\.Schema\.Types\.(\w+)/g;
      let fieldMatch;

      while ((fieldMatch = fieldRegex.exec(schemaBody)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];

        const isRef = schemaBody.includes(`ref:`) && schemaBody.indexOf(fieldName) < schemaBody.indexOf('ref:');
        const isRequired = schemaBody.includes(`required: true`) && 
                          schemaBody.indexOf(fieldName) < schemaBody.indexOf('required: true');

        columns.push({
          name: fieldName,
          type: this.mapMongooseType(fieldType),
          isPK: fieldName === '_id' || fieldName === 'id',
          isNullable: !isRequired,
          isUnique: schemaBody.includes(`unique: true`) && 
                   schemaBody.indexOf(fieldName) < schemaBody.indexOf('unique: true')
        });
      }

      const nodeId = `table_${nodes.length + 1}`;
      nodeMap.set(modelName, nodeId);

      nodes.push({
        id: nodeId,
        type: 'tableNode',
        position: { x: 0, y: 0 },
        data: {
          label: modelName,
          columns
        }
      });
    }

    return { nodes, edges };
  }

  mapMongooseType(type) {
    const typeMap = {
      'String': 'VARCHAR',
      'Number': 'INT',
      'Date': 'DATETIME',
      'Boolean': 'BOOLEAN',
      'ObjectId': 'VARCHAR',
      'Array': 'TEXT',
      'Mixed': 'TEXT'
    };

    return typeMap[type] || 'VARCHAR';
  }
}

/**
 * Sequelize Parser (basic implementation)
 */
class SequelizeParser extends BaseParser {
  parse(content) {
    // Basic Sequelize model parsing
    // This is a simplified version
    const nodes = [];
    const edges = [];

    // Match model definitions
    const modelRegex = /sequelize\.define\(['"]([^'"]+)['"]/g;
    let modelMatch;

    while ((modelMatch = modelRegex.exec(content)) !== null) {
      const modelName = modelMatch[1];
      
      nodes.push({
        id: `table_${nodes.length + 1}`,
        type: 'tableNode',
        position: { x: 0, y: 0 },
        data: {
          label: modelName,
          columns: []
        }
      });
    }

    return { nodes, edges };
  }
}

/**
 * Detects parser type from file content
 */
function detectParserType(content) {
  if (content.includes('prisma') && content.includes('model')) {
    return 'prisma';
  }
  if (content.includes('mongoose.Schema')) {
    return 'mongoose';
  }
  if (content.includes('sequelize.define')) {
    return 'sequelize';
  }
  return null;
}

/**
 * Parses model files and returns schema
 * @param {Array} files - Array of { path, content } objects
 * @returns {Object} - Schema with nodes and edges
 */
function parseModels(files) {
  const allNodes = [];
  const allEdges = [];
  const nodeIdMap = new Map();
  let nodeCounter = 1;

  files.forEach(file => {
    const parserType = detectParserType(file.content);
    let parser;

    switch (parserType) {
      case 'prisma':
        parser = new PrismaParser();
        break;
      case 'mongoose':
        parser = new MongooseParser();
        break;
      case 'sequelize':
        parser = new SequelizeParser();
        break;
      default:
        console.warn(`Unknown parser type for file: ${file.path}`);
        return;
    }

    try {
      const { nodes, edges } = parser.parse(file.content);
      
      nodes.forEach(node => {
        const existingNode = allNodes.find(n => n.data.label === node.data.label);
        if (!existingNode) {
          const newNode = {
            ...node,
            id: `table_${nodeCounter++}`,
            position: { 
              x: (allNodes.length % 3) * 400, 
              y: Math.floor(allNodes.length / 3) * 300 
            }
          };
          allNodes.push(newNode);
          nodeIdMap.set(node.data.label, newNode.id);
        }
      });

      edges.forEach(edge => {
        // Map edge source/target to actual node IDs
        const mappedEdge = {
          ...edge,
          source: nodeIdMap.get(edge.source) || edge.source,
          target: nodeIdMap.get(edge.target) || edge.target
        };
        allEdges.push(mappedEdge);
      });
    } catch (error) {
      console.error(`Error parsing file ${file.path}:`, error);
    }
  });

  return { nodes: allNodes, edges: allEdges };
}

module.exports = {
  parseModels,
  PrismaParser,
  MongooseParser,
  SequelizeParser,
  detectParserType
};

