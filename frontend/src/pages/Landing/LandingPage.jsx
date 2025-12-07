import LandingPageNavbar from "../../components/Landing/LandingPageNavbar"
import Hero from "../../components/Landing/Hero"
import HeroImage from "../../components/Landing/HeroImage"
import Features from "../../components/Landing/Features"
import Btn from "../../components/Landing/components/Btn"
import TechStack from "../../components/Landing/TechStack"
import Pricing from "../../components/Landing/Pricing"
import BottomHeading from "../../components/Landing/BottomHeading"

import Footer from "../../components/Landing/Footer"


export default function LandingPage(){
    return(
        <div>
            <div className="container-fluid main-bg-color-1 h-100vh p-0">
                <LandingPageNavbar/>
                <Hero className={"container-fluid"}/>
                <div className="d-flex justify-content-center mt-5">
                    <HeroImage/>
                </div>
                <div className="main-bg-grad pb-5" id="features">
                    <Features/>
                    <hr />  
                    <div id="techStack">
                        <TechStack/>
                    </div>
                    
                </div>
                <div className=" m-0 pt-5 pb-5">
                   <BottomHeading/>
                </div>
                <div className="new-color1 high-1">
                </div>
                <div className="footer-color h-50">
                    <Footer/>
                    <div className="text-center main-text-color mt-4">
                        <p>© 2025 SketchQL. All rights reserved.</p>
                    </div>
                </div>

                
            </div>
            
        </div>
    )
}