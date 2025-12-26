import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { toast } from 'react-toastify'; // Toast Import

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: email,
                password: password
            });
            localStorage.setItem('user', JSON.stringify(response.data));
            toast.success(`Hoş geldin, ${response.data.fullName}!`); // Toast Mesajı
            navigate('/dashboard'); 
        } catch (err) {
            toast.error('Giriş başarısız! E-posta veya şifre hatalı.'); // Toast Mesajı
        }
    };

    return (
        <div className="login-body">
            <div className="glow"></div>
            <div className="login-card">
                <div className="login-logo"><i className="ph-fill ph-squares-four"></i> CampusConnect</div>
                <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>Hesabınıza giriş yapın</p>
                <form onSubmit={handleLogin}>
                    <input type="email" className="login-input" placeholder="Öğrenci E-Posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" className="login-input" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-main">Giriş Yap</button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#a1a1aa' }}>Hesabın yok mu? <Link to="/register" style={{ color: '#8b5cf6', textDecoration: 'none', marginLeft: '5px' }}>Kayıt Ol</Link></p>
            </div>
        </div>
    );
};
export default Login;