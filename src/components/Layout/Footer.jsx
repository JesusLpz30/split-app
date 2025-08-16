import React from 'react';
import { useTheme } from '../../context/themeUtils';
import './Footer.css'; // We'll create this CSS file

const Footer = () => {
    const { theme } = useTheme(); // To adapt to the current theme

    return (
        <footer className={`footer-container ${theme}`}>
            <div className="footer-content">
                <p className="app-name">Counter Wizard</p>
                <p className="developer-info">Empoderado por Consultors K</p>
                <p className="copyright">&copy; 2025</p>
            </div>
        </footer>
    );
};

export default Footer;
