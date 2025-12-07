  import { useState, useEffect } from 'react';
  import { ReactFlow,Background, Controls, MiniMap,StepEdge,addEdge} from '@xyflow/react';
  import '@xyflow/react/dist/style.css';
import TableEdge from './TableEdge';
  import TableNode from './TableNode';
  import { useStore } from '../../Store/store';
import CustomMarkers from './CustomMarkers';
  const nodeTypes = {
    tableNode: TableNode,
  };

  const edgeTypes = {
  step: TableEdge, 
};

const defaultEdgeOptions = {
  type: 'step', 
  style: { 
    strokeWidth: 2, 
    stroke: '#b1b1b7',
    cursor: 'pointer' 
  },
  interactionWidth: 20, 
  
};

  export default function Table() {
  const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const onNodesChange = useStore((state) => state.onNodesChange);
    const onEdgesChange = useStore((state) => state.onEdgesChange);
    const onConnect = useStore((state) => state.onConnect);
    const setSelectedEdge = useStore((state) => state.setSelectedEdge);
    const deleteEdge = useStore((state) => state.deleteEdge);
    const setSelectedNode = useStore((state) => state.setSelectedNode);
    const nodeToFocus = useStore((state) => state.nodeToFocus);
    const setNodeToFocus = useStore((state) => state.setNodeToFocus);
    const [rfInstance, setRfInstance] = useState(null);
    useEffect(() => {
        if (nodeToFocus && rfInstance) {
            const node = nodes.find((n) => n.id === nodeToFocus);
            if (node) {
                rfInstance.setCenter(
                    node.position.x + 150, 
                    node.position.y + 150,
                    { zoom: 1, duration: 1000 }
                );
                
                setNodeToFocus(null);
            }
        }
    }, [nodeToFocus, rfInstance, nodes, setNodeToFocus]);
    return (

      <div style={{ width: '100%', height: '100%' }}>
        <CustomMarkers />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          onInit={setRfInstance}
          onEdgeClick={(event, edge) => {
            event.stopPropagation();
            console.log("Edge Clicked:", edge.id)
              setSelectedEdge(edge.id);
              
              event.stopPropagation(); 
              
          }}
          onNodeClick={(event, node) => {
   
          setSelectedNode(node.id);
    
          }}
          onPaneClick={() => setSelectedEdge(null)}
          onEdgesDelete={(edgesToDelete) => {
           
            if (edgesToDelete.length > 0) {
                deleteEdge(edgesToDelete[0].id);
            }
        }}

          >
          <Background gap={12} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={() => '#0d6efd'}
            style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
        />
        </ReactFlow>
        
      </div>

    );
  }