import Logo from "../Landing/components/Logo"
import { useState } from "react"
import { useStore } from '../../Store/store';
import CodeExportModal from '../codeGenerator/CodeExportModal';
import axios from 'axios';
import { useAuthStore } from '../../Store/authStore';
import AiModal from '../codeGenerator/AiModal';
import { toPng } from 'html-to-image';
import { useNavigate } from "react-router-dom"


export default function NavBar(){
    const navigate = useNavigate();
    const handleCreateNew = () => {
        resetCanvas(); 
        navigate('/design'); 
    };
    const { nodes, edges, currentProjectId, projectName, setProjectName, loadProject, clearCanvas,resetCanvas } = useStore();
    const [showAiModal, setShowAiModal] = useState(false);
    const { token } = useAuthStore();
    
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const downloadImage = () => {
        const viewport = document.querySelector('.react-flow__viewport');

        if (!viewport || nodes.length === 0) return;

        
        const NODE_WIDTH_ESTIMATE = 350; 
        const NODE_HEIGHT_ESTIMATE = 400; 
        const PADDING = 100;

        const bounds = nodes.reduce((acc, node) => ({
            minX: Math.min(acc.minX, node.position.x),
            minY: Math.min(acc.minY, node.position.y),
            maxX: Math.max(acc.maxX, node.position.x + NODE_WIDTH_ESTIMATE),
            maxY: Math.max(acc.maxY, node.position.y + NODE_HEIGHT_ESTIMATE),
        }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

        
        const width = bounds.maxX - bounds.minX + (PADDING * 2);
        const height = bounds.maxY - bounds.minY + (PADDING * 2);

        toPng(viewport, { 
            backgroundColor: '#F8F9FA',
            width: width,
            height: height,
            style: {
                width: `${width}px`,
                height: `${height}px`,
                
                transform: `translate(${-bounds.minX + PADDING}px, ${-bounds.minY + PADDING}px) scale(1)`
            }
        })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${projectName || 'database-schema'}.png`;
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => {
            console.error('Failed to export image', err);
            alert("Could not download image.");
        });
    };
    const handleSave = async () => {
        if (!projectName.trim()) {
            alert("Please enter a project name");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: projectName,
                nodes: nodes,
                edges: edges,
                projectId: currentProjectId 
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/diagramss/save`, payload, {
                headers: { 'auth-token': token }
            });


            loadProject(res.data); 
            
            alert("Diagram saved successfully!");
        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to save diagram. Check console.");
        } finally {
            setIsSaving(false);
        }
    };
    const handleShare = () => {
        if (!currentProjectId) {
            alert("Please save the diagram first to generate a link.");
            return;
        }

        const shareUrl = `${window.location.origin}/shared/${currentProjectId}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            alert("Link copied to clipboard! You can send it to anyone.");
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    return(
        <>
        
            <nav className="navbar navbar-dark text-white navbar-expand-lg main-primary-color pt-2 pb-1">
                <div className="container-fluid">
                    <a className="" onClick={
                        () => navigate('/')
                    }>
                        <Logo logo={"d"}></Logo>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item ms-1  dropdown ">
                            <a className="nav-link dropdown-toggle canvas-nav-hover canvas-nav fw-bold px-3" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            File
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-360 280-560h400L480-360Z"/></svg>
                            </a>
                        <ul className="dropdown-menu text-black">
                            <li>
                                <a className="dropdown-item" onClick={() => navigate('/dashboard')}>Dashboard</a>
                            </li>
                            <li>
                                <a className="dropdown-item" onClick={handleCreateNew}>New Diagram</a>
                            </li>
                            <li className="dropdown-divider"></li>
                            <li>
                                <a className="dropdown-item" href="#">Save</a>
                            </li>
                            <li>
                                <a className="dropdown-item" onClick={downloadImage}>Download as png
                                    <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="28px" fill="#918c8cff"><path d="M260-500v-40h40v40h-40Zm400 140h40q25 0 42.5-17.5T760-420v-60h-60v60h-40v-120h100q0-25-17.5-42.5T700-600h-40q-25 0-42.5 17.5T600-540v120q0 25 17.5 42.5T660-360Zm-460 0h60v-80h60q17 0 28.5-11.5T360-480v-80q0-17-11.5-28.5T320-600H200v240Zm200 0h60v-96l40 96h60v-240h-60v94l-40-94h-60v240ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Zm0 0v-480 480Z"/></svg>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" onClick={() => setShowModal(true)}>Exporte Code
                                    <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="30px" fill="#918c8cff"><path d="m384-336 56-57-87-87 87-87-56-57-144 144 144 144Zm192 0 144-144-144-144-56 57 87 87-87 87 56 57ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" 
                                onClick={() => setShowAiModal(true)}
                                >Ask AI
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="28px" fill="#918c8cff"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm457-560 21-89-71-59 94-8 36-84 36 84 94 8-71 59 21 89-80-47-80 47ZM480-481Z"/></svg></a>
                            </li>
                        </ul>
                        </li>
                        <li className="nav-item ">
                            <a className="nav-link  canvas-nav-hover canvas-nav fw-bold px-3" href="#" role="button"  aria-current="page"
                            onClick={handleShare}
                            >
                            Share
                            </a>
                        </li>
                        <input className=" nit ms-2 fc text-white fw-bolder fs-5 main-primary-color border-0 border-bottom border-white" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Untitled Diagram"
                        />
                    </ul>
                    <div className="me-10 ">
                        <button className=" text-white  btn ai-glow-button d-flex align-items-center"
                        onClick={() => setShowAiModal(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm457-560 21-89-71-59 94-8 36-84 36 84 94 8-71 59 21 89-80-47-80 47ZM480-481Z"/></svg>
                        <span>AI Generate</span>
                    </button>
                    </div>
                    <div className="d-flex">

                        <button className="btn px-3 text-white canvas-nav-hover rounded-0 border-2 fw-bolder me-3
                        canvas-nav" onClick={clearCanvas}>Clear canvas </button>

                        <button className="btn px-3 text-white canvas-nav-hover rounded-0 border-2 fw-bolder me-3 canvas-nav"
                        onClick={() => setShowModal(true)} >Code</button>

                        <button className="btn px-4 text-white border-white rounded-0 border-2 canvas-nav-btn-hover fw-bolder canvas-nav"
                        onClick={handleSave}
                                disabled={isSaving} >
                                    {isSaving ? (
                                    <span><span className="spinner-border spinner-border-sm me-1"></span>Saving...</span>
                                ) : (
                                    <span><i className="bi bi-save me-1"></i> Save</span>
                                )}
                                </button>
                    </div>
                    </div>
                </div>
                </nav>
                <CodeExportModal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)} 
                    nodes={nodes} 
                    edges={edges} 
                />
                 <AiModal 
                    isOpen={showAiModal} 
                    onClose={() => setShowAiModal(false)} 
                />

            </>
    )
}