import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';
import { getLayoutedElements } from '../../utils/autoLayout';
import { getTableColor } from '../../Store/store';

export default function GitHubSyncPanel({ isOpen, onClose }) {
  const { loadProject } = useStore();
  const { token } = useAuthStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [path, setPath] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!repoUrl.trim()) {
      alert('Please enter a GitHub repository URL.');
      return;
    }

    if (!accessToken.trim()) {
      alert('Please enter your GitHub personal access token.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/github/sync`,
        {
          repoUrl: repoUrl.trim(),
          branch: branch.trim() || 'main',
          path: path.trim() || '',
          accessToken: accessToken.trim()
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setResult(res.data.data);
        
        // Auto-apply schema if successful
        if (res.data.data.schema) {
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            res.data.data.schema.nodes,
            res.data.data.schema.edges
          );
          
          const coloredNodes = layoutedNodes.map((node, index) => ({
            ...node,
            data: {
              ...node.data,
              color: getTableColor(index)
            }
          }));

          loadProject({
            nodes: coloredNodes,
            edges: layoutedEdges,
            name: `Imported from ${repoUrl.split('/').pop()}`,
            _id: null
          });

          alert(`Schema imported successfully! ${res.data.data.filesProcessed} files processed.`);
          onClose();
        }
      } else {
        setError(res.data.error || 'Failed to sync from GitHub');
      }
    } catch (err) {
      console.error('GitHub sync error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to sync from GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">GitHub Schema Sync</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {!result ? (
              <div>
                <div className="mb-3">
                  <label htmlFor="repo-url" className="form-label">
                    Repository URL <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="repo-url"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="branch" className="form-label">
                      Branch
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="branch"
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="path" className="form-label">
                      Path (optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="path"
                      placeholder="/src/models"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="access-token" className="form-label">
                    GitHub Personal Access Token <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="access-token"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    disabled={loading}
                  />
                  <small className="form-text text-muted">
                    Create a token at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">github.com/settings/tokens</a>
                  </small>
                </div>

                <div className="alert alert-info">
                  <strong>Supported Formats:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Prisma Schema (.prisma)</li>
                    <li>Mongoose Models (.js, .ts)</li>
                    <li>Sequelize Models (.js, .ts)</li>
                  </ul>
                  <p className="mb-0 mt-2">
                    The system will scan the repository (or specified path) for model files and extract schema information.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger mt-3">
                    {error}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSync}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Syncing...
                      </>
                    ) : (
                      'Sync Schema from GitHub'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="alert alert-success">
                  <strong>Success!</strong> Processed {result.filesProcessed} files.
                </div>
                <p>The schema has been imported and applied to your canvas.</p>
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

