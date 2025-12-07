import React from 'react';

export default function CustomMarkers() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>

        <marker
          id="rel-many-end"
          markerWidth="12" 
          markerHeight="12" 
          refX="12"
          refY="6" 
          orient="auto"
        >
          <path d="M0 0 L12 6 L0 12" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
          <path d="M6 6 L12 6" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
        </marker>

       
        <marker
          id="rel-many-start"
          markerWidth="12"
          markerHeight="12"
          refX="0" 
          refY="6"
          orient="auto"
        >
          <path d="M12 0 L0 6 L12 12" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
          <path d="M6 6 L0 6" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
        </marker>

       
        <marker
          id="rel-one-end"
          markerWidth="12"
          markerHeight="12"
          refX="11"
          refY="6"
          orient="auto"
        >
          <path d="M0 6 L11 6" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
          <path d="M11 0 L11 12" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
        </marker>

       
        <marker
          id="rel-one-start"
          markerWidth="12"
          markerHeight="12"
          refX="1"
          refY="6"
          orient="auto"
        >
          <path d="M12 6 L1 6" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
          <path d="M1 0 L1 12" fill="none" stroke="#b1b1b7" strokeWidth="1.5" />
        </marker>
      </defs>
    </svg>
  );
}