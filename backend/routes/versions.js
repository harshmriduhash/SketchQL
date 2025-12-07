const router = require("express").Router();
const fetchUser = require("../middleware/fetchUser");
const { createVersion, getVersions, getVersion, computeDiff } = require("../services/versionService");
const Project = require("../models/Diagrams");

/**
 * GET /api/projects/:projectId/versions
 * Get all versions for a project
 */
router.get("/:projectId/versions", fetchUser, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const versions = await getVersions(projectId);

    res.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error("Get versions error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch versions",
    });
  }
});

/**
 * POST /api/projects/:projectId/versions
 * Create a new version
 */
router.post("/:projectId/versions", fetchUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { schema, label, message } = req.body;

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: "Schema is required",
      });
    }

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const version = await createVersion(
      projectId,
      schema,
      req.user._id,
      label || '',
      message || ''
    );

    res.json({
      success: true,
      data: version,
    });
  } catch (error) {
    console.error("Create version error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create version",
    });
  }
});

/**
 * GET /api/versions/:versionId
 * Get a specific version
 */
router.get("/versions/:versionId", fetchUser, async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await getVersion(versionId);

    // Verify user has access to the project
    const project = await Project.findById(version.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      data: version,
    });
  } catch (error) {
    console.error("Get version error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch version",
    });
  }
});

/**
 * POST /api/versions/:versionId/restore
 * Restore a version (returns the schema, doesn't automatically update project)
 */
router.post("/versions/:versionId/restore", fetchUser, async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await getVersion(versionId);

    // Verify user has access to the project
    const project = await Project.findById(version.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        schema: version.schemaJSON,
        version: version
      },
    });
  } catch (error) {
    console.error("Restore version error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to restore version",
    });
  }
});

/**
 * POST /api/versions/compare
 * Compare two versions
 */
router.post("/versions/compare", fetchUser, async (req, res) => {
  try {
    const { versionId1, versionId2 } = req.body;

    if (!versionId1 || !versionId2) {
      return res.status(400).json({
        success: false,
        error: "Both versionId1 and versionId2 are required",
      });
    }

    const version1 = await getVersion(versionId1);
    const version2 = await getVersion(versionId2);

    // Verify both versions belong to the same project and user has access
    if (version1.projectId.toString() !== version2.projectId.toString()) {
      return res.status(400).json({
        success: false,
        error: "Versions must belong to the same project",
      });
    }

    const project = await Project.findById(version1.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const diff = computeDiff(version1.schemaJSON, version2.schemaJSON);

    res.json({
      success: true,
      data: {
        version1: version1,
        version2: version2,
        diff: diff
      },
    });
  } catch (error) {
    console.error("Compare versions error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to compare versions",
    });
  }
});

module.exports = router;

