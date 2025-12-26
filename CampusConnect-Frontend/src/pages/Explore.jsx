import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';

const Explore = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 2) {
            const res = await axios.get(`http://localhost:8080/api/users/search?query=${term}`);
            // Kendimizi sonuçlardan filtreleyelim
            setResults(res.data.filter(u => u.userId !== user?.userId));
        } else {
            setResults([]);
        }
    };

    const handleFollow = async (targetId) => {
        try {
            // ARTIK 'params' GÖNDERMİYORUZ. Backend Token'dan alıyor.
            const res = await axios.post(`http://localhost:8080/api/users/${targetId}/follow`, null, {
                headers: { Authorization: `Bearer ${user.token}` } // Token Header'da gitmeli
            });
            toast.success(res.data);
        } catch (err) {
            console.error(err);
            toast.error("İşlem başarısız.");
        }
    };

    return (
        <div style={{display:'flex', width:'100%', minHeight:'100vh', background:'#09090b', color:'white'}}>
            <Sidebar />
            <div style={{flex:1, padding:'50px', marginLeft:'280px'}}>
                <h1>Kişi Keşfet</h1>
                <input 
                    type="text" 
                    placeholder="İsim ile ara..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        width:'100%', padding:'15px', background:'#1d1d24', border:'1px solid #333', 
                        borderRadius:'10px', color:'white', marginBottom:'30px'
                    }}
                />

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'20px'}}>
                    {results.map(u => (
                        <div key={u.userId} style={{background:'#1d1d24', padding:'20px', borderRadius:'15px', textAlign:'center', border:'1px solid #333'}}>
                            <div style={{width:'60px', height:'60px', borderRadius:'50%', background:'#8b5cf6', margin:'0 auto 15px auto', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'1.2rem'}}>
                                {u.fullName.charAt(0)}
                            </div>
                            <h3>{u.fullName}</h3>
                            <p style={{color:'#a1a1aa', fontSize:'0.9rem'}}>{u.role}</p>
                            <button 
                                onClick={() => handleFollow(u.userId)}
                                style={{marginTop:'15px', background:'#2563eb', border:'none', color:'white', padding:'8px 20px', borderRadius:'20px', cursor:'pointer'}}
                            >
                                Takip Et / Çıkar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Explore;