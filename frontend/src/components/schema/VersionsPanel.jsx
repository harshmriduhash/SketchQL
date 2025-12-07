import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';

export default function VersionsPanel({ isOpen, onClose }) {
  const { currentProjectId, nodes, edges, loadProject } = useStore();
  const { token } = useAuthStore();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([null, null]);
  const [diff, setDiff] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (isOpen && currentProjectId) {
      fetchVersions();
    }
  }, [isOpen, currentProjectId]);

  const fetchVersions = async () => {
    if (!currentProjectId) {
      setError('No project selected. Please save your diagram first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(
        `${API_URL}/api/projects/${currentProjectId}/versions`,
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setVersions(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch versions');
      }
    } catch (err) {
      console.error('Fetch versions error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch versions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!currentProjectId) {
      alert('Please save your diagram first to create a version.');
      return;
    }

    const label = prompt('Enter a label for this version (optional):');
    if (label === null) return; // User cancelled

    const message = prompt('Enter a message/description (optional):');
    if (message === null) return; // User cancelled

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/projects/${currentProjectId}/versions`,
        {
          schema: { nodes, edges },
          label: label || '',
          message: message || ''
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        await fetchVersions();
        alert('Version created successfully!');
      } else {
        setError(res.data.error || 'Failed to create version');
      }
    } catch (err) {
      console.error('Create version error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create version');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedVersions[0] || !selectedVersions[1]) {
      alert('Please select two versions to compare.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/versions/compare`,
        {
          versionId1: selectedVersions[0],
          versionId2: selectedVersions[1]
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setDiff(res.data.data);
        setShowDiff(true);
      } else {
        setError(res.data.error || 'Failed to compare versions');
      }
    } catch (err) {
      console.error('Compare error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version? This will replace your current schema.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/versions/${versionId}/restore`,
        {},
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        // Preserve positions from current nodes if possible
        const restoredNodes = res.data.data.schema.nodes.map(restoredNode => {
          const currentNode = nodes.find(n => n.id === restoredNode.id);
          return {
            ...restoredNode,
            position: currentNode?.position || restoredNode.position || { x: 0, y: 0 },
            data: {
              ...restoredNode.data,
              color: currentNode?.data?.color || restoredNode.data.color
            }
          };
        });

        loadProject({
          nodes: restoredNodes,
          edges: res.data.data.schema.edges,
          name: useStore.getState().projectName,
          _id: currentProjectId
        });

        alert('Version restored successfully!');
        onClose();
      } else {
        setError(res.data.error || 'Failed to restore version');
      }
    } catch (err) {
      console.error('Restore error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to restore version');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Schema Versions</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {!currentProjectId ? (
              <div className="alert alert-warning">
                Please save your diagram first to enable versioning.
              </div>
            ) : (
              <>
                {!showDiff ? (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Version History</h6>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleCreateVersion}
                        disabled={loading}
                      >
                        Create Version
                      </button>
                    </div>

                    {error && (
                      <div className="alert alert-danger">
                        {error}
                      </div>
                    )}

                    {loading && versions.length === 0 ? (
                      <div className="text-center py-5">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Loading versions...
                      </div>
                    ) : versions.length === 0 ? (
                      <div className="alert alert-info">
                        No versions yet. Create your first version to start tracking changes.
                      </div>
                    ) : (
                      <>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th style={{ width: '40px' }}>Compare</th>
                                <th>Version</th>
                                <th>Label</th>
                                <th>Message</th>
                                <th>Created</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {versions.map((version) => (
                                <tr key={version._id}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedVersions.includes(version._id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          if (!selectedVersions[0]) {
                                            setSelectedVersions([version._id, selectedVersions[1]]);
                                          } else if (!selectedVersions[1]) {
                                            setSelectedVersions([selectedVersions[0], version._id]);
                                          } else {
                                            setSelectedVersions([version._id, null]);
                                          }
                                        } else {
                                          setSelectedVersions(
                                            selectedVersions.map(id => id === version._id ? null : id)
                                          );
                                        }
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <strong>v{version.versionNumber}</strong>
                                  </td>
                                  <td>{version.label || `Version ${version.versionNumber}`}</td>
                                  <td className="text-muted small">{version.message || '-'}</td>
                                  <td className="small">
                                    {new Date(version.createdAt).toLocaleString()}
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleRestore(version._id)}
                                      disabled={loading}
                                    >
                                      Restore
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {selectedVersions[0] && selectedVersions[1] && (
                          <div className="mt-3">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleCompare}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Comparing...
                                </>
                              ) : (
                                'Compare Selected Versions'
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Version Comparison</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setShowDiff(false);
                          setDiff(null);
                        }}
                      >
                        Back to List
                      </button>
                    </div>

                    {diff && (
                      <div>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <div className="card">
                              <div className="card-header bg-danger text-white">
                                Version {diff.version1.versionNumber} - {diff.version1.label}
                              </div>
                              <div className="card-body">
                                <small className="text-muted">
                                  {new Date(diff.version1.createdAt).toLocaleString()}
                                </small>
                                {diff.version1.message && (
                                  <p className="mt-2 small">{diff.version1.message}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card">
                              <div className="card-header bg-success text-white">
                                Version {diff.version2.versionNumber} - {diff.version2.label}
                              </div>
                              <div className="card-body">
                                <small className="text-muted">
                                  {new Date(diff.version2.createdAt).toLocaleString()}
                                </small>
                                {diff.version2.message && (
                                  <p className="mt-2 small">{diff.version2.message}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h6>Changes</h6>
                          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {diff.diff.nodes.added.length > 0 && (
                              <div className="mb-3">
                                <strong className="text-success">Added Tables ({diff.diff.nodes.added.length})</strong>
                                <ul>
                                  {diff.diff.nodes.added.map((node, idx) => (
                                    <li key={idx}>{node.data.label}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {diff.diff.nodes.removed.length > 0 && (
                              <div className="mb-3">
                                <strong className="text-danger">Removed Tables ({diff.diff.nodes.removed.length})</strong>
                                <ul>
                                  {diff.diff.nodes.removed.map((node, idx) => (
                                    <li key={idx}>{node.data.label}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {diff.diff.nodes.modified.length > 0 && (
                              <div className="mb-3">
                                <strong className="text-warning">Modified Tables ({diff.diff.nodes.modified.length})</strong>
                                <ul>
                                  {diff.diff.nodes.modified.map((change, idx) => (
                                    <li key={idx}>{change.modified.data.label}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {diff.diff.edges.added.length > 0 && (
                              <div className="mb-3">
                                <strong className="text-success">Added Relationships ({diff.diff.edges.added.length})</strong>
                              </div>
                            )}

                            {diff.diff.edges.removed.length > 0 && (
                              <div className="mb-3">
                                <strong className="text-danger">Removed Relationships ({diff.diff.edges.removed.length})</strong>
                              </div>
                            )}

                            {Object.values(diff.diff.nodes).every(arr => arr.length === 0) &&
                             Object.values(diff.diff.edges).every(arr => arr.length === 0) && (
                              <div className="alert alert-info">
                                No changes detected between these versions.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

