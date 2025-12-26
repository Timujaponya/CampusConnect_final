import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserDropdown from '../components/UserDropdown';
import './CreateEvent.css';
import { toast } from 'react-toastify';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({ title: '', date: '', startTime: '', endTime: '', location: '', description: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalStartTime = `${formData.date}T${formData.startTime}:00`;
        const finalEndTime = `${formData.date}T${formData.endTime}:00`;
        const payload = { title: formData.title, description: formData.description, location: formData.location, startTime: finalStartTime, endTime: finalEndTime, organizerId: user.userId, clubId: null };

        try {
            await axios.post('http://localhost:8080/api/events/create', payload);
            toast.success('Etkinlik başarıyla oluşturuldu!');
            navigate('/events');
        } catch (error) { toast.error('Hata oluştu.'); }
    };

    return (
        <div style={{ padding: '30px 50px', width: '100%', height: '100%', display:'flex', justifyContent:'center' }}>
            <div style={{position:'absolute', top:'30px', right:'50px'}}><UserDropdown user={user} /></div>
            <div className="form-card" style={{marginTop:'50px'}}>
                <h2>Yeni Etkinlik Planla</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Başlık</label><input type="text" name="title" className="form-input" required onChange={handleChange}/></div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}><label className="form-label">Tarih</label><input type="date" name="date" className="form-input" style={{ colorScheme: 'dark' }} required onChange={handleChange}/></div>
                        <div className="form-group" style={{ flex: 1 }}><label className="form-label">Başlangıç</label><input type="time" name="startTime" className="form-input" style={{ colorScheme: 'dark' }} required onChange={handleChange}/></div>
                        <div className="form-group" style={{ flex: 1 }}><label className="form-label">Bitiş</label><input type="time" name="endTime" className="form-input" style={{ colorScheme: 'dark' }} required onChange={handleChange}/></div>
                    </div>
                    <div className="form-group"><label className="form-label">Konum</label><input type="text" name="location" className="form-input" required onChange={handleChange}/></div>
                    <div className="form-group"><label className="form-label">Açıklama</label><textarea rows="4" name="description" className="form-textarea" onChange={handleChange}></textarea></div>
                    <div style={{ display: 'flex', gap: '15px' }}><Link to="/events" className="btn-cancel">İptal</Link><button type="submit" className="btn-save" style={{ flex: 2 }}>Yayınla</button></div>
                </form>
            </div>
        </div>
    );
};
export default CreateEvent;