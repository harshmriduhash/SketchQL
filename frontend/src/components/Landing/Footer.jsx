import Logo from "./components/Logo"
import SubHeading from "./components/SubHeading"
import Heading from "./components/Heading"
import logoImg from "../../assets/logoWhite.png"


export default function Footer(){
    return(
        <div className="container  h-75  pt-5 d-flex gap-8 border-bottom">
            <div>
                <Logo logo={logoImg} className={"text-light"}/>
                <SubHeading word={"Work together to design, model and document the database schema of your app."} className={"subHeading-w4 mt-4"}/>

            </div>
            <div>
                <Heading word={"FEATURES"} className={"fs-6 fw-bolder footer-text "}/>
                <SubHeading word={"All features"} className={"footer-text2 mt-1 fw-bold"}/>
                <SubHeading word={"Export to Image"} className={"footer-text2 fw-bold"}/>
                <SubHeading word={"Export Code"} className={"footer-text2 fw-bold"}/>
                <SubHeading word={"share Link"} className={"footer-text2 fw-bold"}/>
                <SubHeading word={"Ask AI"} className={"footer-text2 fw-bold"}/>
                    
            </div>
            <div>
                <Heading word={"CONTACT ME"} className={"fs-6 fw-bolder footer-text "}/>
                <SubHeading word={"About me"} className={"footer-text2 mt-1 fw-bold"}/>
                
                    
            </div>

        </div>
    )
}
