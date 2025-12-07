export default function Btn({word,className,icon,onClick,}){
    return(
        <button className={`btn  animate-up-2  shadow-sm-hover ${className} rounded-1`}
        onClick={onClick} >{word}
        {icon}
        </button>
    )
}