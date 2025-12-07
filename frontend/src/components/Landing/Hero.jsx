import Heading from "./components/Heading"
import SubHeading from "./components/SubHeading"
import Btn from "./components/Btn"
import { useNavigate } from "react-router-dom"
export default function Hero({className}){
    const navigate = useNavigate();
    const handleLearnMore = () => {
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return(
        <div className={`${className} text-center mt-5`}>
            <div>
                <Heading word={"Design Visually"} className={"heading-fs"}/>
                <Heading className={"main-text-primary-color ms-3 heading-fs"} word={"Code Instantly"} />
            </div>
            <div>
                <SubHeading word={"Design with AI, visualize relationships, and export production-ready code in seconds."} className={"subHeading-w1 fs-4 w-2 "}/>
            </div>
            
            <div>
                <Btn word={"Learn more"} className={"bg-white px-6 btn-hover-text1"} onClick={handleLearnMore}/>

                <Btn word={"Get Started"} className={"px-5 main-primary-color text-white ms-4 btn-hover-color"} onClick={() => navigate('/register')} icon={<i className="fa-solid fa-arrow-right-long ms-2"></i>}/>
            </div>
                
        </div>
    )
}