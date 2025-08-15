import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authUtils';
import Layout from '../components/Layout/Layout';

const ProtectedRoute = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // Si no hay usuario, redirige a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si hay un usuario, renderiza el Layout principal que contiene la Navbar y el contenido de la ruta anidada
    return <Layout />;
};

export default ProtectedRoute;
