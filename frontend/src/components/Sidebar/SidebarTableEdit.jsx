  import { useStore, DATA_TYPES } from "../../Store/store";

  export default function SidebarTableEdit({ node }) {
    const addColumn = useStore((state) => state.addColumn);
    const updateColumn = useStore((state) => state.updateColumn);
    const deleteColumn = useStore((state) => state.deleteColumn);
    const setPrimaryKey = useStore((state) => state.setPrimaryKey);

    if (!node) return null;

    const themeColor = "#20c9a7ff"; 

    return (
      <div className="bg-white border-start border-end border-bottom">
        
        <div className="p-2 d-flex flex-column gap-2">
          {node.data.columns.map((col, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
                
              <input
                type="text"
                className="form-control form-control-sm border-secondary-subtle"
                value={col.name}
                placeholder="name"
                onChange={(e) => updateColumn(node.id, index, 'name', e.target.value)}
                style={{ flex: 2, height: '32px' }}
              />
              <div style={{ flex: 1.5 }}>
                  <input
                      list="dataTypes"
                      className="form-control form-control-sm border-secondary-subtle"
                      value={col.type}
                      placeholder="type"
                      onChange={(e) => updateColumn(node.id, index, 'type', e.target.value)}
                      style={{ height: '32px' }}
                  />
                  
                  <datalist id="dataTypes">
                      {DATA_TYPES.map((t) => (
                          <option key={t} value={t} />
                      ))}
                  </datalist>
              </div>
              <button 
                  className="border-0   fw-bold"
                  style={{ 
                      width: '24px', 
                      color: col.isNullable ? themeColor : '#adb5bd'
                  }}
                  title="Toggle Nullable"
                  onClick={() => updateColumn(node.id, index, 'isNullable', !col.isNullable)}
              >
                  N
              </button>

              <button 
                  className="border-0 bg-transparent p-0" 
                  style={{ 
                      width: '20px',
                      color: col.isPK ? themeColor : '#adb5bd',
                      cursor: 'pointer'
                  }}
                  title="Toggle Primary Key"
                  onClick={() => setPrimaryKey(node.id, index)}
              >

                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                            </svg>
              </button>
              <div className="dropdown">
                  <button 
                      className="border-0 bg-transparent text-muted p-0" 
                      type="button" 
                      data-bs-toggle="dropdown"
                      style={{ width: '20px' }}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7f7878ff"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
                  </button>
                  <ul className="dropdown-menu dropend shadow-sm border-0">
                      <li>
                          <button className="dropdown-item text-danger fw-bolder bg-primary rounded-1 " onClick={() => deleteColumn(node.id, index)}>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg> Delete column
                          </button>
                      </li>
                  </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end gap-2 p-2 border-top mt-1">
          
          <button 
              className="btn rounded-1  fw-bolder px-2 py-2" 
              style={{ 
                  border: `1px solid ${themeColor}`, 
                  color: themeColor,
                  fontSize: '0.9rem' 
              }}
              onClick={() => addColumn(node.id)}
          >
              Add Column
          </button>
        </div>
      </div>
    );
  }