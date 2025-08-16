import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer'; // Import the Footer component

const Layout = () => {
    return (
        <div className="app-layout">
            <main className="app-content">
                <Outlet />
            </main>
            <Navbar />
            <Footer /> {/* Add the Footer component here */}
        </div>
    );
};

export default Layout;
