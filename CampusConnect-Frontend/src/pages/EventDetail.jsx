import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserDropdown from '../components/UserDropdown';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [isAttending, setIsAttending] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/events');
                const found = response.data.find(e => e.eventId == id);
                setEvent(found);
                setParticipantCount(found.participantCount);

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    const statusRes = await axios.get(`http://localhost:8080/api/events/${id}/is-attending`, { params: { userId: parsedUser.userId } });
                    setIsAttending(statusRes.data);
                }
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [id]);

    const handleAttendance = async () => {
        if (!user) { toast.warn("Giriş yapmalısınız."); return; }
        try {
            if (isAttending) {
                await axios.delete(`http://localhost:8080/api/events/${id}/leave`, { params: { userId: user.userId } });
                setIsAttending(false); setParticipantCount(p => p - 1); toast.info("Ayrıldınız.");
            } else {
                await axios.post(`http://localhost:8080/api/events/${id}/join`, null, { params: { userId: user.userId } });
                setIsAttending(true); setParticipantCount(p => p + 1); toast.success("Katıldınız!");
            }
        } catch (error) { toast.error("Hata."); }
    };

    // CHECK IF USER IS ADMIN OR OWNER
    const canManage = (currentUser, ev) => {
        if (!currentUser || !ev) return false;
        if (currentUser.role === 'ADMIN') return true;
        if (ev.organizer && ev.organizer.userId === currentUser.userId) return true;
        return false;
    };

    const handleDelete = async () => {
        if(!window.confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
        
        try {
             // Send JWT Token in Header for Authorization
             const token = user.token;
             await axios.delete(`http://localhost:8080/api/events/${id}`, {
                 headers: { Authorization: `Bearer ${token}` } 
             });
             toast.success("Etkinlik başarıyla silindi.");
             navigate('/events');
        } catch (e) { 
            console.error(e);
            toast.error("Silme işlemi başarısız. Yetkiniz olmayabilir."); 
        }
    };

    if (!event) return <div>Yükleniyor...</div>;

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <div style={{height:'300px', background:'linear-gradient(45deg, #2563eb, #3b82f6)', position:'relative'}}>
                <button onClick={() => navigate(-1)} style={{position:'absolute', top:'30px', left:'30px', background:'rgba(0,0,0,0.5)', border:'none', color:'white', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontWeight:'600'}}><i className="ph-bold ph-arrow-left"></i> Geri Dön</button>
                <div style={{position:'absolute', top:'30px', right:'50px'}}><UserDropdown user={user} /></div>
                
                {/* ADMIN/OWNER CONTROLS */}
                {canManage(user, event) && (
                    <div style={{position:'absolute', bottom:'20px', right:'40px', display:'flex', gap:'10px', zIndex:50}}>
                         <button onClick={() => toast.info("Düzenleme özelliği yakında gelecek.")} style={{background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.5)', padding:'10px 20px', borderRadius:'8px', color:'white', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', gap:'5px'}}>
                            <i className="ph-bold ph-pencil-simple"></i> Düzenle
                        </button>
                        <button onClick={handleDelete} style={{background:'#ef4444', border:'none', padding:'10px 20px', borderRadius:'8px', color:'white', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', gap:'5px'}}>
                            <i className="ph-bold ph-trash"></i> Sil
                        </button>
                    </div>
                )}
            </div>
            
            <div style={{maxWidth:'1000px', margin:'-80px auto 50px auto', padding:'0 40px', position:'relative', zIndex:'10'}}>
                <div style={{display:'flex', alignItems:'flex-end', gap:'30px', marginBottom:'40px'}}>
                    <div style={{width:'140px', height:'140px', borderRadius:'24px', background:'#1d1d24', border:'4px solid #09090b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem', color:'#3b82f6', boxShadow:'0 20px 40px rgba(0,0,0,0.5)'}}><i className="ph-fill ph-calendar-star"></i></div>
                    <div style={{marginBottom:'10px'}}>
                        <h1 style={{fontSize:'3rem', margin:'0 0 10px 0', lineHeight:'1'}}>{event.title}</h1>
                        <div style={{display:'flex', gap:'20px', color:'#a1a1aa'}}><span><i className="ph-fill ph-users"></i> {participantCount} Katılımcı</span></div>
                    </div>
                    <button onClick={handleAttendance} style={{marginLeft:'auto', marginBottom:'15px', padding:'15px 40px', borderRadius:'30px', border:'none', fontSize:'1.1rem', fontWeight:'700', cursor:'pointer', background: isAttending ? '#ef4444' : '#3b82f6', color: 'white'}}>{isAttending ? 'Vazgeç' : 'Katıl'}</button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'30px'}}>
                    <div style={{background:'#1d1d24', padding:'40px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.08)'}}><h3 style={{marginTop:0, marginBottom:'20px'}}>Detaylar</h3><p style={{fontSize:'1.1rem', lineHeight:'1.8', color:'#d4d4d8'}}>{event.description || "Açıklama yok."}</p></div>
                    <div style={{display:'flex', flexDirection:'column', gap:'20px'}}><div style={{background:'#1d1d24', padding:'30px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.08)'}}><h4 style={{marginTop:0, color:'#a1a1aa'}}>Organizatör</h4><div style={{display:'flex', alignItems:'center', gap:'15px', marginTop:'15px'}}><div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#8b5cf6', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{event.organizer?.fullName.charAt(0)}</div><div><div style={{fontWeight:'600'}}>{event.organizer?.fullName}</div></div></div></div></div>
                </div>
            </div>
        </div>
    );
};
export default EventDetail;