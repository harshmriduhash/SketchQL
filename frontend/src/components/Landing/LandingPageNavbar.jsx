import Logo from "./components/Logo"
import NavLink from "./components/NavLink"
import Btn from "./components/Btn"
import { useNavigate } from "react-router-dom"
import logoImg from "../../assets/logo.png"
export default function LandingPageNavbar(){
    const navigate = useNavigate();
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return(
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                <a className="ms-3" href="#">
                    <Logo logo={logoImg} ></Logo>
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item ms-5">
                            
                            <NavLink onClick={() => scrollToSection('features')} word={"Features"}></NavLink>
                        </li>
                        <li className="nav-item">
                           <NavLink onClick={() => scrollToSection('techStack')} word={"TechStack"}></NavLink>
                        </li>
                        
                        
                    </ul>
                    <div className="d-flex">
                        <NavLink className={"mt-1 me-1"}
                        onClick={() => navigate('/login')}
                        word={"Log in"}></NavLink>
                        <Btn className={"me-3 main-primary-color text-white btn-hover-color "} word={"Try SketchQL"}
                        onClick={() => navigate('/register')}
                        ></Btn>
                    </div>

                </div>
            </div>
        </nav>
 )   
}
