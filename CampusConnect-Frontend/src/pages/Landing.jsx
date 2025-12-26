import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sayfa açılınca giriş yapmış kullanıcı var mı kontrol et
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="landing-container">
      <div className="glow-bg"></div>
      
      <nav className="landing-nav">
        <Link to="/" className="logo" style={{fontSize: '1.5rem', display:'flex', alignItems:'center', gap:'10px', color:'white', textDecoration:'none', fontWeight:'700'}}>
          <i className="ph-fill ph-squares-four" style={{color:'#8b5cf6'}}></i> CampusConnect
        </Link>
        
        <div>
          {user ? (
            /* KULLANICI GİRİŞ YAPMIŞSA */
            <Link to="/dashboard" className="nav-btn btn-signup" style={{display:'flex', alignItems:'center', gap:'8px'}}>
               Dashboard'a Git <i className="ph-bold ph-arrow-right"></i>
            </Link>
          ) : (
            /* MİSAFİR İSE */
            <>
              <Link to="/login" className="nav-btn btn-login">Giriş Yap</Link>
              <Link to="/register" className="nav-btn btn-signup">Kayıt Ol</Link>
            </>
          )}
        </div>
      </nav>

      <div className="hero-section">
        <h1>
          Kampüs Hayatını<br /><span className="gradient-text">Tek Noktadan</span> Yönet.
        </h1>
        
        {user ? (
            /* KULLANICI VARSA ÖZEL MESAJ VE BUTON */
            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <p style={{fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '30px'}}>
                    Tekrar hoş geldin, <span style={{color:'white', fontWeight:'600'}}>{user.fullName}</span>! <br/>
                    Kulüpler ve etkinlikler seni bekliyor.
                </p>
                <Link to="/dashboard" className="nav-btn btn-signup" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                  Kaldığın Yerden Devam Et <i className="ph-bold ph-arrow-right"></i>
                </Link>
            </div>
        ) : (
            /* MİSAFİR İSE STANDART MESAJ */
            <>
                <p>Kulüplere katıl, etkinlikleri kaçırma ve kampüsün ritmini yakala.</p>
                <Link to="/register" className="nav-btn btn-signup" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                  Hemen Başla <i className="ph-bold ph-arrow-right"></i>
                </Link>
            </>
        )}
      </div>
    </div>
  );
};

export default Landing;