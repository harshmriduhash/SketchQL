const router = require("express").Router();
const fetchUser = require("../middleware/fetchUser");
const { refactorSchema } = require("../services/schemaRefactorService");
const { migrateSchema } = require("../services/migrationService");
const { generateMockData, generateSQLInserts } = require("../services/mockDataService");
const { generateQueries } = require("../services/queryGeneratorService");

/**
 * POST /api/schema/refactor
 * Refactors a schema using AI to improve normalization and reduce redundancy
 * 
 * Body: {
 *   schema: { nodes: [], edges: [] },
 *   goal?: string (optional optimization goal)
 * }
 */
router.post("/refactor", fetchUser, async (req, res) => {
  try {
    const { schema, goal } = req.body;

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: "Schema is required",
      });
    }

    const result = await refactorSchema(schema, goal || "");

    res.json({
      success: true,
      data: {
        refactoredSchema: result.refactoredSchema,
        explanations: result.explanations,
      },
    });
  } catch (error) {
    console.error("Refactor endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to refactor schema",
    });
  }
});

/**
 * POST /api/schema/migrate
 * Migrates a schema from one database type to another
 * 
 * Body: {
 *   schema: { nodes: [], edges: [] },
 *   sourceDbType: string (e.g., "mongo", "postgres", "mysql", "sql"),
 *   targetDbType: string
 * }
 */
router.post("/migrate", fetchUser, async (req, res) => {
  try {
    const { schema, sourceDbType, targetDbType } = req.body;

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: "Schema is required",
      });
    }

    if (!sourceDbType || !targetDbType) {
      return res.status(400).json({
        success: false,
        error: "sourceDbType and targetDbType are required",
      });
    }

    const result = await migrateSchema(schema, sourceDbType, targetDbType);

    res.json({
      success: true,
      data: {
        targetDDL: result.targetDDL,
        mappingSummary: result.mappingSummary,
      },
    });
  } catch (error) {
    console.error("Migration endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to migrate schema",
    });
  }
});

/**
 * POST /api/schema/mock-data
 * Generates mock data based on schema
 * 
 * Body: {
 *   schema: { nodes: [], edges: [] },
 *   entityCounts: { "EntityName": count, ... },
 *   useAI: boolean (optional, default false),
 *   format: "json" | "sql" (optional, default "json")
 * }
 */
router.post("/mock-data", fetchUser, async (req, res) => {
  try {
    const { schema, entityCounts = {}, useAI = false, format = "json" } = req.body;

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: "Schema is required",
      });
    }

    const mockData = await generateMockData(schema, entityCounts, useAI);

    let result;
    if (format === "sql") {
      const sqlInserts = generateSQLInserts(mockData, schema);
      result = {
        format: "sql",
        data: sqlInserts
      };
    } else {
      result = {
        format: "json",
        data: mockData
      };
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Mock data endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate mock data",
    });
  }
});

/**
 * POST /api/schema/queries
 * Generates queries based on schema
 * 
 * Body: {
 *   schema: { nodes: [], edges: [] },
 *   targetType: "sql" | "prisma" | "mongoose",
 *   queryIntents: string[] (optional)
 * }
 */
router.post("/queries", fetchUser, async (req, res) => {
  try {
    const { schema, targetType, queryIntents = [] } = req.body;

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: "Schema is required",
      });
    }

    if (!targetType || !['sql', 'prisma', 'mongoose'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: "targetType must be 'sql', 'prisma', or 'mongoose'",
      });
    }

    const result = await generateQueries(schema, targetType, queryIntents);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Query generation endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate queries",
    });
  }
});

module.exports = router;

