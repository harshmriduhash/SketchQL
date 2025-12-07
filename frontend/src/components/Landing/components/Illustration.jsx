import Image from "./Image.jsx"

export default function Illustration({illustration,className,style}){
    return(
        <div className={`${className}`}>
            <Image className={`${style}`} src={illustration}></Image>
        </div>
    )
}