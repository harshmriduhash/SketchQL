import Heading from "./components/Heading"
import SubHeading from "./components/SubHeading"
import Btn from "./components/Btn"
import { useNavigate } from "react-router-dom"
export default function BottomHeading(){
    const navigate = useNavigate();
    return(
        <div className="text-center mt-5">
            <Heading word={"Ready to get started?"} className={"fs-1 fw-bolder"}/>
            <SubHeading word={"Spin up a diagram in under 5 Seconds—no credit card needed."} className={"fs-3 mt-3"}/>
            <Btn className={"main-primary-color btn-hover-color text-white mt-3"}
            onClick={() => navigate('/register')} word={"Start Diagramming"}/>

        </div>
    )
}