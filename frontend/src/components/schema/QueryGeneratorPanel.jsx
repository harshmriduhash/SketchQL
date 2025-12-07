import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';

const TARGET_TYPES = [
  { value: 'sql', label: 'SQL' },
  { value: 'prisma', label: 'Prisma' },
  { value: 'mongoose', label: 'Mongoose' }
];

const STANDARD_QUERY_TYPES = [
  'Create',
  'Read',
  'Update',
  'Delete',
  'List with Pagination',
  'Join/Include/Populate'
];

export default function QueryGeneratorPanel({ isOpen, onClose }) {
  const { nodes, edges } = useStore();
  const { token } = useAuthStore();
  const [targetType, setTargetType] = useState('sql');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedQueryType, setSelectedQueryType] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one table to generate queries.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/schema/queries`,
        {
          schema: { nodes, edges },
          targetType,
          queryIntents: []
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setResult(res.data.data);
        if (res.data.data.queries && Object.keys(res.data.data.queries).length > 0) {
          setSelectedEntity(Object.keys(res.data.data.queries)[0]);
        }
      } else {
        setError(res.data.error || 'Failed to generate queries');
      }
    } catch (err) {
      console.error('Query generation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate queries');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert('Query copied to clipboard!');
    });
  };

  if (!result) {
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
              <h5 className="modal-title">Query Generator</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="target-type" className="form-label">
                  Target Technology
                </label>
                <select
                  className="form-select"
                  id="target-type"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  disabled={loading}
                >
                  {TARGET_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="alert alert-info">
                <strong>What this generates:</strong>
                <ul className="mb-0 mt-2">
                  <li>CRUD operations (Create, Read, Update, Delete)</li>
                  <li>Pagination queries</li>
                  <li>Relationship queries (JOINs, includes, populates)</li>
                  <li>Production-ready {TARGET_TYPES.find(t => t.value === targetType)?.label} syntax</li>
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
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating...
                    </>
                  ) : (
                    'Generate Queries'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h5 className="modal-title">Generated Queries ({TARGET_TYPES.find(t => t.value === targetType)?.label})</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="col-md-3">
                <h6>Entities</h6>
                <div className="list-group" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {Object.keys(result.queries).map(entity => (
                    <button
                      key={entity}
                      type="button"
                      className={`list-group-item list-group-item-action ${selectedEntity === entity ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedEntity(entity);
                        setSelectedQueryType(null);
                      }}
                    >
                      {entity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-9">
                {selectedEntity && result.queries[selectedEntity] && (
                  <div>
                    <h6>Queries for {selectedEntity}</h6>
                    <div className="list-group mb-3">
                      {Object.keys(result.queries[selectedEntity]).map(queryType => {
                        const query = result.queries[selectedEntity][queryType];
                        const code = typeof query === 'string' ? query : query.code;
                        const explanation = typeof query === 'string' ? '' : query.explanation;

                        return (
                          <div key={queryType} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <strong className="text-capitalize">{queryType.replace(/_/g, ' ')}</strong>
                                {explanation && (
                                  <p className="text-muted small mb-0">{explanation}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleCopy(code)}
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="bg-light p-2 rounded" style={{ fontSize: '12px', margin: 0 }}>
                              <code>{code}</code>
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {result.explanations && result.explanations.length > 0 && (
                  <div className="mt-4">
                    <h6>Usage Notes</h6>
                    {result.explanations.map((exp, idx) => (
                      <div key={idx} className="card mb-2">
                        <div className="card-body">
                          <strong>{exp.queryType}</strong>
                          <p className="mb-0 text-muted small">{exp.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!selectedEntity && (
                  <div className="alert alert-info">
                    Select an entity from the left to view its queries.
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
              >
                Generate Another
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

