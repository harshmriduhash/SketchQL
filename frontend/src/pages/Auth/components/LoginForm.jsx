import { Link } from "react-router-dom"

export default function LoginForm({redirect,again,already,login,title,onSubmit,onChageEmail,onChagePass,handleGoogle,handleGithub}){
    return(
        <div className="card p-4">
            <div className="card-header border-0 bg-white text-center pb-0">
                <h2 className="h4 fw-bolder fs-3">{title}</h2>
                
            </div>
            <div className="card-body">
                <form action="" onSubmit={onSubmit}>
                    <div className="form-group mb-4">
                        <label for="exampleInputEmailCard1">Your Email</label>
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1"><span className="fas fa-envelope"></span></span>
                            <input type="email" className="form-control" placeholder="example@company.com" onChange={onChageEmail}
                            required id="exampleInputEmailCard1" aria-describedby="exampleInputEmailCard1"/   >
                        </div>
                    </div>
                    <div className="form-group mb-4">
                        <label for="exampleInputPasswordCard1">Your Password</label>
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon2"><span className="fas fa-unlock-alt"></span></span>
                            <input required type="password" 
                            onChange={onChagePass}
                            placeholder="Password" className="form-control" id="exampleInputPasswordCard1" aria-describedby="exampleInputPasswordCard1"/>
                        </div>
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">{login}</button>
                    </div>
                </form>
                <div className="mt-3 mb-4 text-center">
                    <span className="fw-normal">or {login} with</span>
                </div>
                <div className="btn-wrapper my-4 text-center">
                    <button className="btn btn-icon-only btn-pill btn-outline-light text-google me-2  bg-primary-subtle" onClick={handleGoogle}>
                        <span aria-hidden="true" className="fab fa-google"></span>
                    </button>
                    
                    <button className="btn btn-icon-only btn-pill btn-outline-light text-github bg-primary-subtle" 
                    onClick={handleGithub}>
                        <span aria-hidden="true" className="fab fa-github"></span>
                    </button>
                </div>
                    <div className="d-block d-sm-flex justify-content-center align-items-center mt-4">
                    <span Name="fw-normal">
                        {already} registered?
                        <Link to={`/${redirect}`} className="ms-1 text-info fw-bold">
                        {again}
                        </Link>
                        
                    </span>
                </div>
            </div>
        </div>
    )
}