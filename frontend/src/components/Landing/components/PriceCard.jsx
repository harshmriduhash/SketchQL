import Heading from "./Heading"
import Btn from "./Btn"
export default function PriceCard({title,className,src,features,price,color}){
    return(
        <>
            <div className="bg-warning price-card-upper rounded-top">
            </div>
            <div className={`${className} bg-danger price-card`}>
                <div className="d-flex flex-column justify-content-center bg-dark h-25 border-bottom">
                    <Heading className={""} word={title}/>
                </div>
                <div className="bg-success">
                    {features.map((f) => (
                        <div className="border-bottom d-flex gap-3 justify-content-center pt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        <p className="">{f}</p>
                    </div>
                    ))}
                </div>
                <div>
                    <div>
                        {price}

                    </div>
                    <Btn word={"Get Started"} icon={<i class="fa-solid fa-arrow-right-long ms-2"></i>}/>
                </div>
            </div>
        </>
    )

}