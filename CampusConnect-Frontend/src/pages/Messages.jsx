import React, { useState, useEffect } from 'react';
import UserDropdown from '../components/UserDropdown';
import axios from 'axios';
import './Messages.css';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [mutualFriends, setMutualFriends] = useState([]);

    // 1. Kullanıcıyı LocalStorage'dan Al
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
    }, []);

// 2. Sohbet Listesini Getir (Sürekli Güncel Kalması İçin Polling Eklendi)
    useEffect(() => {
        if (!currentUser) return;

        const fetchConversations = async () => {
            try {
                // Token'ı buraya da ekledik, garanti olsun
                const res = await axios.get(`http://localhost:8080/api/messages/partners/${currentUser.userId}`, {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });

                // Gelen veriyi formatla
                const formattedConvos = res.data.map(u => ({ 
                    id: u.userId, 
                    name: u.fullName, 
                    avatar: u.fullName ? u.fullName.charAt(0).toUpperCase() : "?", 
                    color: "#6366f1" 
                }));

                // State'i güncelle
                // Not: Eğer liste çok uzunsa ve sürekli render oluyorsa performans için
                // JSON.stringify ile kıyaslama yapılabilir ama şimdilik bu yeterli.
                setConversations(prev => {
                    // Sadece veri değiştiyse güncellemek UI titremesini engeller (Basit kontrol)
                    if (JSON.stringify(prev) !== JSON.stringify(formattedConvos)) {
                        return formattedConvos;
                    }
                    return prev;
                });

            } catch (err) { console.error(err); }
        };

        // İlk açılışta çalıştır
        fetchConversations();

        // Her 5 saniyede bir kişi listesini yenile (Yeni biri mesaj atarsa burada belirsin)
        const interval = setInterval(fetchConversations, 5000);

        return () => clearInterval(interval);
    }, [currentUser]);

// 3. Mesajları Yükle (Polling)
    useEffect(() => {
        if (!currentUser || !activeChat) return;
        
        const fetchMessages = async () => {
            try {
                // DÜZELTME: headers eklendi
                const res = await axios.get(`http://localhost:8080/api/messages/conversation`, {
                    params: { userId1: currentUser.userId, userId2: activeChat.id },
                    headers: { Authorization: `Bearer ${currentUser.token}` } 
                });
                setMessages(res.data);
            } catch (err) { console.error(err); }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [currentUser, activeChat]);

// 4. Mesaj Gönder
    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUser || !activeChat) return;
        
        const newMessage = { 
            senderId: currentUser.userId, 
            receiverId: activeChat.id, 
            content: text 
        };
        
        try {
            // DÜZELTME: 3. parametre olarak headers eklendi
            await axios.post('http://localhost:8080/api/messages/send', newMessage, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            
            setText("");
            // Anlık olarak ekranda gözükmesi için state'e ekliyoruz (tekrar fetch etmeyi beklemeden)
            setMessages([...messages, { ...newMessage, timestamp: new Date().toISOString() }]);
        } catch (err) { 
            console.error("Mesaj gönderilemedi:", err); 
            // İsteğe bağlı: Hata mesajı göster
            // toast.error("Mesaj gönderilemedi.");
        }
    };

// 5. Yeni Sohbet İçin Arkadaşları Getir
    const fetchMutuals = async () => {
        if (!currentUser) return;
        try {
            // DÜZELTME: Header içine Token eklendi
            const res = await axios.get(`http://localhost:8080/api/users/${currentUser.userId}/mutuals`, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            
            setMutualFriends(res.data);
            setShowNewChatModal(true);
        } catch (err) { 
            console.error(err);
            // Eğer liste boşsa veya hata varsa kullanıcıyı bilgilendirebiliriz
        }
    };
    // 6. Sohbet Başlat
    const startChat = (friend) => {
        const exists = conversations.find(c => c.id === friend.userId);
        if (exists) {
            setActiveChat(exists);
        } else {
            const newChat = { 
                id: friend.userId, 
                name: friend.fullName, 
                avatar: friend.fullName.charAt(0).toUpperCase(), 
                color: "#f59e0b" 
            };
            setConversations([...conversations, newChat]);
            setActiveChat(newChat);
        }
        setShowNewChatModal(false);
    };

    return (
        /* Ana Kapsayıcı */
        <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
            
            {/* SOL PANEL: Liste */}
            <div className="chat-layout" style={{marginLeft: 0, width: '100%', height: '100%'}}>
                <div className="chat-list" style={{width: '320px', display: 'flex', flexDirection: 'column'}}>
                    <div className="list-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingRight:'10px'}}>
                        <h2 style={{fontSize:'1.3rem'}}>Mesajlar</h2>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <button onClick={fetchMutuals} style={{background:'transparent', border:'none', color:'#8b5cf6', fontSize:'1.5rem', cursor:'pointer', padding:'5px'}} title="Yeni Sohbet">
                                <i className="ph-bold ph-plus-circle"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style={{flex: 1, overflowY: 'auto'}}>
                        {conversations.length > 0 ? conversations.map((chat) => (
                            <div key={chat.id} className={`convo ${activeChat?.id === chat.id ? 'active' : ''}`} onClick={() => setActiveChat(chat)}>
                                <div className="convo-avatar" style={{ background: chat.color }}>{chat.avatar}</div>
                                <div className="convo-info">
                                    <div className="convo-name">{chat.name}</div>
                                    <div className="convo-last" style={{fontSize:'0.8rem', color:'#a1a1aa'}}>Sohbete git</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{padding:'20px', textAlign:'center', color:'#a1a1aa', fontSize:'0.9rem'}}>Henüz sohbet yok.</div>
                        )}
                    </div>
                </div>
                
                {/* SAĞ PANEL: Sohbet Alanı */}
                <div className="chat-area" style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#09090b'}}>
                    
                    {/* Header: Z-INDEX Düzeltmesi Yapıldı */}
                    <div className="chat-header" 
                         style={{
                             padding: '0 30px', 
                             height: '80px', 
                             borderBottom: '1px solid rgba(255,255,255,0.1)', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'space-between',
                             backgroundColor: 'rgba(29, 29, 36, 0.95)', // Saydamlığı azalttık
                             backdropFilter: 'blur(10px)',
                             position: 'relative', 
                             zIndex: 100 // KRİTİK: Mesajların üstünde durması için
                         }}>
                        
                        {activeChat ? (
                            <div className="chat-header-user" style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                <div className="convo-avatar" style={{ background: activeChat.color, width: '40px', height: '40px' }}>{activeChat.avatar}</div>
                                <div style={{ fontWeight: '600' }}>{activeChat.name}</div>
                            </div>
                        ) : (
                            <div style={{fontWeight:'600', color:'#a1a1aa'}}>Bir sohbet seçin</div>
                        )}

                        {/* Dropdown Container (zIndex arttırıldı) */}
                        <div style={{position: 'relative', zIndex: 101}}>
                            <UserDropdown user={currentUser} />
                        </div>
                    </div>

                    {/* Mesaj İçeriği */}
                    <div className="messages-content" style={{zIndex: 1}}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`msg ${msg.senderId === currentUser?.userId ? 'msg-out' : 'msg-in'}`}>
                                {msg.content}
                                <span className="msg-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Input Alanı */}
                    {activeChat && (
                        <div className="input-zone">
                            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: '15px' }}>
                                <input type="text" className="msg-input" placeholder="Mesaj yaz..." value={text} onChange={(e) => setText(e.target.value)} />
                                <button type="submit" className="send-btn-chat"><i className="ph-fill ph-paper-plane-right"></i></button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Modal */}
            {showNewChatModal && (
                <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{width:'400px', padding:'30px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                            <h3 style={{margin:0}}>Yeni Sohbet Başlat</h3>
                            <button onClick={() => setShowNewChatModal(false)} style={{background:'transparent', border:'none', color:'white', cursor:'pointer'}}><i className="ph ph-x"></i></button>
                        </div>
                        <p style={{color:'#a1a1aa', fontSize:'0.9rem', marginBottom:'20px'}}>Sadece karşılıklı takipleştiğin kişiler listelenir.</p>
                        <div style={{maxHeight:'300px', overflowY:'auto'}}>
                            {mutualFriends.length > 0 ? mutualFriends.map(f => (
                                <div key={f.userId} onClick={() => startChat(f)} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                                    <div style={{width:'30px', height:'30px', borderRadius:'50%', background:'#8b5cf6', display:'flex', alignItems:'center', justifyContent:'center'}}>{f.fullName.charAt(0).toUpperCase()}</div>
                                    <span>{f.fullName}</span>
                                </div>
                            )) : <p>Karşılıklı takipleştiğin kimse yok.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;