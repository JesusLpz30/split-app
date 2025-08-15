import React from 'react';
import { NavLink } from 'react-router-dom';
import { IoHome, IoPersonCircle, IoSettingsSharp } from 'react-icons/io5';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-item" title="Grupos" end>
                <IoHome className="nav-icon" />
            </NavLink>
            <NavLink to="/profile" className="nav-item" title="Perfil">
                <IoPersonCircle className="nav-icon" />
            </NavLink>
            <NavLink to="/settings" className="nav-item" title="Ajustes">
                <IoSettingsSharp className="nav-icon" />
            </NavLink>
        </nav>
    );
};

export default Navbar;
