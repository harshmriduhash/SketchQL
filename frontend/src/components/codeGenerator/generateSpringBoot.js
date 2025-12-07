const JAVA_TYPE_MAP = {
    'INT': 'Integer',
    'BIGINT': 'Long',
    'VARCHAR': 'String',
    'TEXT': 'String',
    'DATE': 'LocalDate',
    'DATETIME': 'LocalDateTime',
    'BOOLEAN': 'Boolean',
    'FLOAT': 'Double'
};

export default function generateSpringBoot(nodes, edges) {
    let code = `// You typically put these in separate files. Displaying all here for copy-paste.\n\n`;
    code += `import jakarta.persistence.*;\nimport java.util.*;\n\n`;

    nodes.forEach(node => {
        const className = node.data.label.charAt(0).toUpperCase() + node.data.label.slice(1);
        
        code += `@Entity\n@Table(name = "${node.data.label.toLowerCase()}")\n`;
        code += `public class ${className} {\n\n`;

        node.data.columns.forEach(col => {
            if (col.isPK) {
                code += `    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n`;
            }


            const edge = edges.find(e => 
                e.source === node.id && 
                e.sourceHandle && 
                e.sourceHandle.replace('-left', '').replace('-right', '') === col.name
            );

            if (edge) {
                const targetNode = nodes.find(n => n.id === edge.target);
                const targetClass = targetNode.data.label.charAt(0).toUpperCase() + targetNode.data.label.slice(1);
                
                code += `    @ManyToOne\n`;
                code += `    @JoinColumn(name = "${col.name}")\n`;
                code += `    private ${targetClass} ${targetNode.data.label.toLowerCase()};\n\n`;
            } else {
                if (!col.isNullable && !col.isPK) code += `    @Column(nullable = false)\n`;
                
                const javaType = JAVA_TYPE_MAP[col.type] || 'String';
                code += `    private ${javaType} ${col.name};\n\n`;
            }
        });

        code += `    // Getters and Setters omitted for brevity\n`;
        code += `}\n\n`;
    });

    return code;
}