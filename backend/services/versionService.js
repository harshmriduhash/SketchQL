const SchemaVersion = require('../models/SchemaVersion');

/**
 * Creates a new schema version
 * @param {string} projectId - Project ID
 * @param {Object} schemaJSON - Schema object with nodes and edges
 * @param {string} userId - User ID creating the version
 * @param {string} label - Optional label for the version
 * @param {string} message - Optional message/description
 * @returns {Promise<Object>} - Created version document
 */
async function createVersion(projectId, schemaJSON, userId, label = '', message = '') {
  try {
    // Get the latest version number for this project
    const latestVersion = await SchemaVersion.findOne({ projectId })
      .sort({ versionNumber: -1 })
      .select('versionNumber')
      .lean();

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const version = new SchemaVersion({
      projectId,
      versionNumber: nextVersionNumber,
      schemaJSON,
      label: label || `Version ${nextVersionNumber}`,
      message,
      createdBy: userId
    });

    await version.save();
    return version;
  } catch (error) {
    console.error('Error creating version:', error);
    throw new Error(`Failed to create version: ${error.message}`);
  }
}

/**
 * Gets all versions for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} - Array of version documents
 */
async function getVersions(projectId) {
  try {
    const versions = await SchemaVersion.find({ projectId })
      .sort({ versionNumber: -1 })
      .populate('createdBy', 'username email')
      .lean();

    return versions;
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw new Error(`Failed to fetch versions: ${error.message}`);
  }
}

/**
 * Gets a specific version by ID
 * @param {string} versionId - Version ID
 * @returns {Promise<Object>} - Version document
 */
async function getVersion(versionId) {
  try {
    const version = await SchemaVersion.findById(versionId)
      .populate('createdBy', 'username email')
      .lean();

    if (!version) {
      throw new Error('Version not found');
    }

    return version;
  } catch (error) {
    console.error('Error fetching version:', error);
    throw new Error(`Failed to fetch version: ${error.message}`);
  }
}

/**
 * Computes a diff between two schema versions
 * @param {Object} schema1 - First schema
 * @param {Object} schema2 - Second schema
 * @returns {Object} - Diff object with changes
 */
function computeDiff(schema1, schema2) {
  const diff = {
    nodes: {
      added: [],
      removed: [],
      modified: []
    },
    edges: {
      added: [],
      removed: [],
      modified: []
    }
  };

  // Compare nodes
  const nodes1Map = new Map(schema1.nodes.map(n => [n.id, n]));
  const nodes2Map = new Map(schema2.nodes.map(n => [n.id, n]));

  // Find removed nodes
  schema1.nodes.forEach(node => {
    if (!nodes2Map.has(node.id)) {
      diff.nodes.removed.push(node);
    }
  });

  // Find added nodes
  schema2.nodes.forEach(node => {
    if (!nodes1Map.has(node.id)) {
      diff.nodes.added.push(node);
    } else {
      // Compare node data
      const node1 = nodes1Map.get(node.id);
      if (JSON.stringify(node1.data) !== JSON.stringify(node.data)) {
        diff.nodes.modified.push({
          id: node.id,
          original: node1,
          modified: node
        });
      }
    }
  });

  // Compare edges
  const edges1Map = new Map(
    schema1.edges.map(e => [`${e.source}-${e.target}`, e])
  );
  const edges2Map = new Map(
    schema2.edges.map(e => [`${e.source}-${e.target}`, e])
  );

  // Find removed edges
  schema1.edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`;
    if (!edges2Map.has(key)) {
      diff.edges.removed.push(edge);
    }
  });

  // Find added edges
  schema2.edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`;
    if (!edges1Map.has(key)) {
      diff.edges.added.push(edge);
    } else {
      // Compare edge data
      const edge1 = edges1Map.get(key);
      if (JSON.stringify(edge1) !== JSON.stringify(edge)) {
        diff.edges.modified.push({
          original: edge1,
          modified: edge
        });
      }
    }
  });

  return diff;
}

module.exports = {
  createVersion,
  getVersions,
  getVersion,
  computeDiff
};

