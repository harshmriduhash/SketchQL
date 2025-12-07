import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';

const DB_TYPES = [
  { value: 'mongo', label: 'MongoDB' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sql', label: 'SQL Server' }
];

export default function MigrationPanel({ isOpen, onClose }) {
  const { nodes, edges } = useStore();
  const { token } = useAuthStore();
  const [sourceDbType, setSourceDbType] = useState('mongo');
  const [targetDbType, setTargetDbType] = useState('postgres');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleMigrate = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one table to migrate.');
      return;
    }

    if (sourceDbType === targetDbType) {
      alert('Source and target database types must be different.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(
        `${API_URL}/api/schema/migrate`,
        {
          schema: { nodes, edges },
          sourceDbType,
          targetDbType
        },
        { headers: { 'auth-token': token } }
      );

      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to migrate schema');
      }
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to migrate schema');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDDL = () => {
    if (result?.targetDDL) {
      navigator.clipboard.writeText(result.targetDDL).then(() => {
        alert('DDL copied to clipboard!');
      });
    }
  };

  const handleDownloadDDL = () => {
    if (result?.targetDDL) {
      const blob = new Blob([result.targetDDL], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `migration_${sourceDbType}_to_${targetDbType}.sql`;
      a.click();
      URL.revokeObjectURL(url);
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
            <h5 className="modal-title">Database Migration Assistant</h5>
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
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="source-db" className="form-label">
                      Source Database
                    </label>
                    <select
                      className="form-select"
                      id="source-db"
                      value={sourceDbType}
                      onChange={(e) => setSourceDbType(e.target.value)}
                      disabled={loading}
                    >
                      {DB_TYPES.map(db => (
                        <option key={db.value} value={db.value}>
                          {db.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="target-db" className="form-label">
                      Target Database
                    </label>
                    <select
                      className="form-select"
                      id="target-db"
                      value={targetDbType}
                      onChange={(e) => setTargetDbType(e.target.value)}
                      disabled={loading}
                    >
                      {DB_TYPES.map(db => (
                        <option key={db.value} value={db.value}>
                          {db.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="alert alert-info">
                  <strong>What this does:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Converts your schema from {DB_TYPES.find(d => d.value === sourceDbType)?.label} to {DB_TYPES.find(d => d.value === targetDbType)?.label}</li>
                    <li>Maps data types appropriately</li>
                    <li>Generates DDL (CREATE TABLE) statements</li>
                    <li>Preserves relationships and constraints</li>
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
                    onClick={handleMigrate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Migrating...
                      </>
                    ) : (
                      'Generate Migration'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Generated DDL for {DB_TYPES.find(d => d.value === targetDbType)?.label}</h6>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleCopyDDL}
                    >
                      Copy DDL
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleDownloadDDL}
                    >
                      Download SQL
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <textarea
                    className="form-control font-monospace"
                    rows="15"
                    value={result.targetDDL}
                    readOnly
                    style={{ fontSize: '12px' }}
                  ></textarea>
                </div>

                {result.mappingSummary && result.mappingSummary.length > 0 && (
                  <div>
                    <h6>Type Mapping Summary</h6>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Table</th>
                            <th>Column</th>
                            <th>Source Type</th>
                            <th>Target Type</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.mappingSummary.map((mapping, idx) => (
                            <tr key={idx}>
                              <td>{mapping.table}</td>
                              <td>{mapping.column}</td>
                              <td><code>{mapping.sourceType}</code></td>
                              <td><code>{mapping.targetType}</code></td>
                              <td className="text-muted small">{mapping.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

