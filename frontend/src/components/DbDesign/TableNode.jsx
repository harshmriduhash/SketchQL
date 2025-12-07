import React, { memo } from 'react';
import TableHeading from './TableHeading';
import TableColumn from './TableColumn';

export default memo(({ data, selected }) => {
  return (
    <div 
     
      className="bg-white rounded-2"
      style={{ 
        minWidth: '300px', 
        backgroundColor: '#ffffff',
        
        
        border: selected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        
        
        boxShadow: selected 
          ? '0 0 0 4px rgba(59, 130, 246, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <table className="w-100" style={{ borderSpacing: 0, width: '100%' }}>
        <TableHeading label={data.label} color={data.color} />
        <tbody>
          {data.columns.map((col, index) => (
            <TableColumn key={index} col={col} selected={selected} />
          ))}
        </tbody>
      </table>
    </div>
  );
});