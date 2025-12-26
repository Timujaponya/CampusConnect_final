import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserDropdown from '../components/UserDropdown';

const ClubDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [user, setUser] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchData = async () => {
            try {
                const clubRes = await axios.get('http://localhost:8080/api/clubs');
                const foundClub = clubRes.data.find(c => c.clubId == id);
                setClub(foundClub);
                
                const memRes = await axios.get(`http://localhost:8080/api/clubs/${id}/members`);
                setMemberCount(memRes.data.length);

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    const statusRes = await axios.get(`http://localhost:8080/api/clubs/${id}/is-member`, { params: { userId: parsedUser.userId } });
                    setIsMember(statusRes.data);
                }
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [id]);

    const handleMembership = async () => {
        if (!user) { toast.warn("Giriş yapmalısınız."); return; }
        try {
            if (isMember) {
                await axios.delete(`http://localhost:8080/api/clubs/${id}/leave`, { params: { userId: user.userId } });
                setIsMember(false); setMemberCount(p => p - 1); toast.info("Ayrıldınız.");
            } else {
                await axios.post(`http://localhost:8080/api/clubs/${id}/join`, null, { params: { userId: user.userId } });
                setIsMember(true); setMemberCount(p => p + 1); toast.success("Katıldınız!");
            }
        } catch (error) { toast.error("Hata."); }
    };

    if (!club) return <div>Yükleniyor...</div>;

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <div style={{height:'300px', background:'linear-gradient(45deg, #4c1d95, #2e1065)', position:'relative'}}>
                <button onClick={() => navigate(-1)} style={{position:'absolute', top:'30px', left:'30px', background:'rgba(0,0,0,0.5)', border:'none', color:'white', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontWeight:'600'}}><i className="ph-bold ph-arrow-left"></i> Geri Dön</button>
                <div style={{position:'absolute', top:'30px', right:'50px'}}><UserDropdown user={user} /></div>
            </div>
            <div style={{maxWidth:'1000px', margin:'-80px auto 50px auto', padding:'0 40px', position:'relative', zIndex:'10'}}>
                <div style={{display:'flex', alignItems:'flex-end', gap:'30px', marginBottom:'40px'}}>
                    <div style={{width:'160px', height:'160px', borderRadius:'24px', background:'#1d1d24', border:'4px solid #09090b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem', color:'#8b5cf6', boxShadow:'0 20px 40px rgba(0,0,0,0.5)'}}><i className="ph-fill ph-users-three"></i></div>
                    <div style={{marginBottom:'10px'}}>
                        <h1 style={{fontSize:'3rem', margin:'0 0 10px 0', lineHeight:'1'}}>{club.name}</h1>
                        <div style={{display:'flex', gap:'15px', color:'#a1a1aa'}}><span><i className="ph-fill ph-users"></i> {memberCount} Üye</span></div>
                    </div>
                    <button onClick={handleMembership} style={{marginLeft:'auto', marginBottom:'15px', padding:'15px 40px', borderRadius:'30px', border:'none', fontSize:'1.1rem', fontWeight:'700', cursor:'pointer', background: isMember ? '#ef4444' : '#8b5cf6', color: 'white'}}>{isMember ? 'Ayrıl' : 'Katıl'}</button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'30px'}}>
                    <div style={{background:'#1d1d24', padding:'40px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.08)'}}><h3 style={{marginTop:0, marginBottom:'20px'}}>Hakkında</h3><p style={{fontSize:'1.1rem', lineHeight:'1.8', color:'#d4d4d8'}}>{club.description || "Açıklama yok."}</p></div>
                    <div style={{display:'flex', flexDirection:'column', gap:'20px'}}><div style={{background:'#1d1d24', padding:'30px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.08)'}}><h4 style={{marginTop:0, color:'#a1a1aa'}}>Yönetici</h4><div style={{display:'flex', alignItems:'center', gap:'15px', marginTop:'15px'}}><div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{club.owner?.fullName.charAt(0)}</div><div><div style={{fontWeight:'600'}}>{club.owner?.fullName}</div></div></div></div></div>
                </div>
            </div>
        </div>
    );
};
export default ClubDetail;