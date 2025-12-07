import DashNav from "./DashNav"
import Heading from "../../components/Landing/components/Heading"
import Btn from "../../components/Landing/components/Btn"
import db from "../../assets/db.png"

import { useEffect,useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../Store/authStore"
import { useStore } from "../../Store/store";

export default function Dashboard(){
    const navigate=useNavigate();
    const { token, user, logout } = useAuthStore();
    const { loadProject, resetCanvas } = useStore();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
            fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/diagramss/diagrams`, {
                headers: { 'auth-token': token }
            });
            setProjects(res.data);
        } catch (err) {
            console.error("Error fetching projects:", err);
            
           
            if (err.response && err.response.status === 401) {
                logout();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };
    const handleCreateNew = () => {
        resetCanvas(); 
        navigate('/design'); 
    };
    const handleOpenProject = (project) => {
        loadProject(project); 
        navigate('/design');
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); 
        if(!window.confirm("Are you sure you want to delete this diagram?")) return;

        try {
            await axios.delete(`${API_URL}/api/diagramss/delete/${id}`, {
                headers: { 'auth-token': token }
            });
            
            setProjects(projects.filter(p => p._id !== id));
        } catch (err) {
            alert("Failed to delete project");
        }
    }    



    return(
        <div className="container-fluid p-0 h-100vh ">
            <div className="bg-black dashboard-h ">
                
                <div className="">
                    <DashNav userName={user?.username} onClick={() => { logout(); navigate('/')}}/>
                </div>
                
                <div className="  borderc bg-light p-4 mt-5 container rounded-1 vh-50vh">
                    
                    <div className=" border-bottom pb-3 d-flex justify-content-between align-items-center">
                        <Heading className={"fs-4 fw-bold"} word={"My Diagrams"}/>
                        <Btn word={"New Diagram"} className={"main-primary-color btn-hover-color text-white"}
                        onClick={handleCreateNew} icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>}/>
                    </div>
                    {loading ? (
                        <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>
                    ):(
                        <div className="row mt-2 row-cols-1 row-cols-md-3 g-4">
                            {projects.length === 0 && (
                                    <div className="col-12 text-center text-muted mt-5">
                                        <p>No diagrams found. Create your first one!</p>
                                    </div>
                            )}
                            {projects.map((project) => (
                                
                                    <div className="col-md-4 col-lg-3" key={project._id}>
                                        <div 
                                            className="card h-100 shadow-sm-hover borderc2 animate-up-1" 
                                            style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                                            onClick={() => handleOpenProject(project)}
                                        >
                                            <div className="card-img-top  d-flex align-items-center justify-content-center " style={{height: '140px'}}>
                                                <img src={db} className="w-100 h-100 rounded-top" style={{ objectFit: 'cover' }} alt="sddddddddd" />
                                            </div>
                                            
                                            <div className="card-body">
                                                <h6 className=" card-title fw-bold text-dark mb-1">{project.name}</h6>
                                                <p className="border-bottom card-text text-muted small">
                                                    Edited {new Date(project.updatedAt).toLocaleDateString()}
                                                </p>
                                                <div className="d-flex justify-content-between  align-items-center mt-3">
                                                    <span className="">
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#766f6fff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                                                    </span>
                                                    <button 
                                                        className="btn btn-sm text-danger shadow-sm-hover"
                                                        onClick={(e) => handleDelete(e, project._id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff2e2eff"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                
                            ))}
                        </div>
                    )}


                </div>

            </div>
            <div className="main-bg-color-1"></div>
        </div>
    )
}