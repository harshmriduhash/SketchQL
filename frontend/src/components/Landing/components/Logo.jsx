import logo from "../../../assets/logo.png"
import Image from "./Image"
export default function Logo({className,logo}){
    return(
        <h2 className={`fw-bolder ${className}`}>
            <Image src={logo} className={"logo me-2"}></Image>
            sketch<span className={`fw-light ${className}`}>QL</span>
        </h2>
    )
}