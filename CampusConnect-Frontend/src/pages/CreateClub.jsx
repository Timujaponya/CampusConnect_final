import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserDropdown from '../components/UserDropdown';

const CreateClub = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Giriş yapmalısınız.");
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/clubs/create', {
                name: formData.name,
                description: formData.description,
                ownerId: user.userId
            });
            toast.success("Topluluk başarıyla oluşturuldu!");
            navigate('/clubs');
        } catch (error) {
            console.error(error);
            toast.error("Topluluk oluşturulurken hata oluştu.");
        }
    };

    return (
        <div className="page-container" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
             <div style={{width:'100%', display:'flex', justifyContent:'flex-end', marginBottom:'20px'}}>
                <UserDropdown user={user} />
            </div>

            <div className="form-card" style={{maxWidth:'600px', width:'100%'}}>
                <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <i className="ph-fill ph-users-three" style={{color:'#8b5cf6'}}></i> Yeni Topluluk Kur
                </h2>
                <p style={{color:'#a1a1aa', marginBottom:'30px'}}>Topluluğunun adını ve amacını belirle.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Topluluk Adı</label>
                        <input 
                            className="form-input" 
                            required 
                            placeholder="Örn: Yapay Zeka Kulübü"
                            value={formData.name}
                            onChange={(e)=>setFormData({...formData, name:e.target.value})} 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Açıklama</label>
                        <textarea 
                            className="form-textarea" 
                            rows="5" 
                            required
                            placeholder="Topluluğun amacı nedir? Kimler katılmalı?"
                            value={formData.description}
                            onChange={(e)=>setFormData({...formData, description:e.target.value})} 
                        />
                    </div>
                    <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
                        <button type="button" onClick={() => navigate('/clubs')} className="btn-cancel">İptal</button>
                        <button type="submit" className="btn-save" style={{flex:2}}>Oluştur</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateClub;