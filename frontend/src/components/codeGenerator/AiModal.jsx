import React, { useState } from 'react';
import axios from 'axios';
import { useStore, getTableColor } from '../../Store/store';
import { useAuthStore } from '../../Store/authStore';
import { getLayoutedElements } from '../../utils/autoLayout';

export default function AiModal({ isOpen, onClose }) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuthStore();
    const loadProject = useStore((state) => state.loadProject);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/ai/generate`,
                { userPrompt: prompt },
                { headers: { 'auth-token': token } }
            );
            const repairedEdges = res.data.edges.map(edge => {
                const cleanSourceCol = edge.sourceHandle
                    .replace('-source', '')
                    .replace('-right', '')
                    .replace('-left', '');

                const cleanTargetCol = edge.targetHandle
                    .replace('-target', '')
                    .replace('-left', '')
                    .replace('-right', '');

                return {
                    ...edge,
                    sourceHandle: `${cleanSourceCol}-right`,
                    targetHandle: `${cleanTargetCol}-left`,
                    type: 'step',
                    animated: false,
                    style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed', color: '#b1b1b7' }
                };
            });
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                res.data.nodes,
                repairedEdges
            );
            const coloredNodes = layoutedNodes.map((node, index) => ({
                ...node,
                data: {
                    ...node.data,
                   
                    color: getTableColor(index)
                }
            }));

            loadProject({
                _id: null,
                name: `${prompt.substring(0, 18)}`,
                nodes: coloredNodes,
                edges: layoutedEdges
            });

            onClose();
            alert("Diagram Generated Successfully!");

        } catch (err) {
            console.error(err);
            alert("AI Generation Failed. Check backend logs.");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
        },
        modalContent: {
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: 'none',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            maxWidth: '650px',
            margin: '0 auto',
            backgroundColor: '#fff'
        },
        searchContainer: {
            padding: '16px',
            backgroundColor: '#f9fafb', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        },
        searchIcon: {
            color: '#9ca3af',
            fontSize: '1.2rem',
            marginTop: '8px'
        },
        textArea: {
            border: 'none',
            backgroundColor: 'transparent',
            resize: 'none',
            width: '100%',
            outline: 'none',
            fontSize: '16px',
            color: '#374151',
            minHeight: '60px',
            marginTop: '4px'
        },
        tag: {
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#fff',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        bodySection: {
            padding: '16px 20px',
            backgroundColor: '#ffffff'
        },
        sectionTitle: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#9ca3af', 
            marginBottom: '12px',
            marginTop: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        },
        examplePill: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#374151',
            marginBottom: '8px',
            marginRight: '12px',
            border: '1px solid #f3f4f6',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        },
        dot: {
            height: '8px',
            width: '8px',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '8px'
        },
        footer: {
            padding: '12px 20px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end', 
            alignItems: 'center',
            gap: '10px'
        }
    };

    return (
        <div className="modal show d-block" style={styles.overlay}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
                <div className="modal-content" style={styles.modalContent}>
                    
              
                    <div style={styles.searchContainer}>
                        <i className="bi bi-search" style={styles.searchIcon}></i>
                        <textarea
                            style={styles.textArea}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your app schema (e.g. A CRM with Users, Deals, and Invoices)..."
                            autoFocus
                        />
                        <div style={styles.tag}>
                            <i className="bi bi-stars" style={{color: '#8b5cf6'}}></i>
                            AI Architect
                        </div>
                    </div>

                
                    <div style={styles.bodySection}>
                        <div style={styles.sectionTitle}>Suggestions</div>
                        <div>
                            <div 
                                style={styles.examplePill} 
                                onClick={() => setPrompt("E-commerce system with Orders, Products, and Customers")}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                <span style={{...styles.dot, backgroundColor: '#3b82f6'}}></span>
                                E-commerce Store
                            </div>
                            <div 
                                style={styles.examplePill} 
                                onClick={() => setPrompt("School Management with Students, Teachers, and Classes")}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                <span style={{...styles.dot, backgroundColor: '#10b981'}}></span>
                                School System
                            </div>
                            <div 
                                style={styles.examplePill} 
                                onClick={() => setPrompt("Blog platform with Posts, Comments, and Tags")}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                <span style={{...styles.dot, backgroundColor: '#f59e0b'}}></span>
                                Blog Platform
                            </div>
                        </div>
                    </div>

                
                    <div style={styles.footer}>
                        <button 
                            className="btn rounded-1 btn-light text-muted border" 
                            onClick={onClose}
                            style={{fontSize: '13px', fontWeight: '500'}}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn main-primary-color text-white btn-hover-color rounded-1" 
                            onClick={handleGenerate} 
                            disabled={loading || !prompt}
                            style={{
                                fontSize: '13px', 
                                paddingLeft: '15px',
                                paddingRight: '15px',
                                fontWeight: '500',
                                backgroundColor:'#6366F1'
                                
                            }}
                        >
                            {loading ? (
                                <span><span className="spinner-border spinner-border-sm me-2"></span>Thinking...</span>
                            ) : (
                                <span>Generate</span>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}