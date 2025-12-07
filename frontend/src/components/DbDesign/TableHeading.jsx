export default function TableHeading({ label, color }) {
    const headerColor = color || '#3b82f6';

    return (
        <thead>

            <tr>
                <th 
                    colSpan={2} 
                    style={{ 
                        padding: 0, 
                        height: '6px', 
                        backgroundColor: headerColor, 
                        border: 'none',
                      
                        borderTopLeftRadius: '6px', 
                        borderTopRightRadius: '6px' 
                    }}
                ></th>
            </tr>
            

            <tr>
                <th 
                    colSpan={2} 
                    className="text-center"
                    style={{ 
                        backgroundColor: '#f8fafc', 
                        color: '#1e293b',           
                        fontSize: '1.125rem',       
                        fontWeight: '700',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '12px 16px' 
                    }}
                >
                    {label}
                </th>
            </tr>
        </thead>
    );
}