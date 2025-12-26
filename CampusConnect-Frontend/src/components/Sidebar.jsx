import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  // Get User to check role
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="sidebar">
      <Link to="/" className="logo">
        <i className="ph-fill ph-squares-four"></i> CampusConnect
      </Link>
      
      <div className="menu-title">MENÜ</div>
      
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <i className="ph ph-squares-four"></i> Ana Panel
      </NavLink>
      
      <NavLink to="/events" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <i className="ph ph-calendar-check"></i> Etkinlikler
      </NavLink>
      
      <NavLink to="/clubs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <i className="ph ph-users-three"></i> Kulüpler
      </NavLink>

      <div className="menu-title" style={{ marginTop: '30px' }}>TOPLULUK</div>
      
      <NavLink to="/messages" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <i className="ph ph-chat-circle-dots"></i> Mesajlar
      </NavLink>

      {/* ADMIN LINK CONDITIONALLY RENDERED */}
      {user && user.role === 'ADMIN' && (
        <>
            <div className="menu-title" style={{ marginTop: '30px', color:'#ef4444' }}>YÖNETİM</div>
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} style={{color:'#ef4444'}}>
                <i className="ph-fill ph-shield-check"></i> Admin Paneli
            </NavLink>
        </>
      )}

    </div>
  );
};

export default Sidebar;