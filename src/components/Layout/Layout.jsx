import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="app-layout">
            <main className="app-content">
                <Outlet />
            </main>
            <Navbar />
        </div>
    );
};

export default Layout;
