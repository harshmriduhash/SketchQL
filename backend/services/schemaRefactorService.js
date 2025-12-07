const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Validates that a schema object has the correct structure
 * @param {Object} schema - Schema object with nodes and edges
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateSchema(schema) {
  if (!schema || typeof schema !== "object") {
    return { valid: false, error: "Schema must be an object" };
  }

  if (!Array.isArray(schema.nodes)) {
    return { valid: false, error: "Schema must have a 'nodes' array" };
  }

  if (!Array.isArray(schema.edges)) {
    return { valid: false, error: "Schema must have an 'edges' array" };
  }

  // Validate nodes structure
  for (const node of schema.nodes) {
    if (!node.id || !node.data || !node.data.label) {
      return {
        valid: false,
        error: "Each node must have 'id', 'data.label'",
      };
    }
    if (!Array.isArray(node.data.columns)) {
      return { valid: false, error: "Each node must have 'data.columns' array" };
    }
    for (const col of node.data.columns) {
      if (!col.name || !col.type) {
        return {
          valid: false,
          error: "Each column must have 'name' and 'type'",
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates the refactored schema response from LLM
 * @param {Object} response - LLM response object
 * @returns {Object} - { valid: boolean, error?: string, data?: Object }
 */
function validateRefactorResponse(response) {
  if (!response || typeof response !== "object") {
    return { valid: false, error: "Response must be an object" };
  }

  // Validate refactoredSchema
  const schemaValidation = validateSchema(response.refactoredSchema);
  if (!schemaValidation.valid) {
    return {
      valid: false,
      error: `Invalid refactoredSchema: ${schemaValidation.error}`,
    };
  }

  // Validate explanations array
  if (!Array.isArray(response.explanations)) {
    return {
      valid: false,
      error: "Response must have an 'explanations' array",
    };
  }

  for (const exp of response.explanations) {
    if (!exp.change || !exp.reason) {
      return {
        valid: false,
        error: "Each explanation must have 'change' and 'reason' fields",
      };
    }
  }

  return { valid: true, data: response };
}

/**
 * Refactors a schema using AI to improve normalization, reduce redundancy, and suggest improvements
 * @param {Object} schema - Current schema with nodes and edges
 * @param {string} goal - Optional goal (e.g., "optimize for reads", "normalize", "reduce redundancy")
 * @returns {Promise<Object>} - { refactoredSchema, explanations }
 */
async function refactorSchema(schema, goal = "") {
  try {
    // Validate input schema
    const validation = validateSchema(schema);
    if (!validation.valid) {
      throw new Error(`Invalid input schema: ${validation.error}`);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // Build the prompt
    const goalText = goal
      ? `\n\nOptimization Goal: "${goal}"`
      : "\n\nOptimize for: Better normalization, reduced redundancy, improved relationships, and appropriate indexes.";

    const prompt = `
You are an expert Database Architect specializing in schema refactoring and optimization.

CURRENT SCHEMA (JSON):
${JSON.stringify(schema, null, 2)}
${goalText}

Your task:
1. Analyze the current schema for:
   - Redundant or denormalized data
   - Missing or incorrect relationships
   - Inefficient field types
   - Missing indexes on foreign keys or frequently queried fields
   - Opportunities for normalization
   - Naming inconsistencies

2. Generate an IMPROVED schema that:
   - Maintains the same React Flow structure (nodes with id, type, position, data.label, data.columns)
   - Preserves all node IDs from the original schema
   - Keeps the same edge structure (id, source, target, sourceHandle, targetHandle, type, data.label)
   - Improves normalization where appropriate
   - Adds missing relationships
   - Suggests better field types
   - Ensures proper foreign key relationships are represented in edges

3. Provide clear explanations for each change.

You MUST return a JSON object with this exact structure:
{
  "refactoredSchema": {
    "nodes": [
      {
        "id": "table_1",
        "type": "tableNode",
        "position": { "x": 0, "y": 0 },
        "data": {
          "label": "TableName",
          "columns": [
            { "name": "id", "type": "INT", "isPK": true, "isNullable": false },
            { "name": "user_id", "type": "INT", "isPK": false, "isNullable": true }
          ]
        }
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "table_1",
        "target": "table_2",
        "sourceHandle": "user_id-right",
        "targetHandle": "id-left",
        "type": "step",
        "data": { "label": "1:N" }
      }
    ]
  },
  "explanations": [
    {
      "change": "Normalized User table by removing redundant email field",
      "reason": "Email was duplicated across multiple tables, causing data inconsistency risks"
    },
    {
      "change": "Added index on foreign key 'user_id' in Orders table",
      "reason": "Improves join performance for order queries"
    }
  ]
}

CRITICAL RULES:
- Preserve all original node IDs
- Maintain React Flow node structure exactly
- Ensure sourceHandle and targetHandle follow the pattern: "{columnName}-right" and "{columnName}-left"
- Only suggest changes that genuinely improve the schema
- If the schema is already well-designed, still provide minor optimizations or confirmations
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up JSON response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const jsonResult = JSON.parse(text);

    // Validate the response
    const responseValidation = validateRefactorResponse(jsonResult);
    if (!responseValidation.valid) {
      throw new Error(`Invalid LLM response: ${responseValidation.error}`);
    }

    return responseValidation.data;
  } catch (error) {
    console.error("Schema refactoring error:", error);
    throw new Error(
      `Failed to refactor schema: ${error.message || "Unknown error"}`
    );
  }
}

module.exports = {
  refactorSchema,
  validateSchema,
  validateRefactorResponse,
};

