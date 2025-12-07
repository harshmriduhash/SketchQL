import { useState, useEffect } from "react";
import { useStore } from "../../Store/store";
import SidebarTableEdit from "./SidebarTableEdit";
import SidebarHeading from "./SidebarHeading";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const nodes = useStore((state) => state.nodes);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const deleteTable = useStore((state) => state.deleteTable);
  const [renamingId, setRenamingId] = useState(null);
  const [tempName, setTempName] = useState("");

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (selectedNodeId) {
      setExpandedId(selectedNodeId);
      setIsOpen(true);
    } else {
      setExpandedId(null);
    }
  }, [selectedNodeId]);

  const toggleExpand = (id) => {
    if (renamingId === id) return;

    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setSelectedNode(id);
    }
  };
  const handleDeleteClick = (e, nodeId) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this table?")) {
        deleteTable(nodeId);
    }
  };

  const handleEditClick = (e, node) => {
    e.stopPropagation();
    setRenamingId(node.id);
    setTempName(node.data.label);
  };

  const saveName = () => {
    if (renamingId && tempName.trim() !== "") {
      updateNodeLabel(renamingId, tempName);
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveName();
    }
  };

  return (
    <div className="d-flex h-100 position-relative">
      <div
        className="h-100 bg-white d-flex flex-column shadow-sm"
        style={{
          width: isOpen ? "320px" : "0px",
          transition: "width 0.3s ease-in-out",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <SidebarHeading />
        <div className="flex-grow-1 overflow-auto">
          {nodes.length === 0 ? (
            <div className="text-center text-muted mt-5">
              No tables yet.
              <br />
              Use the AI or "Add Table" button.
            </div>
          ) : (
            <div className="d-flex flex-column">
              {nodes.map((node) => {
                const isExpanded = expandedId === node.id;
                const nodeColor = node.data.color || "#6c757d";
                
              
                const isRenaming = renamingId === node.id; 
                

                return (
                  <div key={node.id} className="d-flex flex-column">
                    <div
                      onClick={() => toggleExpand(node.id)}
                      className={`d-flex align-items-center justify-content-between px-0 border-bottom ${
                        isExpanded
                          ? "sidebar-table-color2 bg-opacity-10"
                          : "sidebar-table-color hover-bg-light"
                      }`}
                      style={{
                        cursor: "pointer",
                        height: "45px",
                        transition: "background 0.2s",
                      }}
                    >
                      <div className="d-flex  bg- align-items-center h-100 flex-grow-1">
                        <div
                          style={{
                            width: "6px",
                            height: "100%",
                            backgroundColor: nodeColor,
                          }}
                        ></div>
                        {isRenaming ? (
                          <input
                            type="text"
                            className="form-control form-control-sm ms-2 shadow-none border-primary"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={saveName}    
                            onKeyDown={handleKeyDown} 
                            onClick={(e) => e.stopPropagation()} 
                            autoFocus 
                            style={{ maxWidth: '160px' }}
                          />
                        ) : (
                          <span className={`ms-3 fw-bold small ${isExpanded ? "text-primary" : "text-dark"}`}>
                            {node.data.label}
                          </span>
                        )}
                      </div>

                      <div className="d-flex align-items-center pe-2 gap-2">
                        {isExpanded && !isRenaming && (
                          <>
                            <button
                              className="border-0 bg-transparent p-0 text-primary"
                              title="Edit Name"
                              onClick={(e) => handleEditClick(e, node)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#8a8686ff"
                              >
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                              </svg>
                            </button>
                            <button
                              className="border-0 bg-transparent p-0 text-primary"
                              title="Focus"
                              onClick={(e) => {
                                e.stopPropagation();
                                useStore.getState().setNodeToFocus(node.id);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#8a8686ff"
                              >
                                <path d="M480-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Zm0-80ZM200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600ZM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z" />
                              </svg>
                            </button>
                            <button
                              className="border-0 bg-transparent p-0 text-danger"
                              title="Delete Table"
                              onClick={(e) => handleDeleteClick(e, node.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#8a8686ff">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                              </svg>
                            </button>
                          </>
                        )}
                        
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="animate-slide-down">
                        <SidebarTableEdit node={node} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border shadow-sm rounded-circle d-flex align-items-center justify-content-center position-absolute"
        style={{
          top: "20px",
          left: isOpen ? "320px" : "0px",
          width: "32px",
          height: "32px",
          marginLeft: isOpen ? "-16px" : "16px",
          zIndex: 100,
          transition: "left 0.3s ease-in-out, margin-left 0.3s ease-in-out",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#8c8c8cff"
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z" />
        </svg>
      </button>
    </div>
  );
}