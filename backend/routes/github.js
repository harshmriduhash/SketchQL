const router = require("express").Router();
const fetchUser = require("../middleware/fetchUser");
const { parseModels } = require("../services/githubParserService");
const { Octokit } = require("@octokit/rest");

/**
 * POST /api/github/sync
 * Syncs schema from GitHub repository
 * 
 * Body: {
 *   repoUrl: string,
 *   branch: string (optional, default "main"),
 *   path: string (optional, e.g., "/src/models"),
 *   accessToken: string (GitHub personal access token)
 * }
 */
router.post("/sync", fetchUser, async (req, res) => {
  try {
    const { repoUrl, branch = "main", path = "", accessToken } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        error: "repoUrl is required",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "GitHub access token is required",
      });
    }

    // Parse repo URL
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid GitHub repository URL",
      });
    }

    const owner = urlMatch[1];
    const repo = urlMatch[2].replace(/\.git$/, '');

    // Initialize Octokit
    const octokit = new Octokit({ auth: accessToken });

    // Fetch repository contents
    const files = await fetchRepoFiles(octokit, owner, repo, branch, path);

    // Parse model files
    const schema = parseModels(files);

    res.json({
      success: true,
      data: {
        schema,
        filesProcessed: files.length
      },
    });
  } catch (error) {
    console.error("GitHub sync error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to sync from GitHub",
    });
  }
});

/**
 * Recursively fetches files from GitHub repository
 */
async function fetchRepoFiles(octokit, owner, repo, branch, path) {
  const files = [];

  try {
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: path || '',
      ref: branch
    });

    if (Array.isArray(contents)) {
      // Directory
      for (const item of contents) {
        if (item.type === 'file') {
          // Check if it's a model file
          if (isModelFile(item.name)) {
            try {
              const { data: fileContent } = await octokit.repos.getContent({
                owner,
                repo,
                path: item.path,
                ref: branch
              });

              const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
              files.push({
                path: item.path,
                content
              });
            } catch (error) {
              console.warn(`Failed to fetch file ${item.path}:`, error);
            }
          }
        } else if (item.type === 'dir') {
          // Recursively fetch from subdirectory
          const subFiles = await fetchRepoFiles(octokit, owner, repo, branch, item.path);
          files.push(...subFiles);
        }
      }
    } else if (contents.type === 'file') {
      // Single file
      const content = Buffer.from(contents.content, 'base64').toString('utf-8');
      files.push({
        path: contents.path,
        content
      });
    }
  } catch (error) {
    console.error(`Error fetching files from ${path}:`, error);
    throw error;
  }

  return files;
}

/**
 * Checks if a file is a model file
 */
function isModelFile(filename) {
  const modelExtensions = ['.prisma', '.js', '.ts', '.jsx', '.tsx'];
  const modelPatterns = [/model/i, /schema/i, /entity/i];
  
  const hasExtension = modelExtensions.some(ext => filename.endsWith(ext));
  const matchesPattern = modelPatterns.some(pattern => pattern.test(filename));
  
  return hasExtension || matchesPattern;
}

module.exports = router;

