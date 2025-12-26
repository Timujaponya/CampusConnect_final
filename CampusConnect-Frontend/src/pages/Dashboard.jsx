import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import UserDropdown from '../components/UserDropdown';
import './Dashboard.css';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (error) { console.error(error); }

    const fetchData = async () => {
        try {
            const [eventsRes, clubsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:8080/api/events'),
                axios.get('http://localhost:8080/api/clubs'),
                axios.get('http://localhost:8080/api/users/search?query=')
            ]);
            setEvents(eventsRes.data);
            setClubs(clubsRes.data);
            setUsers(usersRes.data);
        } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
      const term = e.target.value;
      setSearchTerm(term);

      if (term.length > 0) {
          const termLower = term.toLowerCase();
          const matchedEvents = events.filter(ev => ev.title.toLowerCase().includes(termLower)).map(ev => ({ ...ev, type: 'event' }));
          const matchedClubs = clubs.filter(c => c.name.toLowerCase().includes(termLower)).map(c => ({ ...c, type: 'club' }));
          const matchedUsers = users.filter(u => u.fullName.toLowerCase().includes(termLower) && u.userId !== user?.userId).map(u => ({ ...u, type: 'user' }));

          setSearchResults([...matchedEvents, ...matchedClubs, ...matchedUsers]);
          setShowDropdown(true);
      } else {
          setShowDropdown(false);
      }
  };

  const handleResultClick = (item) => {
      if (item.type === 'event') navigate(`/events/${item.eventId}`);
      else if (item.type === 'club') navigate(`/clubs/${item.clubId}`);
      else if (item.type === 'user') setSelectedUser(item);
      setShowDropdown(false);
      setSearchTerm("");
  };

const handleFollow = async () => {
      if (!selectedUser || !user) return;
      try {
          // Parametre kaldırıldı, Header eklendi
          const res = await axios.post(`http://localhost:8080/api/users/${selectedUser.userId}/follow`, null, {
              headers: { Authorization: `Bearer ${user.token}` }
          });
          toast.success(res.data);
          setSelectedUser(null);
      } catch (err) { toast.error("İşlem başarısız."); }
  };
  const scroll = (direction) => {
      if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
          current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "?";

  return (
<div className="page-container"> {/* Layout wrapper sınıfı */}
        <div className="header">
          <div className="search-container">
              <div className="search-bar">
                <i className="ph ph-magnifying-glass"></i>
                <input type="text" placeholder="Ara..." value={searchTerm} onChange={handleSearch} onFocus={() => searchTerm.length > 0 && setShowDropdown(true)} />
              </div>
              {showDropdown && searchResults.length > 0 && (
                  <div className="search-dropdown">
                      {searchResults.map((result, index) => (
                          <div key={index} className="search-result-item" onClick={() => handleResultClick(result)}>
                              <div className="result-icon">
                                  <i className={result.type === 'user' ? "ph-fill ph-user" : result.type === 'club' ? "ph-fill ph-users-three" : "ph-fill ph-calendar-star"}></i>
                              </div>
                              <div className="result-info">
                                  <h4>{result.type === 'event' ? result.title : result.type === 'club' ? result.name : result.fullName}</h4>
                                  <div className="result-type">{result.type}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
          <UserDropdown user={user} />
        </div>

        <h3 className="section-title">Yaklaşan Etkinlikler</h3>
        <div className="slider-container">
            {events.length > 0 ? (
                <>
                    <button className="slide-btn slide-left" onClick={() => scroll('left')}><i className="ph-bold ph-caret-left"></i></button>
                    <div className="horizontal-scroll" ref={scrollRef}>
                        {events.map(event => (
                            <div className="h-card" key={event.eventId}>
                                <i className="ph-fill ph-calendar-star h-bg-icon"></i>
                                <div>
                                    <div className="h-date">📅 {new Date(event.startTime).toLocaleDateString('tr-TR')}</div>
                                    <h2 className="h-title" style={{fontSize: '2rem', marginTop:'15px'}}>{event.title}</h2>
                                    <p style={{color:'#a1a1aa', maxWidth:'80%'}}>{event.description?.substring(0, 80)}...</p>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto'}}>
                                    <span style={{fontSize:'1rem', fontWeight:'600', color:'#c7d2fe'}}>{event.club ? event.club.name : 'Genel'}</span>
                                    <div className="h-btn-inspect" onClick={() => navigate(`/events/${event.eventId}`)}>İncele</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="slide-btn slide-right" onClick={() => scroll('right')}><i className="ph-bold ph-caret-right"></i></button>
                </>
            ) : <div style={{background:'#1d1d24', padding:'30px', borderRadius:'20px', textAlign:'center', color:'#a1a1aa'}}>Etkinlik yok.</div>}
        </div>

        <h3 className="section-title" style={{marginTop:'40px'}}>Hızlı Erişim</h3>
        <div className="grid-cards">
            <div className="glass-card" onClick={() => navigate('/events')}><i className="ph-fill ph-calendar-blank" style={{ fontSize: '2rem', color: '#d8b4fe', marginBottom: '10px' }}></i><div style={{ fontWeight: '600' }}>Etkinlikler</div></div>
            <div className="glass-card" onClick={() => navigate('/clubs')}><i className="ph-fill ph-users" style={{ fontSize: '2rem', color: '#86efac', marginBottom: '10px' }}></i><div style={{ fontWeight: '600' }}>Kulüpler</div></div>
            <div className="glass-card" onClick={() => navigate('/create-event')}><i className="ph-fill ph-plus-circle" style={{ fontSize: '2rem', color: '#93c5fd', marginBottom: '10px' }}></i><div style={{ fontWeight: '600' }}>Oluştur</div></div>
            <div className="glass-card" onClick={() => navigate('/profile')}><i className="ph-fill ph-user" style={{ fontSize: '2rem', color: '#fdba74', marginBottom: '10px' }}></i><div style={{ fontWeight: '600' }}>Profil</div></div>
        </div>

        {selectedUser && (
            <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setSelectedUser(null)}><i className="ph ph-x"></i></button>
                    <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#8b5cf6', margin:'0 auto 20px auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:'bold'}}>{getInitials(selectedUser.fullName)}</div>
                    <h2 style={{margin:0}}>{selectedUser.fullName}</h2>
                    <p style={{color:'#a1a1aa', margin:'5px 0 20px 0'}}>{selectedUser.role}</p>
                    <button onClick={handleFollow} style={{background:'#2563eb', color:'white', border:'none', padding:'12px 30px', borderRadius:'30px', fontWeight:'600', cursor:'pointer', width:'100%'}}>Takip Et / Çıkar</button>
                </div>
            </div>
        )}
    </div>
  );
};
export default Dashboard;