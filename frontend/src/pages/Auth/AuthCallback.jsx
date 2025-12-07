import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {useAuthStore } from '../../Store/authStore'

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login =useAuthStore((state) => state.login);

    useEffect(() => {
        const token = searchParams.get('token');
        const username = searchParams.get('username');
        const userId = searchParams.get('userId');

        if (token) {
            login({ username, id: userId }, token);
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, []);

    return <div className="text-center mt-5">Loading user data...</div>;
}