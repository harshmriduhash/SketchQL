import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from 'react-router-dom';
import SideImg from "./components/SideImg"
import LoginForm from "./components/LoginForm"

export default function Register(){
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
            email: '',
            password: '',
        });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


    const handleSocialLogin = (provider) => {
        window.location.href = `${API_URL}/auth/${provider}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.password || !formData.email) {
            setError("Enter all Valid fields");
            setLoading(false);
            return;
        }
        const autoUsername = formData.email.split('@')[0];

        try {
            
            await axios.post(`${API_URL}/api/auth/register`, {
                username: autoUsername,
                email: formData.email,
                password: formData.password
            });

            
            alert('Registration successful! You can now login.');
            navigate('/login');

        } catch (err) {
           
            if (err.response?.data?.error?.includes('username')) {
                setError('This email prefix is taken. Please try a different email.');
            } else {
                setError(err.response?.data?.error || 'Registration failed. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    return(
            <div className="container-fluid p-0 d-flex vh-100">
                <div className="bg-primary-subtle w-50 h-100 ">
                    <SideImg/>
                </div>
                <div className="p-8">
                    <div className=" login-card">
                        <LoginForm redirect={"login"} again={"Login"}already={"Already"} login={"Register"} title={"Welcome!"} onSubmit={handleSubmit} onChageEmail={(e) => setFormData({...formData, email: e.target.value})} onChagePass={(e) => setFormData({...formData, password: e.target.value})} 
                        handleGoogle={() => handleSocialLogin('google')}
                        handleGithub={() => handleSocialLogin('github')}
                        />
                    </div>
                </div>
            </div>
        )
    }
