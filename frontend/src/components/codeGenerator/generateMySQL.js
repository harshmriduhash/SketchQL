export default function generateMySQL(nodes, edges) {
    let code = '';


    nodes.forEach(node => {
        code += `CREATE TABLE ${node.data.label} (\n`;

        const colLines = node.data.columns.map(col => {
            let line = `    ${col.name} ${col.type}`;
            if (!col.isNullable) line += ' NOT NULL';
            if (col.isPK) line += ' PRIMARY KEY';
            return line;
        });

        code += colLines.join(',\n');
        code += `\n);\n\n`;
    });


    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
    
            const sourceCol = edge.sourceHandle
                .replace('-left', '')
                .replace('-right', '');

            const targetCol = edge.targetHandle
                .replace('-left', '')
                .replace('-right', '');

            code += `ALTER TABLE ${sourceNode.data.label}\n`;
            code += `ADD FOREIGN KEY (${sourceCol}) REFERENCES ${targetNode.data.label}(${targetCol});\n\n`;
        }
    });

    return code;
}