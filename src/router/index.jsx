import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authUtils';

// Importación de componentes de página y layout
import ProtectedRoute from './ProtectedRoute';
import Login from '../components/Auth/Login';
import GroupList from '../components/Groups/GroupList';
import Dashboard from '../components/Dashboard/Dashboard';
import Profile from '../components/Profile/Profile';
import Settings from '../components/Settings/Settings';
import Loader from '../components/Layout/Loader';

import AddFriendByLink from '../components/Auth/AddFriendByLink'; // Importar AddFriendByLink
import ArchivedTransactions from '../components/Dashboard/ArchivedTransactions'; // New import

const AppRouter = () => {
    const { currentUser, loading } = useAuth();

    // Muestra un loader mientras se verifica el estado de autenticación
    if (loading) {
        return <Loader />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta de Login: si el usuario ya está logueado, lo redirige a la raíz */}
                <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
                <Route path="/add-friend-by-link" element={<AddFriendByLink />} /> {/* Nueva ruta pública para agregar amigos por enlace */}

                {/* Rutas Protegidas: solo accesibles para usuarios logueados */}
                <Route path="/*" element={<ProtectedRoute />}>
                    <Route index element={<GroupList />} />
                    <Route path="group/:groupId" element={<Dashboard />} />
                    <Route path="group/:groupId/archived" element={<ArchivedTransactions />} /> {/* New route */}
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    
                    {/* Cualquier otra ruta anidada no encontrada redirige a la raíz */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;