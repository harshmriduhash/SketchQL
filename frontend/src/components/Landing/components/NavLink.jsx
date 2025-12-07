export default function NavLink({word,className,onClick}){
 
    return(
        
        <a className={`nav-link main-text-color text-hover fw-bold ${className} `}
        onClick={(e) => {
                e.preventDefault(); 
                if (onClick) onClick(); 
            }}
        aria-current="page" href="#">{word}
        
            </a>
    )
}