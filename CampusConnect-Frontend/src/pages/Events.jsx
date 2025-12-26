import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserDropdown from '../components/UserDropdown';
import './Events.css';
import { toast } from 'react-toastify';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [myParticipations, setMyParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchData = async () => {
            try {
                const eventsRes = await axios.get('http://localhost:8080/api/events');
                setEvents(eventsRes.data);

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    const partRes = await axios.get(`http://localhost:8080/api/events/user/${parsedUser.userId}`);
                    setMyParticipations(partRes.data.map(p => p.event.eventId));
                }
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleParticipation = async (eventId) => {
        if (!user) {
            toast.warn("Lütfen önce giriş yapın!");
            return;
        }
        const isAttending = myParticipations.includes(eventId);
        try {
            if (isAttending) {
                await axios.delete(`http://localhost:8080/api/events/${eventId}/leave`, { params: { userId: user.userId } });
                setMyParticipations(prev => prev.filter(id => id !== eventId));
                setEvents(prev => prev.map(e => e.eventId === eventId ? { ...e, participantCount: e.participantCount - 1 } : e));
                toast.info("Etkinlikten ayrıldınız.");
            } else {
                await axios.post(`http://localhost:8080/api/events/${eventId}/join`, null, { params: { userId: user.userId } });
                setMyParticipations(prev => [...prev, eventId]);
                setEvents(prev => prev.map(e => e.eventId === eventId ? { ...e, participantCount: e.participantCount + 1 } : e));
                toast.success("Etkinliğe katıldınız!");
            }
        } catch (error) {
            toast.error("İşlem başarısız.");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + " • " + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const gradients = ["linear-gradient(45deg, #4f46e5, #9333ea)", "linear-gradient(45deg, #059669, #10b981)", "linear-gradient(45deg, #ea580c, #f97316)", "linear-gradient(45deg, #2563eb, #3b82f6)"];

    return (
<div className="page-container">
            <div className="header-flex" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                <h1>Tüm Etkinlikler</h1>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    <Link to="/create-event" className="create-btn"><i className="ph ph-plus"></i> Etkinlik Oluştur</Link>
                    <UserDropdown user={user} />
                </div>
            </div>
            {loading ? <p>Yükleniyor...</p> : (
                <div className="event-grid">
                    {events.map((event, index) => (
                        <div className="event-card" key={event.eventId}>
                            <div className="card-img" style={{ background: gradients[index % gradients.length] }}><i className="ph ph-calendar-star"></i></div>
                            <div className="c-body">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span className="tag">{event.club ? event.club.name : 'Genel'}</span>
                                    <span style={{fontSize:'0.8rem', color:'#a1a1aa'}}><i className="ph-fill ph-users"></i> {event.participantCount}</span>
                                </div>
                                <h3 style={{ margin: '10px 0', fontSize: '1.2rem' }}>{event.title}</h3>
                                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '5px' }}><i className="ph ph-map-pin"></i> {event.location || 'Konum yok'}</p>
                                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>📅 {formatDate(event.startTime)}</p>
                                <button className="join-btn" onClick={() => setSelectedEvent(event)}>İncele</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedEvent && (
                <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedEvent(null)}><i className="ph ph-x"></i></button>
                        <h1 style={{fontSize:'2.2rem', marginTop:0, marginBottom:'10px', lineHeight:'1.2'}}>{selectedEvent.title}</h1>
                        <div style={{display:'flex', gap:'20px', justifyContent:'center', color:'#a1a1aa', marginBottom:'30px', fontSize:'0.95rem'}}>
                            <span><i className="ph ph-calendar"></i> {formatDate(selectedEvent.startTime)}</span>
                            <span><i className="ph ph-map-pin"></i> {selectedEvent.location}</span>
                        </div>
                        <div style={{background:'rgba(255,255,255,0.05)', padding:'20px', borderRadius:'15px', marginBottom:'30px', textAlign:'left'}}>
                            <h4 style={{marginTop:0, color:'#a1a1aa', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px'}}>Açıklama</h4>
                            <p style={{lineHeight:'1.6', fontSize:'1rem', color:'#e2e8f0', margin:0}}>{selectedEvent.description || "Açıklama yok."}</p>
                        </div>
                        <div style={{display:'flex', gap:'15px'}}>
                            <button onClick={() => navigate(`/events/${selectedEvent.eventId}`)} style={{flex: 1, background: 'transparent', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'}}><i className="ph-bold ph-arrow-square-out"></i> Detaylar</button>
                            <button onClick={() => handleToggleParticipation(selectedEvent.eventId)} style={{flex: 1, background: myParticipations.includes(selectedEvent.eventId) ? '#ef4444' : '#8b5cf6', border: 'none', padding: '12px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer'}}>
                                {myParticipations.includes(selectedEvent.eventId) ? 'Vazgeç' : 'Katıl'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;