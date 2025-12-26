import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import UserDropdown from '../components/UserDropdown';
import './Clubs.css';
import { toast } from 'react-toastify';

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [myMemberships, setMyMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchData = async () => {
            try {
                const clubsRes = await axios.get('http://localhost:8080/api/clubs');
                setClubs(clubsRes.data);

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    const memRes = await axios.get(`http://localhost:8080/api/clubs/user/${parsedUser.userId}`);
                    setMyMemberships(memRes.data.map(m => m.club.clubId));
                }
            } catch (error) { 
                console.error(error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchData();
    }, []);

    const handleToggleMembership = async (clubId) => {
        if (!user) {
            toast.warn("Lütfen önce giriş yapın!");
            return;
        }
        const isMember = myMemberships.includes(clubId);
        try {
            if (isMember) {
                await axios.delete(`http://localhost:8080/api/clubs/${clubId}/leave`, { params: { userId: user.userId } });
                setMyMemberships(prev => prev.filter(id => id !== clubId));
                setClubs(prev => prev.map(c => c.clubId === clubId ? {...c, memberCount: c.memberCount - 1} : c));
                toast.info("Kulüpten ayrıldınız.");
            } else {
                await axios.post(`http://localhost:8080/api/clubs/${clubId}/join`, null, { params: { userId: user.userId } });
                setMyMemberships(prev => [...prev, clubId]);
                setClubs(prev => prev.map(c => c.clubId === clubId ? {...c, memberCount: c.memberCount + 1} : c));
                toast.success("Kulübe katıldınız!");
            }
        } catch (error) { toast.error("İşlem başarısız."); }
    };

    const icons = ["ph-code", "ph-camera", "ph-paint-brush", "ph-music-notes", "ph-basketball"];

    return (
        <div className="page-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <h1 className="clubs-header" style={{margin:0}}>Topluluklar</h1>
                
                <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                    {/* NEW CREATE BUTTON */}
                    <Link to="/create-club" className="create-btn">
                        <i className="ph-bold ph-plus"></i> Topluluk Kur
                    </Link>
                    <UserDropdown user={user} />
                </div>
            </div>

            {loading ? <p>Yükleniyor...</p> : (
                <div className="club-grid">
                    {clubs.map((club, index) => (
                        <div className="club-card" key={club.clubId}>
                            <div className="icon-box"><i className={`ph ${icons[index % icons.length]}`}></i></div>
                            <h3 className="club-name">{club.name}</h3>
                            <p className="club-desc">{club.description?.substring(0, 60) || "Açıklama yok."}...</p>
                            <div className="stats">
                                <div className="s-item"><span className="s-val">{club.memberCount}</span><span className="s-lbl">Üye</span></div>
                                <div className="s-item"><span className="s-val">Aktif</span><span className="s-lbl">Durum</span></div>
                            </div>
                            <button className="btn-join" onClick={() => setSelectedClub(club)}>İncele</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Logic Remains Same as Before */}
            {selectedClub && (
                <div className="modal-overlay" onClick={() => setSelectedClub(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedClub(null)}><i className="ph ph-x"></i></button>
                        <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px', justifyContent:'center'}}>
                            <div style={{width:'70px', height:'70px', borderRadius:'50%', background:'rgba(139, 92, 246, 0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'#8b5cf6'}}><i className="ph-fill ph-users-three"></i></div>
                            <div style={{textAlign:'left'}}>
                                <h1 style={{fontSize:'1.8rem', margin:0}}>{selectedClub.name}</h1>
                                <span style={{color:'#10b981', background:'rgba(16, 185, 129, 0.1)', padding:'4px 10px', borderRadius:'15px', fontSize:'0.75rem', marginTop:'5px', display:'inline-block'}}>Aktif Kulüp</span>
                            </div>
                        </div>
                        <div style={{background:'rgba(255,255,255,0.05)', padding:'20px', borderRadius:'15px', marginBottom:'30px', textAlign:'left'}}>
                            <h4 style={{marginTop:0, color:'#a1a1aa', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px'}}>Hakkında</h4>
                            <p style={{lineHeight:'1.6', fontSize:'1rem', color:'#e2e8f0', margin:0}}>{selectedClub.description || "Açıklama bulunmuyor."}</p>
                        </div>
                        <div style={{display:'flex', gap:'15px'}}>
                            <button onClick={() => navigate(`/clubs/${selectedClub.clubId}`)} style={{flex: 1, background: 'transparent', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: '0.2s'}}><i className="ph-bold ph-arrow-square-out" style={{marginRight:'5px'}}></i> Detaylar</button>
                            <button onClick={() => handleToggleMembership(selectedClub.clubId)} style={{flex: 1, background: myMemberships.includes(selectedClub.clubId) ? '#ef4444' : '#8b5cf6', border: 'none', padding: '12px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>{myMemberships.includes(selectedClub.clubId) ? 'Ayrıl' : 'Katıl'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clubs;