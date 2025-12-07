import { Position, Handle } from '@xyflow/react';

export default function TableColumn({ col, selected }) {
    const isPK = col.isPK;
    
 
    const nameColor = isPK ? '#1e293b' : '#334155'; 
    const typeColor = '#94a3b8'; 
    const fontWeight = isPK ? '700' : '400';

    const handleStyle = {
        width: '12px',     
        height: '12px',
        background: '#3b82f6',
        border: '2px solid white', 
        borderRadius: '50%',
        zIndex: 10,         
        opacity: selected ? 1 : 0, 
        transition: 'opacity 0.2s',
    };

    return (
        <tr className="position-relative">
            
            
            <td className="ps-4 py-2 text-start position-relative" style={{ border: 'none' }}>
                
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    id={`${col.name}-left`} 
                   
                    style={{ ...handleStyle, left: '-6px' }} 
                />

                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>
                        {isPK ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                            </svg>
                        ) : col.name === 'registration_number' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M12 2v20M20 20L4 4m16 0L4 20"/></svg>
                        ) : null}
                    </div>

                    <span style={{ color: nameColor, fontWeight: fontWeight, fontSize: '0.95rem' }}>
                        {col.name}
                    </span>
                </div>
            </td>

       
            <td className="pe-4 py-2 text-end position-relative" style={{ border: 'none' }}>
                <span style={{ color: typeColor, fontSize: '0.9rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                    {col.type.toLowerCase()}
                </span>

                <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={`${col.name}-right`} 
                    style={{ ...handleStyle, right: '-6px' }} 
                />
            </td>
        </tr>
    );
}