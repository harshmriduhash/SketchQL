import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock.jsx';


import generateFlaskSQLAlchemy from './generateFlaskSQLAlchemy.js';
import generateMySQL from './generateMySQL.js';
import generateMongoose from './generateMongoose.js';
import generateJava from './generateJava.js';
import generateCSharp from './generateCSharp.js';

const GENERATORS = {
    'sqlalchemy': { name: 'Python (SQLAlchemy)', lang: 'python', color: '#3776ab' },
    'mongoose':   { name: 'MERN (Mongoose)', lang: 'javascript', color: '#68a063' },
    'java':       { name: 'Java (Spring Boot)', lang: 'java', color: '#b07219' },        
    'csharp':     { name: 'C# (Entity Framework)', lang: 'csharp', color: '#178600' }, 
    'mysql':      { name: 'SQL Script', lang: 'sql', color: '#f29111' }
};

export default function CodeExportModal({ isOpen, onClose, nodes, edges }) {
    const [selectedLang, setSelectedLang] = useState('sqlalchemy');
    const [code, setCode] = useState('');

    useEffect(() => {
        if (isOpen && nodes) {
            const generator = GENERATORS[selectedLang];
            if (generator) {
                let generatedCode = '';
                
                
               
                
                try {
                    if(selectedLang === 'sqlalchemy') generatedCode = generateFlaskSQLAlchemy(nodes, edges);
                    if(selectedLang === 'mongoose') generatedCode = generateMongoose(nodes, edges);
                    if(selectedLang === 'java') generatedCode = generateJava(nodes, edges);
                    if(selectedLang === 'csharp') generatedCode = generateCSharp(nodes, edges);
                    if(selectedLang === 'mysql') generatedCode = generateMySQL(nodes, edges);
                } catch (error) {
                    console.error("Generator failed:", error);
                    generatedCode = `Error generating code: ${error.message}`;
                }

                setCode(generatedCode || ""); 
            }
        }
    }, [selectedLang, isOpen, nodes, edges]);

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(23, 23, 23, 0.4)', backdropFilter: 'blur(2px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 overflow-hidden" style={{ borderRadius: '16px', height: '80vh', display: 'flex', flexDirection: 'row' }}>
                    
                   
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '280px', backgroundColor: '#f8f9fa', borderRight: '1px solid #e9ecef' }}>
                        <div className="p-4 pb-2">
                            <h6 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>Export Schema</h6>
                            <p className="text-muted small m-0 mt-1">Select a target framework</p>
                        </div>

                        <div className="list-group list-group-flush px-3 pt-2 overflow-y-auto">
                            {Object.keys(GENERATORS).map((key) => {
                                const isActive = selectedLang === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedLang(key)}
                                        className="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 mb-1 py-2 px-3 transition-all"
                                        style={{
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? '#ffffff' : 'transparent',
                                            boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.04)' : 'none',
                                            color: isActive ? '#000' : '#6c757d',
                                            fontWeight: isActive ? '600' : '400',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isActive ? GENERATORS[key].color : '#dee2e6' }}></div>
                                        <span style={{ fontSize: '14px' }}>{GENERATORS[key].name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-auto p-3 border-top border-light-subtle">
                             <button onClick={onClose} className="btn btn-light w-100 text-secondary fw-medium" style={{ borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                Close
                             </button>
                        </div>
                    </div>

                   
                    <div className="flex-grow-1 d-flex flex-column bg-white">
                       
                        <CodeBlock 
                            key={selectedLang} 
                            code={code} 
                            language={GENERATORS[selectedLang].lang} 
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}