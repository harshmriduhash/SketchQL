import Btn from "../../components/Landing/components/Btn"
import Heading from "../../components/Landing/components/Heading"

export default function DashNav({userName,onClick}){
    return(
        
            <nav class="navbar navbar-expand-lg text-white">
                <div class="container">
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                        <a class="navbar-brand fs-4 ">Diagrams</a>
                        </li>
                    </ul>
                    <div>
                        <Heading word={`Hi ${userName}`} className={"me-4"}/>
                        <Btn word={"Logout"} onClick={onClick} className={"main-primary-color btn-hover-color text-white"}/>
                    </div>
                    </div>
                </div>
            </nav>
        
    )
}