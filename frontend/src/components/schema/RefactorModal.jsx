import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';

/**
 * Simple diff utility to compare two schemas
 */
function getSchemaDiff(original, refactored) {
  const changes = [];

  // Compare nodes
  const originalNodeMap = new Map(original.nodes.map(n => [n.id, n]));
  const refactoredNodeMap = new Map(refactored.nodes.map(n => [n.id, n]));

  // Check for removed nodes
  original.nodes.forEach(node => {
    if (!refactoredNodeMap.has(node.id)) {
      changes.push({
        type: 'removed',
        entity: 'node',
        id: node.id,
        label: node.data.label,
        description: `Table "${node.data.label}" was removed`
      });
    }
  });

  // Check for added nodes
  refactored.nodes.forEach(node => {
    if (!originalNodeMap.has(node.id)) {
      changes.push({
        type: 'added',
        entity: 'node',
        id: node.id,
        label: node.data.label,
        description: `Table "${node.data.label}" was added`
      });
    } else {
      // Compare columns in existing nodes
      const origNode = originalNodeMap.get(node.id);
      const origCols = new Map(origNode.data.columns.map(c => [c.name, c]));
      const refCols = new Map(node.data.columns.map(c => [c.name, c]));

      // Check for removed columns
      origNode.data.columns.forEach(col => {
        if (!refCols.has(col.name)) {
          changes.push({
            type: 'removed',
            entity: 'column',
            nodeId: node.id,
            nodeLabel: node.data.label,
            columnName: col.name,
            description: `Column "${col.name}" was removed from "${node.data.label}"`
          });
        }
      });

      // Check for added columns
      node.data.columns.forEach(col => {
        if (!origCols.has(col.name)) {
          changes.push({
            type: 'added',
            entity: 'column',
            nodeId: node.id,
            nodeLabel: node.data.label,
            columnName: col.name,
            description: `Column "${col.name}" was added to "${node.data.label}"`
          });
        } else {
          // Check for modified columns
          const origCol = origCols.get(col.name);
          if (origCol.type !== col.type || origCol.isPK !== col.isPK || origCol.isNullable !== col.isNullable) {
            changes.push({
              type: 'modified',
              entity: 'column',
              nodeId: node.id,
              nodeLabel: node.data.label,
              columnName: col.name,
              original: origCol,
              modified: col,
              description: `Column "${col.name}" in "${node.data.label}" was modified`
            });
          }
        }
      });
    }
  });

  // Compare edges
  const originalEdgeMap = new Map(original.edges.map(e => [`${e.source}-${e.target}`, e]));
  const refactoredEdgeMap = new Map(refactored.edges.map(e => [`${e.source}-${e.target}`, e]));

  original.edges.forEach(edge => {
    if (!refactoredEdgeMap.has(`${edge.source}-${edge.target}`)) {
      changes.push({
        type: 'removed',
        entity: 'edge',
        description: `Relationship removed`
      });
    }
  });

  refactored.edges.forEach(edge => {
    if (!originalEdgeMap.has(`${edge.source}-${edge.target}`)) {
      changes.push({
        type: 'added',
        entity: 'edge',
        description: `New relationship added`
      });
    }
  });

  return changes;
}

export default function RefactorModal({ isOpen, onClose }) {
  const { nodes, edges, loadProject } = useStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState('');
  const [refactoredData, setRefactoredData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' or 'explanations'

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setRefactoredData(null);
      setError(null);
      setGoal('');
      setActiveTab('diff');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefactor = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one table to refactor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/schema/refactor`,
        {
          schema: { nodes, edges },
          goal: goal.trim() || undefined
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setRefactoredData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to refactor schema');
      }
    } catch (err) {
      console.error('Refactor error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to refactor schema');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!refactoredData) return;

    // Preserve positions from original nodes
    const nodesWithPositions = refactoredData.refactoredSchema.nodes.map(refNode => {
      const originalNode = nodes.find(n => n.id === refNode.id);
      return {
        ...refNode,
        position: originalNode?.position || refNode.position || { x: 0, y: 0 },
        data: {
          ...refNode.data,
          color: originalNode?.data?.color || refNode.data.color
        }
      };
    });

    loadProject({
      nodes: nodesWithPositions,
      edges: refactoredData.refactoredSchema.edges,
      name: useStore.getState().projectName,
      _id: useStore.getState().currentProjectId
    });

    onClose();
  };

  const diff = refactoredData ? getSchemaDiff(
    { nodes, edges },
    refactoredData.refactoredSchema
  ) : [];

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
            <h5 className="modal-title">AI Schema Refactoring</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {!refactoredData ? (
              <div>
                <div className="mb-3">
                  <label htmlFor="refactor-goal" className="form-label">
                    Optimization Goal (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="refactor-goal"
                    placeholder="e.g., optimize for reads, normalize, reduce redundancy"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={loading}
                  />
                  <small className="form-text text-muted">
                    Leave empty for general optimization
                  </small>
                </div>

                <div className="alert alert-info">
                  <strong>What this does:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Analyzes your schema for normalization opportunities</li>
                    <li>Identifies redundant data and relationships</li>
                    <li>Suggests improvements for indexes and field types</li>
                    <li>Provides explanations for each change</li>
                  </ul>
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
                    onClick={handleRefactor}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Refactoring...
                      </>
                    ) : (
                      'Refactor with AI'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'diff' ? 'active' : ''}`}
                      onClick={() => setActiveTab('diff')}
                    >
                      Schema Diff
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'explanations' ? 'active' : ''}`}
                      onClick={() => setActiveTab('explanations')}
                    >
                      AI Explanations ({refactoredData.explanations.length})
                    </button>
                  </li>
                </ul>

                {/* Diff Tab */}
                {activeTab === 'diff' && (
                  <div>
                    <div className="row">
                      <div className="col-md-6">
                        <h6 className="text-danger mb-2">Original Schema</h6>
                        <div className="border rounded p-3" style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#fff5f5' }}>
                          <pre style={{ fontSize: '12px', margin: 0 }}>
                            {JSON.stringify({ nodes, edges }, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-success mb-2">Refactored Schema</h6>
                        <div className="border rounded p-3" style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#f0fff4' }}>
                          <pre style={{ fontSize: '12px', margin: 0 }}>
                            {JSON.stringify(refactoredData.refactoredSchema, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {diff.length > 0 && (
                      <div className="mt-3">
                        <h6>Changes Detected ({diff.length})</h6>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {diff.map((change, idx) => (
                            <div
                              key={idx}
                              className={`alert alert-sm ${
                                change.type === 'added' ? 'alert-success' :
                                change.type === 'removed' ? 'alert-danger' :
                                'alert-warning'
                              } mb-2`}
                            >
                              <strong>{change.type.toUpperCase()}:</strong> {change.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanations Tab */}
                {activeTab === 'explanations' && (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {refactoredData.explanations.map((exp, idx) => (
                      <div key={idx} className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-title">{exp.change}</h6>
                          <p className="card-text text-muted">{exp.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setRefactoredData(null);
                      setError(null);
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAccept}
                  >
                    Accept Refactor
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

