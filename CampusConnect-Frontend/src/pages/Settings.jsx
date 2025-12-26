import React, { useEffect, useState } from 'react';
import UserDropdown from '../components/UserDropdown';
import './Settings.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const Settings = () => {
    const [formData, setFormData] = useState({ userId: null, fullName: "", email: "", phone: "", faculty: "", department: "", bio: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setFormData({
                userId: parsedUser.userId,
                fullName: parsedUser.fullName || "",
                email: parsedUser.email || "",
                phone: parsedUser.phone || "",
                faculty: parsedUser.faculty || "",
                department: parsedUser.department || "",
                bio: parsedUser.bio || ""
            });
        }
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        try {
            const res = await axios.put(`http://localhost:8080/api/users/${formData.userId}`, formData);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success("Profil bilgileri güncellendi!");
        } catch (error) { toast.error("Güncelleme başarısız."); }
    };

return (
        <div className="page-container" style={{padding: '40px 60px'}}> {/* Biraz daha geniş padding */}        <div className="settings-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                    <h1>Hesap Ayarları</h1>
                    <p>Profilini düzenle ve bilgilerini güncel tut.</p>
                </div>
                <UserDropdown user={formData} />
            </div>

            <div className="section-box">
                <div className="box-title"><i className="ph-fill ph-user"></i> Kişisel Bilgiler</div>
                <div className="form-grid">
                    <div className="form-group"><label>Ad Soyad</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} /></div>
                    <div className="form-group"><label>E-Posta</label><input type="email" value={formData.email} disabled style={{opacity:0.5}} /></div>
                    <div className="form-group"><label>Telefon</label><input type="text" name="phone" placeholder="+90..." value={formData.phone} onChange={handleChange} /></div>
                    <div className="form-group"><label>Fakülte</label><input type="text" name="faculty" placeholder="Fakülteniz" value={formData.faculty} onChange={handleChange} /></div>
                    <div className="form-group"><label>Bölüm</label><input type="text" name="department" placeholder="Bölümünüz" value={formData.department} onChange={handleChange} /></div>
                </div>
                <div className="form-group"><label>Hakkında</label><input type="text" name="bio" placeholder="Bio..." value={formData.bio} onChange={handleChange} /></div>
            </div>
            <button className="save-btn" onClick={handleSave}>Değişiklikleri Kaydet</button>
        </div>
    );
};
export default Settings;