import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UserDropdown from '../components/UserDropdown';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [memberships, setMemberships] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            axios.get(`http://localhost:8080/api/clubs/user/${parsedUser.userId}`)
                 .then(res => setMemberships(res.data))
                 .catch(err => console.error(err));
        }
    }, []);

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";

    if (!user) return null;

return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="cover-photo" style={{position:'relative'}}>
                {/* Header UserMenu'yu buraya absolute koyabiliriz veya sayfanın üstüne */}
                <div style={{position:'absolute', top:'20px', right:'20px'}}>
                    <UserDropdown user={user} />
                </div>
            </div>

            <div className="profile-info-container">
                <div className="profile-header">
                    <div className="avatar-large">{getInitials(user.fullName)}</div>
                    <div className="profile-text">
                        <h1>{user.fullName}</h1>
                        <p><i className="ph-fill ph-student"></i> {user.role || "Öğrenci"} {user.department ? ` • ${user.department}` : ""}</p>
                        {user.bio && <p style={{fontSize:'0.9rem', marginTop:'10px', fontStyle:'italic'}}>"{user.bio}"</p>}
                    </div>
                    <Link to="/settings" className="edit-profile-btn"><i className="ph-bold ph-pencil-simple"></i> Profili Düzenle</Link>
                </div>

                <div className="content-grid">
                    <div className="info-card">
                        <div className="card-title"><i className="ph-fill ph-identification-card"></i> Kişisel Bilgiler</div>
                        <div className="detail-row"><span className="label">Fakülte</span><span className="value">{user.faculty || "Girilmedi"}</span></div>
                        <div className="detail-row"><span className="label">Bölüm</span><span className="value">{user.department || "Girilmedi"}</span></div>
                        <div className="detail-row"><span className="label">E-Posta</span><span>{user.email}</span></div>
                    </div>

                    <div className="info-card">
                        <div className="card-title"><i className="ph-fill ph-users-three"></i> Üyelikler</div>
                        {memberships.length > 0 ? memberships.map(mem => (
                            <Link to={`/clubs/${mem.club.clubId}`} key={mem.membershipId} style={{textDecoration:'none', color:'inherit', display:'block'}}>
                                <div className="club-list-item">
                                    <div className="club-icon"><i className="ph-fill ph-users-three"></i></div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{mem.club.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#10b981' }}>{mem.roleInClub || 'Üye'}</div>
                                    </div>
                                </div>
                            </Link>
                        )) : <div style={{textAlign:'center', color:'#555', padding:'20px'}}>Henüz bir kulübe üye değilsiniz. <br/><Link to="/clubs" style={{color:'#8b5cf6'}}>Keşfet</Link></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Profile;