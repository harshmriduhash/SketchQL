import SidebarHeading from "./SidebarHeading.jsx";
import { useStore } from '../../Store/store';
import SidebarTableEdit from "./SidebarTableEdit.jsx";
import SidebarEdgeEdit from "./SidebarEdgeEdit.jsx";

export default function Sidebar() {
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges); 
    
    const selectedEdgeId = useStore((state) => state.selectedEdgeId); 
    const selectedNodeId = useStore((state) => state.selectedNodeId);
    
    const activeNode = nodes.find(n => n.id === selectedNodeId);
    const selectedEdge = edges.find(e => e.id === selectedEdgeId);

    // Debugging
    console.log("Sidebar Render - Node:", activeNode?.id, "Edge:", selectedEdge?.id);

    // Helper to reset selection
    const clearSelection = () => {
        useStore.getState().setSelectedNode(null);
        useStore.getState().setSelectedEdge(null);
    };

    return (
        <div className="h-100 shadow-lg bg-white d-flex flex-column">
            
            {/* 1. PRIORITY: Show Table Edit */}
            {activeNode ? (
                <>
                    <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-primary">Edit Table</span>
                        <button className="btn btn-sm btn-close" onClick={clearSelection}></button>
                    </div>
                    <div className="flex-grow-1 overflow-auto">
                        <SidebarTableEdit node={activeNode} />
                    </div>
                </>
            ) : selectedEdge ? ( 
                /* 2. PRIORITY: Show Edge Edit (This part was missing/broken logic) */
                <>
                    <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-success">Edit Relationship</span>
                        <button className="btn btn-sm btn-close" onClick={clearSelection}></button>
                    </div>
                    <div className="flex-grow-1 overflow-auto p-3">
                        <SidebarEdgeEdit edge={selectedEdge} />
                    </div>
                </>
            ) : (
                /* 3. DEFAULT: Show List */
                <>
                    <SidebarHeading />
                    <div className="flex-grow-1 overflow-auto p-2">
                        {nodes.length === 0 ? (
                            <div className="text-center text-muted mt-4">
                                <small>No tables yet.<br/>Click "Add" or use AI.</small>
                            </div>
                        ) : (
                            <ul className="list-group">
                                {nodes.map((node) => (
                                    <li 
                                        key={node.id}
                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 rounded mb-1"
                                        onClick={() => useStore.getState().setSelectedNode(node.id)}
                                        style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                                    >
                                        <span className="fw-bold small">{node.data.label}</span>
                                        <i className="bi bi-pencil-square text-muted"></i>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}