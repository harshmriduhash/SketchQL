import React from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getSmoothStepPath,
  getBezierPath,
  useReactFlow 
} from '@xyflow/react';
import { useStore } from '../../Store/store';

export default function TableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerStart,
  markerEnd,
  selected,
  data
}) {
  const { setEdges } = useReactFlow();
  const updateEdgeLabel = useStore((state) => state.updateEdgeLabel);
  const deleteEdge = useStore((state) => state.deleteEdge);


  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });


  const onLabelClick = (evt, label) => {
    evt.stopPropagation(); 
    updateEdgeLabel(id, label);
  };


  const onDeleteClick = (evt) => {
    evt.stopPropagation();
    deleteEdge(id);
  };

  return (
    <>
     
      <BaseEdge path={edgePath} markerEnd={markerEnd} 
      markerStart={markerStart}
      style={{...style, strokeWidth: 2}} />

     
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY - 10}px)`,
              fontSize: 12,
              
              pointerEvents: 'all',
            }}
            className="nopan"
          >
            <div 
              className="d-flex align-items-center gap-1 p-1 rounded-1 shadow-sm"
              style={{
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                color: 'white'
              }}
            >
              
              <button 
                className="btn btn-sm p-0 fw-bold" 
                style={{ 
                   color: data?.label === '1:1' ? '#fff' : '#94a3b8', 
                   backgroundColor: data?.label === '1:1' ? '#334155' : 'transparent',
                   width: '32px', height: '24px', fontSize: '0.75rem', border: 'none'
                }}
                onClick={(e) => onLabelClick(e, '1:1')}
              >
                1:1
              </button>
              
              <button 
                className="btn btn-sm p-0 fw-bold"
                style={{ 
                   color: data?.label === '1:N' ? '#fff' : '#94a3b8', 
                   backgroundColor: data?.label === '1:N' ? '#334155' : 'transparent',
                   width: '32px', height: '24px', fontSize: '0.75rem', border: 'none'
                }}
                onClick={(e) => onLabelClick(e, '1:N')}
              >
                1:N
              </button>

              <button 
                className="btn btn-sm p-0 fw-bold"
                style={{ 
                   color: data?.label === 'N:1' ? '#fff' : '#94a3b8', 
                   backgroundColor: data?.label === 'N:1' ? '#334155' : 'transparent',
                   width: '32px', height: '24px', fontSize: '0.75rem', border: 'none'
                }}
                onClick={(e) => onLabelClick(e, 'N:1')}
              >
                N:1
              </button>

             
              <div style={{ width: '1px', height: '16px', backgroundColor: '#475569', margin: '0 4px' }}></div>

       
              <button 
                className="btn btn-sm p-0 text-danger"
                style={{ width: '24px', height: '24px', border: 'none', background: 'transparent' }}
                onClick={onDeleteClick}
                title="Delete Relationship"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
              </button>
            </div>
            

            <div style={{ 
                width: 0, 
                height: 0, 
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1e293b',
                margin: '0 auto'
            }}></div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}