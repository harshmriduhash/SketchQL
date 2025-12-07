const CSHARP_TYPE_MAP = {
    'INT': 'int',
    'BIGINT': 'long',
    'VARCHAR': 'string',
    'TEXT': 'string',
    'DATE': 'DateTime',
    'DATETIME': 'DateTime',
    'BOOLEAN': 'bool',
    'FLOAT': 'double'
};

export default function generateCSharp(nodes, edges) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\n\n`;

    code += `namespace MyApp.Models\n{\n`;

    nodes.forEach(node => {
        const className = node.data.label.charAt(0).toUpperCase() + node.data.label.slice(1);
        
        code += `    [Table("${node.data.label.toLowerCase()}")]\n`;
        code += `    public class ${className}\n    {\n`;

        node.data.columns.forEach(col => {
            const edge = edges.find(e => 
                e.source === node.id && 
                e.sourceHandle && 
                e.sourceHandle.replace('-left', '').replace('-right', '') === col.name
            );

            if (edge) {
               
                const targetNode = nodes.find(n => n.id === edge.target);
                if(targetNode){
                    const targetClass = targetNode.data.label.charAt(0).toUpperCase() + targetNode.data.label.slice(1);
                    
                    code += `        [ForeignKey("${targetClass}")]\n`;
                    code += `        public int ${col.name} { get; set; }\n`;
                    code += `        public virtual ${targetClass} ${targetClass} { get; set; }\n`;
                }
            } else {
                if (col.isPK) {
                    code += `        [Key]\n`;
                    code += `        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]\n`;
                }
                if (!col.isNullable && !col.isPK) {
                    code += `        [Required]\n`;
                }

                const csType = CSHARP_TYPE_MAP[col.type] || 'string';
                
                const typeString = (col.isNullable && csType !== 'string') ? `${csType}?` : csType;
                
                code += `        public ${typeString} ${col.name} { get; set; }\n`;
            }
            code += `\n`;
        });

        code += `    }\n\n`;
    });

    code += `}\n`;
    return code;
}