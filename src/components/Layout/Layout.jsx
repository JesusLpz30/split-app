import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Profile from '../Profile/Profile';
import Settings from '../Settings/Settings';

const Layout = () => {
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1000);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth > 1000);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="app-layout">
            {isLargeScreen ? (
                <>
                    <div className="app-name">Split App</div>
                    <div className="large-screen-layout">
                        <div className="main-content-column">
                            <main className="app-content">
                                <Outlet />
                            </main>
                        </div>
                        <div className="sidebar-column">
                            <Profile />
                            <Settings />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <main className="app-content">
                        <Outlet />
                    </main>
                    <Navbar />
                </>
            )}
            <Footer />
        </div>
    );
};

export default Layout;
