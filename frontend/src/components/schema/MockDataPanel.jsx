import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';

export default function MockDataPanel({ isOpen, onClose }) {
  const { nodes, edges } = useStore();
  const { token } = useAuthStore();
  const [entityCounts, setEntityCounts] = useState({});
  const [useAI, setUseAI] = useState(false);
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewEntity, setPreviewEntity] = useState(null);

  // Initialize entity counts
  React.useEffect(() => {
    if (isOpen && nodes.length > 0) {
      const counts = {};
      nodes.forEach(node => {
        const entityName = node.data.label;
        counts[entityName] = entityCounts[entityName] || 10;
      });
      setEntityCounts(counts);
    }
  }, [isOpen, nodes]);

  if (!isOpen) return null;

  const handleCountChange = (entityName, count) => {
    setEntityCounts(prev => ({
      ...prev,
      [entityName]: parseInt(count) || 0
    }));
  };

  const handleGenerate = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one table to generate mock data.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/schema/mock-data`,
        {
          schema: { nodes, edges },
          entityCounts,
          useAI,
          format
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setResult(res.data.data);
        if (res.data.data.format === 'json' && Object.keys(res.data.data.data).length > 0) {
          setPreviewEntity(Object.keys(res.data.data.data)[0]);
        }
      } else {
        setError(res.data.error || 'Failed to generate mock data');
      }
    } catch (err) {
      console.error('Mock data error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate mock data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;

    const text = result.format === 'sql' 
      ? result.data 
      : JSON.stringify(result.data, null, 2);

    navigator.clipboard.writeText(text).then(() => {
      alert('Data copied to clipboard!');
    });
  };

  const handleDownload = () => {
    if (!result) return;

    const text = result.format === 'sql' 
      ? result.data 
      : JSON.stringify(result.data, null, 2);

    const blob = new Blob([text], { 
      type: result.format === 'sql' ? 'text/plain' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_data.${result.format === 'sql' ? 'sql' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <h5 className="modal-title">Mock Data Generator</h5>
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
                  <label className="form-label">Entity Counts</label>
                  <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Entity</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nodes.map(node => {
                          const entityName = node.data.label;
                          return (
                            <tr key={node.id}>
                              <td>{entityName}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="0"
                                  value={entityCounts[entityName] || 0}
                                  onChange={(e) => handleCountChange(entityName, e.target.value)}
                                  disabled={loading}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Output Format</label>
                    <select
                      className="form-select"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      disabled={loading}
                    >
                      <option value="json">JSON</option>
                      <option value="sql">SQL INSERT Statements</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="use-ai"
                        checked={useAI}
                        onChange={(e) => setUseAI(e.target.checked)}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="use-ai">
                        Use AI for realistic domain-specific values
                      </label>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info">
                  <strong>What this does:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Generates realistic mock data for each entity</li>
                    <li>Maintains referential integrity (foreign keys)</li>
                    <li>Uses appropriate data types and formats</li>
                    {useAI && <li>AI-enhanced: More realistic, domain-specific values</li>}
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
                      'Generate Mock Data'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Generated Mock Data ({result.format.toUpperCase()})</h6>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleCopy}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleDownload}
                    >
                      Download
                    </button>
                  </div>
                </div>

                {result.format === 'json' ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Preview Entity</label>
                      <select
                        className="form-select"
                        value={previewEntity || ''}
                        onChange={(e) => setPreviewEntity(e.target.value)}
                      >
                        {Object.keys(result.data).map(entity => (
                          <option key={entity} value={entity}>
                            {entity} ({result.data[entity].length} records)
                          </option>
                        ))}
                      </select>
                    </div>

                    {previewEntity && result.data[previewEntity] && (
                      <div>
                        <h6>Preview: {previewEntity}</h6>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <table className="table table-sm table-bordered">
                            <thead>
                              <tr>
                                {Object.keys(result.data[previewEntity][0] || {}).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.data[previewEntity].slice(0, 10).map((record, idx) => (
                                <tr key={idx}>
                                  {Object.values(record).map((val, valIdx) => (
                                    <td key={valIdx}>{String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {result.data[previewEntity].length > 10 && (
                            <p className="text-muted small">
                              Showing first 10 of {result.data[previewEntity].length} records
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <h6>Full JSON Data</h6>
                      <textarea
                        className="form-control font-monospace"
                        rows="10"
                        value={JSON.stringify(result.data, null, 2)}
                        readOnly
                        style={{ fontSize: '12px' }}
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      className="form-control font-monospace"
                      rows="20"
                      value={result.data}
                      readOnly
                      style={{ fontSize: '12px' }}
                    ></textarea>
                  </div>
                )}

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

