import React from 'react';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Btn from '../components/Landing/components/Btn';

import { useNavigate } from "react-router-dom"
export default function NotFound() {
    const navigate = useNavigate();
    return (
        <>
        <div className='main-bg-color-1 p-0 container-fluid h-100vh d-flex align-items-center position-relative'>
            <div className='left position-absolute '>

                <DotLottieReact  src="https://lottie.host/4282b122-c126-4929-91ec-8defa273a423/elCyOCiMGN.lottie"loop autoplay
            />
            </div>
            <div className='btn right position-absolute'>
                <Btn word={"Home"} onClick={
                        () => navigate('/')
                    } className={"main-primary-color btn-hover-color rounded-1 text-white px-4"}></Btn>
            </div>
      </div>
      </>
    );
}