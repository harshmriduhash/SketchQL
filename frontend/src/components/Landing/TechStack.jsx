import Heading from "./components/Heading"
import Image from "./components/Image"
import sqlA from "../../assets/sqlA.png"
import spring from "../../assets/spring.png"
import mongoose from "../../assets/mongoose.png"
export default function TechStack({className}){
    return(
        <div className="text-center mt-5">
            <Heading word={"Works with your favorite stack"} className={"fs-1 fw-light main-text-color"}/>
            <div className="d-flex justify-content-center mt-4">
                <Image className={"img-2 me-4"} src={sqlA}/>
                <Image className={"img-2 me-4"} src={spring}/>
                <Image className={"img-2 me-2"} src={mongoose}/>
            </div>
        </div>
    )
}