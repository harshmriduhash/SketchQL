import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge, MarkerType } from '@xyflow/react';

import { persist, createJSONStorage } from 'zustand/middleware';
export const DATA_TYPES = ['INT', 'BIGINT', 'VARCHAR', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN', 'FLOAT'];

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
export const getTableColor = (index) => {
    
    const hue = (index * 137.508) % 360; 
   
    return hslToHex(hue, 65, 45);
};
const INITIAL_NODES = [
    {
        id: '1',
        type: 'tableNode',
        position: { x: 100, y: 100 },
        data: {
            label: 'Users',
            columns: [{ name: 'id', type: 'INT', isPK: true, isNullable: false }],
            color: getTableColor(0)
        }
    }
];
export const useStore=create(
    persist(
        (set,get)=>({
        nodes: [
            {
                id: '1',
                type: 'tableNode', 
                position: { x: 50, y: 50 },
                data: {
                    label: 'User',
                    columns: [
                        { name: 'id', type: 'INT',isPK: true, isNullable: false},
                        { name: 'username', type: 'VARCHAR',isPK: false, isNullable: false },
                        { name: 'email', type: 'VARCHAR',isPK: false, isNullable: false}
                    ]
                }
            },
        ],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId:null,
        currentProjectId: null,
        projectName: 'Untitled Diagram',
        loadProject: (project) => {
                set({
                    nodes: project.nodes || [],
                    edges: project.edges || [],
                    currentProjectId: project._id,
                    projectName: project.name
                });
            },
        setSelectedNode:(nodeId)=>{
            set({
                selectedNodeId:nodeId,
                selectedEdgeId:null,
            });
        },
        setSelectedEdge:(edgeId)=>{
            set({
                selectedEdgeId:edgeId,
                selectedNodeId:null
            })
        },
        updateNodeLabel:(nodeId,newLabel)=>{
            set({
                nodes:get().nodes.map((node)=>{
                    if(node.id==nodeId){
                        return {
                            ...node,
                            data:{
                                ...node.data,
                                label:newLabel
                            }
                        }
                    }
                    return node;
                })
            })
        },
        resetCanvas: () => {
            set({
                nodes: INITIAL_NODES, 
                edges: [],
                currentProjectId: null,
                projectName: 'Untitled Diagram',
                selectedNodeId: null,
                selectedEdgeId: null
            });
        },
        setProjectName: (name) => set({ projectName: name }),
        addColumn:(nodeId)=>{
            set({
                nodes:get().nodes.map((node)=>{
                    if(nodeId==node.id){
                        const newCol={
                            name:`new_col_${node.data.columns.length + 1}`,
                            type: 'VARCHAR',
                            isPK: false,
                            isNullable: true
                        }
                        return{
                            ...node,
                            data:{
                                ...node.data,
                                columns:[...node.data.columns,newCol]   
                            }
                        }
                    }
                    return node;
                })
            })
        },
        updateColumn:(nodeId,columnIndex,field,value)=>{
            set({
                nodes:get().nodes.map((node)=>{
                    if(nodeId==node.id){
                        const newColumns=node.data.columns.map((col,idx)=>{
                            if(idx==columnIndex){
                                return{
                                    ...col,
                                    [field]:value,
                                }
                            }
                            return col
                        })
                        return{
                            ...node,
                            data:{
                                ...node.data,
                                columns:newColumns
                            }
                        }
                    }
                    return node;
                })
            })
        },
        deleteColumn:(nodeId,colIndex)=>{
            set({
                nodes:get().nodes.map((node)=>{
                    if(nodeId==node.id){
                        const newColumns=node.data.columns.filter((col,idx)=>{
                            return idx!=colIndex
                        })
                        return{
                            ...node,
                            data:{
                                ...node.data,
                                columns:newColumns
                            }
                        }
                    }
                    return node
                })
            })
        },

        deleteTable: (nodeId) => {
            set({
                nodes: get().nodes.filter((node) => node.id !== nodeId),
                edges: get().edges.filter((edge) => 
                    edge.source !== nodeId && edge.target !== nodeId
                ),
                selectedNodeId: null, 
                selectedEdgeId: null,
            })
        },
        setPrimaryKey:(nodeId,colIndex)=>{
            set({
                nodes:get().nodes.map((node)=>{
                    if(nodeId==node.id){
                        const newColumns=node.data.columns.map((col,idx)=>{
                            if(idx==colIndex){
                                return {...col,isPK:true,isNullable:false}
                            }
                            return{...col,isPK:false}
                        })
                        return{
                            ...node,
                            data:{
                                ...node.data,
                                columns:newColumns
                            }
                        }
                    }
                    return node;
                    
                })
            })
        },

        onNodesChange: (changes) => {
            set({
                nodes: applyNodeChanges(changes, get().nodes),
            });
        },

        onEdgesChange: (changes) => {
            set({
                edges: applyEdgeChanges(changes, get().edges),
            });
        },

        onConnect: (connection) => {
            set({
                edges: addEdge({
                    ...connection,
                    type:'step',
                    animated:false,
                    style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    markerStart: 'rel-one-start',
                    markerEnd: 'rel-many-end',
                    data:{label:'1:N'}
                },get().edges),
            });
        },
        updateEdgeLabel:(edgeId,label)=>{
            set({
                edges:get().edges.map((edge)=>{
                    if(edgeId==edge.id){
                        let newMarkerEnd = undefined;
                        let newMarkerStart = undefined;
                        if (label === '1:N') {
                    newMarkerStart = 'rel-one-start'; 
                    newMarkerEnd = 'rel-many-end';    
                } 
                else if (label === 'N:1') {
                    newMarkerStart = 'rel-many-start'; 
                    newMarkerEnd = 'rel-one-end';      
                } 
                else if (label === '1:1') {
                    newMarkerStart = 'rel-one-start';  
                    newMarkerEnd = 'rel-one-end';      
                }   
                        return {
                            ...edge,
                            markerEnd: newMarkerEnd,
                            markerStart: newMarkerStart,
                            data: { ...edge.data, label: label }
                        };
                    }
                    return edge
                })
            })
        },
        deleteEdge:(edgeId)=>{
            set({
                edges:get().edges.filter((edge)=>edge.id !==edgeId),
                selectedEdgeId:null
            })
        },
        updateNodeColor: (nodeId, color) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    // Update the color property inside data
                    return { ...node, data: { ...node.data, color: color } };
                }
                return node;
            })
        });
        },


        
        nodeToFocus: null, 
        setNodeToFocus: (id) => set({ nodeToFocus: id }),
        addNewTable: () => {
        const currentNodes = get().nodes;
        const newTableId = `table_${Date.now()}`;
        const nextColor = getTableColor(currentNodes.length);;

        // 1. GRID CONFIGURATION (3 Columns)
        const startX = 50;
        const startY = 50;
        const colWidth = 400; // Slightly wider to avoid overlap
        const rowHeight = 500; 
        const maxCols = 3;    // <--- CHANGED TO 3 COLUMNS

        let newX = startX;
        let newY = startY;
        let slotFound = false;
        let index = 0;

        // 2. Find the first empty slot
        while (!slotFound) {
            const row = Math.floor(index / maxCols);
            const col = index % maxCols;
            
            const candidateX = startX + (col * colWidth);
            const candidateY = startY + (row * rowHeight);

            // Simple collision check
            const isOccupied = currentNodes.some(n => 
                Math.abs(n.position.x - candidateX) < 100 && 
                Math.abs(n.position.y - candidateY) < 100
            );

            if (!isOccupied) {
                newX = candidateX;
                newY = candidateY;
                slotFound = true;
            }
            index++;
        }

        const newNode = {
            id: newTableId,
            type: 'tableNode',
            position: { x: newX, y: newY },
            data: {
                label: `New Table ${currentNodes.length + 1}`,
                columns: [{ name: 'id', type: 'INT', isPK: true, isNullable: false }],
                color: nextColor
            }
        };
        
        set({
            nodes: [...currentNodes, newNode],
            selectedNodeId: newTableId, 
            selectedEdgeId: null,
            nodeToFocus: newTableId // <--- TRIGGER THE CAMERA FOCUS
        });
    },
        clearCanvas: () => {
            if(window.confirm("Are you sure you want to clear the entire diagram? This cannot be undone.")){
                set({
                    nodes: [],
                    edges: [],
                    selectedNodeId: null,
                    selectedEdgeId: null
                });
            }
        },   
    }),
    {
    name: 'db-design-storage', 
    storage: createJSONStorage(() => localStorage), 
    }
))