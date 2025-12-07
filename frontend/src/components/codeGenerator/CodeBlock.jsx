import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs'; 
export default function CodeBlock({ code, language }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); 
    };

    return (
        <div className="position-relative h-100 d-flex flex-column" style={{ backgroundColor: '#fff' }}>
     
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-light-subtle bg-white sticky-top">
                <span className="fw-bold text-secondary small text-uppercase spacing-wide" style={{ letterSpacing: '1px' }}>
                    {language === 'javascript' || language === 'jsx' ? 'JavaScript / Node' : language} Source
                </span>

                <button 
                    onClick={handleCopy}
                    className={`btn btn-sm d-flex align-items-center gap-2 border transition-all ${isCopied ? 'btn-success text-white' : 'btn-light text-secondary bg-white'}`}
                    style={{ borderRadius: '6px', fontWeight: '500' }}
                >
                    {isCopied ? (
                        <>
                            <i className="bi bi-check-lg"></i> 
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <i className="bi bi-clipboard"></i>
                            <span>Copy Code</span>
                        </>
                    )}
                </button>
            </div>

         
            <div className="flex-grow-1 overflow-auto custom-scrollbar" style={{ padding: '0' }}>
                <SyntaxHighlighter 
                    language={language}
                    style={github} 
                    showLineNumbers={true}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        backgroundColor: '#fff', 
                    }}
                    lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1em',
                        color: '#ced4da',
                        textAlign: 'right'
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}