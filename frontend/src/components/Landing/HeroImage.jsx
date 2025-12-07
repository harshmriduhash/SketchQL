import Image from "./components/Image"
import heroImgSrc from "../../assets/heroImg.png"
export default function HeroImage({className}){
    return(
        <div>
            <Image src={heroImgSrc} className={"bg-success-subtle img-1 rounded shadow-lg"}/>
        </div>
    )
}