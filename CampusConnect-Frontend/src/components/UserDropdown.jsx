import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { notificationService } from '../services/notificationService'; // Servisi import et

// --- GÖRSEL AYARLAYICI ---
// Backend'den gelen TİP'e göre ikon ve renk belirler
const getNotificationStyle = (type) => {
    switch (type) {
        case 'MESSAGE': return { icon: "ph-chat-circle-text", color: "#8b5cf6", title: "Yeni Mesaj" };
        case 'FOLLOW': return { icon: "ph-user-plus", color: "#3b82f6", title: "Yeni Takipçi" };
        case 'CLUB_EVENT': return { icon: "ph-calendar-plus", color: "#10b981", title: "Yeni Etkinlik" };
        case 'EVENT_JOIN': return { icon: "ph-ticket", color: "#f59e0b", title: "Etkinlik Katılımı" };
        case 'CLUB_JOIN': return { icon: "ph-users-three", color: "#8b5cf6", title: "Kulüp Üyesi" };
        case 'DELETE_ALERT': return { icon: "ph-warning-circle", color: "#ef4444", title: "İptal/Silinme" };
        default: return { icon: "ph-bell", color: "#a1a1aa", title: "Bildirim" };
    }
};

const UserDropdown = ({ user }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [notifications, setNotifications] = useState([]); // Gerçek veri buraya gelecek
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // --- 1. VERİ ÇEKME FONKSİYONU ---
    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            // Gelen veriyi konsola yazdırıp kontrol edelim
            console.log("Backend'den Gelen Bildirimler:", data); 
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Bildirimler alınamadı:", error);
        }
    };

    // --- 2. PERİYODİK KONTROL (POLLING) ---
    useEffect(() => {
        if (user) {
            fetchNotifications(); // Sayfa açılınca çek
            
            // Her 30 saniyede bir tekrar çek
            const interval = setInterval(() => {
                fetchNotifications();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [user]);

    // Okunmamış Sayısı
    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    // Dışarı Tıklama
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- AKSİYONLAR ---
    const toggleMenu = (menuName) => {
        if (activeMenu === menuName) {
            setActiveMenu(null);
        } else {
            setActiveMenu(menuName);
            // Menü açılınca listeyi tazele
            if (menuName === 'notifications') {
                fetchNotifications();
                // Eğer okunmamış varsa 1sn sonra okundu işaretle
                if (unreadCount > 0) {
                    setTimeout(() => handleMarkAllRead(), 1500);
                }
            }
        }
    };

    const handleMarkAllRead = async () => {
        // UI'da hemen güncelle (Hız hissi için)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await notificationService.markAllRead();
        } catch (error) {
            console.error("Okundu yapılamadı");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        // UI'dan sil
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await notificationService.delete(id);
        } catch (error) {
            toast.error("Silinemedi");
        }
    };

    const handleClearAll = async () => {
        setNotifications([]);
        try {
            await notificationService.deleteAll();
            toast.info("Tüm bildirimler temizlendi.");
        } catch (error) {
            toast.error("Temizleme başarısız.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    if (!user) return null;

    return (
        <div className="header-pill" ref={dropdownRef}>
            
            {/* ZİL BUTONU */}
            <div 
                className={`notif-btn ${activeMenu === 'notifications' ? 'active' : ''}`} 
                onClick={() => toggleMenu('notifications')}
            >
                <i className="ph-fill ph-bell" style={{fontSize: '1.2rem'}}></i>
                {unreadCount > 0 && <span className="notif-badge"></span>}
            </div>

            <div className="pill-divider"></div>

            {/* PROFİL BUTONU */}
            <div 
                className={`profile-trigger ${activeMenu === 'profile' ? 'active' : ''}`} 
                onClick={() => toggleMenu('profile')}
            >
                <span style={{ fontWeight: '500', color: 'white', fontSize:'0.9rem' }}>{user.fullName}</span>
                <div className="avatar" style={{width:'32px', height:'32px', fontSize:'0.85rem'}}>
                    {getInitials(user.fullName)}
                </div>
                <i className={`ph-bold ph-caret-down`} style={{ fontSize: '0.8rem', color: '#a1a1aa', transform: activeMenu === 'profile' ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}></i>
            </div>

            {/* --- MENÜLER --- */}

            {/* 1. BİLDİRİM MENÜSÜ */}
            {activeMenu === 'notifications' && (
                <div className="dropdown-menu" style={{width: '320px'}}>
                    
                    {/* Header */}
                    <div style={{
                        padding:'12px 16px', fontSize:'0.75rem', color:'#a1a1aa', fontWeight:'700', 
                        borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center'
                    }}>
                        <span>BİLDİRİMLER {unreadCount > 0 && <span style={{color:'var(--color-accent)'}}>({unreadCount})</span>}</span>
                        {notifications.length > 0 && (
                            <span onClick={handleClearAll} style={{cursor:'pointer', color:'var(--color-danger)', fontSize:'0.7rem', fontWeight:'500'}}>
                                Tümünü Sil
                            </span>
                        )}
                    </div>

                    {/* Liste */}
                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                            notifications.map(notif => {
                                const style = getNotificationStyle(notif.type);
                                return (
                                    <div key={notif.id} className="notif-item" style={{
                                        opacity: notif.isRead ? 0.6 : 1,
                                        borderLeft: notif.isRead ? '3px solid transparent' : `3px solid ${style.color}`,
                                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(255,255,255,0.02)'
                                    }}>
                                        <div className="notif-icon" style={{ 
                                            color: style.color, 
                                            background: `rgba(255,255,255,0.05)` 
                                        }}>
                                            <i className={`ph-fill ${style.icon}`}></i>
                                        </div>

                                        <div className="notif-text" style={{ flex: 1 }}>
                                            <h4 style={{ color: notif.isRead ? '#999' : 'white', fontSize: '0.85rem', marginBottom: '2px' }}>
                                                {style.title}
                                            </h4>
                                            <p style={{fontSize: '0.8rem', color: '#ccc', lineHeight:'1.3'}}>
                                                {notif.text}
                                            </p>
                                            <span style={{fontSize:'0.7rem', color:'#666', marginTop:'4px', display:'block'}}>
                                                {notif.time}
                                            </span>
                                        </div>

                                        <div onClick={(e) => handleDelete(e, notif.id)} style={{ color: '#555', cursor: 'pointer', padding: '6px' }}>
                                            <i className="ph-bold ph-x" style={{fontSize:'0.9rem'}}></i>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state" style={{padding: '40px 20px'}}>
                                <i className="ph-duotone ph-bell-slash" style={{fontSize:'2.5rem', marginBottom:'10px', display:'block', opacity:0.3, color:'var(--color-accent)'}}></i>
                                <div style={{color: 'white', fontWeight:'500'}}>Bildiriminiz yok</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. PROFİL MENÜSÜ */}
            {activeMenu === 'profile' && (
                <div className="dropdown-menu" style={{width: '200px'}}>
                    <div style={{padding: '12px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'5px'}}>
                        <div style={{color:'white', fontWeight:'600', fontSize:'0.95rem'}}>{user.fullName}</div>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                        <i className="ph-fill ph-user"></i> Profilim
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                        <i className="ph-fill ph-gear-six"></i> Ayarlar
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                        <i className="ph-fill ph-sign-out"></i> Çıkış Yap
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;