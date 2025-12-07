import Heading from "./Heading"
import SubHeading from "./SubHeading"

export default function FeatureContent({className,heading,subHeading}){
    return(
        <div className={`${className}`}>
            <Heading word={heading} className={"fs-2 fw-bold"}/>
            <SubHeading word={subHeading} className={"fs-5 mt-4 subHeading-w3"}/>
        </div>
    )
}