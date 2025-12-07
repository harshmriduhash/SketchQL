import { useStore } from '../../Store/store';

export default function SidebarHeading(){
    const addNewTable = useStore((state) => state.addNewTable);
    return(
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-light">
            <div className="d-flex align-items-center gap-2">
                <i className="bi bi-layout-sidebar text-secondary"></i>
                <span className="fw-bold text-dark fs-5">Tables</span>
            </div>
            <div className="me-3">
                <button className=" animate-up-1 shadow-hover border-0 bg-transparent hv" onClick={addNewTable}>
                    <svg  xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#a1a1a1ff"><path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/></svg>
                </button>
          </div>
            
        </div>
    )
}