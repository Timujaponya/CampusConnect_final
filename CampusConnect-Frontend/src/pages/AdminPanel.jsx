import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import UserDropdown from '../components/UserDropdown';

const AdminPanel = () => {
    const [stats, setStats] = useState({ users: [], clubs: [], events: [] });
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);
            if (parsed.role !== 'ADMIN') {
                toast.error("Yetkisiz Giriş!");
                navigate('/dashboard');
                return;
            }
        } else {
            navigate('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [u, c, e] = await Promise.all([
                axios.get('http://localhost:8080/api/users/search?query='),
                axios.get('http://localhost:8080/api/clubs'),
                axios.get('http://localhost:8080/api/events')
            ]);
            setStats({ users: u.data, clubs: c.data, events: e.data });
        } catch (err) { toast.error("Veri yüklenemedi."); } finally { setLoading(false); }
    };

    // ORTAK SİLME FONKSİYONU
    const handleDelete = async (type, id) => {
        if (!window.confirm("Bu öğeyi kalıcı olarak silmek istediğinize emin misiniz?")) return;
        
        try {
            const token = currentUser.token;
            let url = "";
            
            if (type === 'event') url = `http://localhost:8080/api/events/${id}`;
            if (type === 'club') url = `http://localhost:8080/api/clubs/${id}`;
            if (type === 'user') url = `http://localhost:8080/api/users/${id}`;

            await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success("Başarıyla silindi.");
            
            // State'i güncelle (Sayfa yenilenmeden listeden silinmesi için)
            if (type === 'event') setStats(p => ({ ...p, events: p.events.filter(x => x.eventId !== id) }));
            if (type === 'club') setStats(p => ({ ...p, clubs: p.clubs.filter(x => x.clubId !== id) }));
            if (type === 'user') setStats(p => ({ ...p, users: p.users.filter(x => x.userId !== id) }));

        } catch (err) {
            toast.error("Silme işlemi başarısız. Yetkiniz olmayabilir.");
        }
    };

    if (loading) return <div className="page-container">Yükleniyor...</div>;

    return (
        <div className="page-container">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                <h1 style={{fontSize:'2rem', color:'#ef4444'}}>Admin Kontrol Paneli</h1>
                <UserDropdown user={currentUser} />
            </div>
            
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                
                {/* KULLANICILAR */}
                <div className="section-box" style={{background:'#1d1d24', padding:'20px', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.1)'}}>
                    <h3 style={{borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'15px'}}>
                        <i className="ph-fill ph-users"></i> Kullanıcılar ({stats.users.length})
                    </h3>
                    <div style={{maxHeight:'300px', overflowY:'auto'}}>
                        {stats.users.map(u => (
                            <div key={u.userId} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                <div>
                                    <div style={{fontWeight:'bold'}}>{u.fullName}</div>
                                    <div style={{fontSize:'0.8rem', color:'#a1a1aa'}}>{u.role}</div>
                                </div>
                                <button onClick={() => handleDelete('user', u.userId)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}} title="Kullanıcıyı Sil">
                                    <i className="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KULÜPLER */}
                <div className="section-box" style={{background:'#1d1d24', padding:'20px', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.1)'}}>
                    <h3 style={{borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'15px'}}>
                        <i className="ph-fill ph-users-three"></i> Kulüpler ({stats.clubs.length})
                    </h3>
                    <div style={{maxHeight:'300px', overflowY:'auto'}}>
                        {stats.clubs.map(c => (
                            <div key={c.clubId} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                <div>
                                    <div style={{fontWeight:'bold'}}>{c.name}</div>
                                    <div style={{fontSize:'0.8rem', color:'#a1a1aa'}}>{c.memberCount} Üye</div>
                                </div>
                                <button onClick={() => handleDelete('club', c.clubId)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}} title="Kulübü Sil">
                                    <i className="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ETKİNLİKLER */}
                <div className="section-box" style={{background:'#1d1d24', padding:'20px', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.1)'}}>
                    <h3 style={{borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'15px'}}>
                        <i className="ph-fill ph-calendar"></i> Etkinlikler ({stats.events.length})
                    </h3>
                    <div style={{maxHeight:'300px', overflowY:'auto'}}>
                        {stats.events.map(e => (
                            <div key={e.eventId} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                <div>
                                    <div style={{fontWeight:'bold'}}>{e.title}</div>
                                    <div style={{fontSize:'0.8rem', color:'#a1a1aa'}}>{new Date(e.startTime).toLocaleDateString()}</div>
                                </div>
                                <button onClick={() => handleDelete('event', e.eventId)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}} title="Etkinliği Sil">
                                    <i className="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminPanel;