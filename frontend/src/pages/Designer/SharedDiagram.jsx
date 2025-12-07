import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TableNode from '../../components/DbDesign/TableNode';
import { SmartStepEdge } from '@tisoap/react-flow-smart-edge';
import Image from '../../components/Landing/components/Image';
import logo from "../../assets/logo.png"
const nodeTypes = { tableNode: TableNode };
const edgeTypes = { smart: SmartStepEdge };

export default function SharedDiagram() {
    const { id } = useParams();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projectName, setProjectName] = useState('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchDiagram = async () => {
            try {
               
                const res = await axios.get(`${API_URL}/api/diagramss/shared/${id}`);
                setNodes(res.data.nodes);
                setEdges(res.data.edges);
                setProjectName(res.data.name);
            } catch (err) {
                console.error(err);
                setError("Diagram not found or has been deleted.");
            } finally {
                setLoading(false);
            }
        };
        fetchDiagram();
    }, [id]);


    if (loading) return (
        <div className="vh-100 w-100 d-flex flex-column justify-content-center align-items-center bg-light">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
            <p className="text-muted fw-medium">Loading Diagram...</p>
        </div>
    );

    
    if (error) return (
        <div className="vh-100 w-100 d-flex flex-column justify-content-center align-items-center bg-light">
            <div className="bg-white p-5 rounded-4 shadow-sm text-center border">
                <i className="bi bi-exclamation-triangle-fill text-warning display-4 mb-3"></i>
                <h3 className="fw-bold text-dark">Oops!</h3>
                <p className="text-muted mb-4">{error}</p>
                <Link to="/" className="btn btn-primary px-4 rounded-pill">
                    Go Home
                </Link>
            </div>
        </div>
    );

    
    const styles = {
        container: {
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f8f9fa',
            position: 'relative',
            overflow: 'hidden'
        },
        header: {
            position: 'absolute',
            top: '20px',
            right: '-10rem',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '10px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.6)',
            width: 'auto',
            minWidth: '320px',
            justifyContent: 'space-between'
        },
        titleGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },

        title: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
        },
        subtitle: {
            fontSize: '12px',
            color: '#6b7280',
            margin: 0
        },
        
        badge: {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 10,
            backgroundColor: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #e5e7eb'
        }
    };

  
    return (
        <div style={styles.container}>
            
            
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <div style={styles.iconBox}>
                        <Image src={logo} className={"logo"}></Image>
                    </div>
                    <div>
                        <h1 style={styles.title}>{projectName}</h1>
                        <p style={styles.subtitle}>
                            
                            Shared View
                        </p>
                    </div>
                </div>
                
                <div className="d-none d-md-block" style={{width: '1px', height: '24px', backgroundColor: '#e5e7eb'}}></div>
                
                <Link to="/login" style={styles.ctaButton} className=" main-primary-color text-white btn border-0  rounded-1 px-4 btn-hover-color">
                     Edit <i className="bi bi-arrow-right ms-1"></i>
                </Link>
            </div>

    
            <a href="/" style={{textDecoration: 'none'}}>
                <div style={styles.badge} className="d-none d-md-flex">
                    <span style={{color: '#9ca3af', fontWeight: '400'}}>Powered by</span>
                    <i className="bi bi-stars text-primary"></i>
                    SketchQL Designer
                </div>
            </a>

            
            <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={true} 
                    zoomOnScroll={true}
                    panOnDrag={true}
                    preventScrolling={false}
                    minZoom={0.2}
                    maxZoom={2}
                >
                    <Background 
                        color="#e5e7eb" 
                        gap={20} 
                        size={1} 
                        variant="dots" 
                    />
                    
                    <Controls 
                        showInteractive={false} 
                        position="bottom-left"
                        style={{ 
                            marginBottom: '15px', 
                            marginLeft: '15px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                            borderRadius: '8px'
                        }} 
                    />
                    
                    
                </ReactFlow>
            </div>
        </div>
    );
}