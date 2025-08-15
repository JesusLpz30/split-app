import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';
import { sendFriendRequest, getUserByUid } from '../../firebase/firestoreService'; // Importar getUserByUid
import { useAlert } from '../../context/alertUtils';

const AddFriendByLink = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showAlert } = useAlert(); // Obtener showAlert

    useEffect(() => {
        if (authLoading) return; // Esperar a que el estado de autenticación se cargue

        const targetUid = searchParams.get('uid');

        if (!targetUid) {
            showAlert('UID de usuario no proporcionado en el enlace.', 'error');
            setTimeout(() => navigate('/'), 3000); // Redirigir a la página principal
            return;
        }

        if (!currentUser) {
            showAlert('Por favor, inicia sesión para agregar a este amigo.', 'info');
            navigate('/login');
            return;
        }

        if (currentUser.uid === targetUid) {
            showAlert('No puedes agregarte a ti mismo como amigo.', 'error');
            setTimeout(() => navigate('/profile'), 3000); // Redirigir al perfil
            return;
        }

        const processRequest = async () => {
            try {
                const targetUser = await getUserByUid(targetUid);
                if (!targetUser) {
                    showAlert('Usuario objetivo no encontrado.', 'error');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }
                const targetEmail = targetUser.email;

                const result = await sendFriendRequest(currentUser.uid, targetEmail);
                showAlert(result.message || 'Solicitud de amistad enviada.', 'success');
            } catch (err) {
                showAlert(err.message || 'Error al enviar la solicitud de amistad.', 'error');
            } finally {
                setTimeout(() => {
                    navigate('/profile'); // Redirigir al perfil del usuario
                }, 3000);
            }
        };

        processRequest();

    }, [currentUser, authLoading, searchParams, navigate, showAlert]);

    return (
        <div className="container center-screen">
            <div className="card">
                <p>Procesando solicitud de amistad...</p>
            </div>
        </div>
    );
};

export default AddFriendByLink;