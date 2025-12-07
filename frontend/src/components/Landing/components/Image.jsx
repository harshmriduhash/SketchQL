export default function Image({className,src}){
    return(
        <img src={`${src}`} className={`${className} img-fluid`} alt="" />
    )
}