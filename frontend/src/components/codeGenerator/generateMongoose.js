const MONGOOSE_TYPE_MAP = {
    'INT': 'Number',
    'BIGINT': 'Number',
    'VARCHAR': 'String',
    'TEXT': 'String',
    'DATE': 'Date',
    'DATETIME': 'Date',
    'BOOLEAN': 'Boolean',
    'FLOAT': 'Number'
};

export default function generateMongoose(nodes, edges) {
    let code = `const mongoose = require('mongoose');\n\n`;

    nodes.forEach(node => {
        const schemaName = node.data.label + 'Schema'; 
        const modelName = node.data.label;           

        code += `// ${modelName} Schema\n`;
        code += `const ${schemaName} = new mongoose.Schema({\n`;

        node.data.columns.forEach(col => {

            if (col.name === 'id' && col.type === 'INT') return;

            let fieldDef = `  ${col.name}: {\n`;
            
  
            const edge = edges.find(e => 
                e.source === node.id && 
                e.sourceHandle && 
                e.sourceHandle.replace('-left', '').replace('-right', '') === col.name
            );

            if (edge) {
               
                const targetNode = nodes.find(n => n.id === edge.target);
                if (targetNode) {
                    fieldDef += `    type: mongoose.Schema.Types.ObjectId,\n`;
                    fieldDef += `    ref: '${targetNode.data.label}', // Links to ${targetNode.data.label} model\n`;
                }
            } else {
                
                fieldDef += `    type: ${MONGOOSE_TYPE_MAP[col.type] || 'String'},\n`;
            }

           
            if (!col.isNullable) fieldDef += `    required: true,\n`;
            if (col.isPK) fieldDef += `    unique: true,\n`; 
            
            fieldDef += `  },\n`;
            code += fieldDef;
        });

        code += `}, { timestamps: true });\n\n`;
        code += `const ${modelName} = mongoose.model('${modelName}', ${schemaName});\n\n`;
    });

 
    code += `module.exports = {\n`;
    nodes.forEach(node => {
        code += `  ${node.data.label},\n`;
    });
    code += `};\n`;

    return code;
}