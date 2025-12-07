const SQLALCHEMY_TYPE_MAP = {
    'INT': 'db.Integer',
    'BIGINT': 'db.BigInteger',
    'VARCHAR': 'db.String(255)',
    'TEXT': 'db.Text',
    'DATE': 'db.Date',
    'DATETIME': 'db.DateTime',
    'BOOLEAN': 'db.Boolean',
    'FLOAT': 'db.Float'
};

export default function generateFlaskSQLAlchemy(nodes, edges) {
    let code = `from flask_sqlalchemy import SQLAlchemy\n\ndb = SQLAlchemy()\n\n`;

    nodes.forEach(node => {
        const className = node.data.label.charAt(0).toUpperCase() + node.data.label.slice(1);
        const tableName = node.data.label.toLowerCase();

        code += `class ${className}(db.Model):\n`;
        code += `    __tablename__ = '${tableName}'\n\n`;

        node.data.columns.forEach((col) => {
            let colDef = `    ${col.name} = db.Column(${SQLALCHEMY_TYPE_MAP[col.type] || 'db.String(255)'}`;

          
            const edge = edges.find(e => 
                e.source === node.id && 
                e.sourceHandle && 
                
                e.sourceHandle.replace('-left', '').replace('-right', '') === col.name
            );

            if (edge) {
                const targetNode = nodes.find(n => n.id === edge.target);
                if (targetNode) {
                    
                    const targetCol = edge.targetHandle
                        .replace(`${targetNode.data.label}-`, '') 
                        .replace('-left', '')
                        .replace('-right', '');

                    colDef += `, db.ForeignKey('${targetNode.data.label.toLowerCase()}.${targetCol}')`;
                }
            }

            if (col.isPK) {
                colDef += `, primary_key=True`;
            }
            if (!col.isNullable && !col.isPK) {
                colDef += `, nullable=False`;
            }
            colDef += `)\n`;
            code += colDef;
        });

       
        const incomingEdges = edges.filter(e => e.target === node.id);
        incomingEdges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            if(sourceNode){
                 code += `    # Relationship from ${sourceNode.data.label}\n`
            }
        });

        code += `\n    def __repr__(self):\n`;
        code += `        return f'<${className} {self.id}>'\n\n`;
    });

    return code;
}