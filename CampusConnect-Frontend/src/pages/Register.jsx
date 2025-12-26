import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import { toast } from 'react-toastify'; // Toast Import

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });

    useEffect(() => {
        if (localStorage.getItem('user')) navigate('/dashboard');
    }, [navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.warn("Şifreler eşleşmiyor!");
            return;
        }
        try {
            const payload = { fullName: formData.fullName, email: formData.email, password: formData.password, role: "STUDENT" };
            await axios.post('http://localhost:8080/api/auth/register', payload);
            toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data || "Kayıt işlemi başarısız.");
        }
    };

    return (
        <div className="register-body">
            <div className="glow"></div>
            <div className="register-card">
                <div className="register-logo"><i className="ph-fill ph-squares-four"></i> CampusConnect</div>
                <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>Yeni bir hesap oluşturun</p>
                <form onSubmit={handleRegister}>
                    <input type="text" name="fullName" className="register-input" placeholder="Ad Soyad" onChange={handleChange} required />
                    <input type="email" name="email" className="register-input" placeholder="Öğrenci E-Posta" onChange={handleChange} required />
                    <input type="password" name="password" className="register-input" placeholder="Şifre" onChange={handleChange} required />
                    <input type="password" name="confirmPassword" className="register-input" placeholder="Şifre Tekrar" onChange={handleChange} required />
                    <button type="submit" className="btn-register">Kayıt Ol</button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#a1a1aa' }}>Zaten hesabın var mı? <Link to="/login" style={{ color: '#8b5cf6', textDecoration: 'none', marginLeft: '5px' }}>Giriş Yap</Link></p>
            </div>
        </div>
    );
};
export default Register;