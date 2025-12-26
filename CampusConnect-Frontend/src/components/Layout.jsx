import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="layout-container">
            {/* Sidebar Sabit */}
            <Sidebar />
            
            {/* İçerik Dinamik (Outlet) */}
            <div className="layout-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;