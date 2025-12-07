import { useState } from "react"
import axios from 'axios'
import { useAuthStore } from '../../Store/authStore'
import { useNavigate, Link } from 'react-router-dom';

import SideImg from "./components/SideImg"
import LoginForm from "./components/LoginForm"
export default function Login(){
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            login({ id: res.data.userId}, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed');
        }
    };
    const handleSocialLogin = (provider) => {
        window.location.href = `${API_URL}/auth/${provider}`;
    };
    return(
        <div className="container-fluid p-0 d-flex vh-100">
            <div className="bg-success-subtle w-50 h-100 ">
                <SideImg/>
            </div>
            <div className="p-8">
                <div className=" login-card">
                    <LoginForm redirect={"register"} again={"Create account"} already={"Not"} login={"Login"} title={"Login in to your platform"} onSubmit={handleSubmit} onChageEmail={(e) => setFormData({...formData, email: e.target.value})}  onChagePass={(e) => setFormData({...formData, password: e.target.value})} 
                    handleGoogle={() => handleSocialLogin('google')}
                    handleGithub={() => handleSocialLogin('github')}
                    />
                </div>
            </div>
        </div>
    )
}