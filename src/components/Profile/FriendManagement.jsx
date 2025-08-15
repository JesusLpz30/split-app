
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { sendFriendRequest, getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest, getFriends, removeFriend } from '../../firebase/firestoreService';
import { useAlert } from '../../context/alertUtils';
import ConfirmModal from '../Layout/ConfirmModal';

// Componente reutilizable para secciones colapsables
const CollapsibleSection = ({ title, count, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="collapsible-section">
            <div className="collapsible-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                <h3>{title} <span className="count-badge">{count}</span></h3>
                <span className="collapse-icon">{isCollapsed ? '▼' : '▲'}</span>
            </div>
            {!isCollapsed && (
                <div className="collapsible-content">
                    {children}
                </div>
            )}
        </div>
    );
};

const FriendManagement = () => {
    const { currentUser } = useAuth();
    const { showAlert } = useAlert();
    const [friendEmail, setFriendEmail] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] = useState(false);
    const [friendToRemove, setFriendToRemove] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchFriendsData = async () => {
            setLoading(true);
            try {
                const requests = await getPendingFriendRequests(currentUser.uid);
                setPendingRequests(requests);
                const friends = await getFriends(currentUser.uid);
                setFriendsList(friends);
            } catch (err) {
                showAlert(err.message, "error");
            } finally {
                setLoading(false);
            }
        };

        fetchFriendsData();
    }, [currentUser, showAlert]);

    const handleSendFriendRequest = async (e) => {
        e.preventDefault();
        if (!friendEmail.trim()) {
            showAlert("Por favor, ingresa un correo electrónico.", "error");
            return;
        }
        setLoading(true);
        try {
            const result = await sendFriendRequest(currentUser.uid, friendEmail);
            showAlert(result.message, "success");
            setFriendEmail('');
        } catch (err) {
            showAlert(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        setLoading(true);
        try {
            await acceptFriendRequest(requestId, currentUser.uid);
            showAlert('Solicitud de amistad aceptada.', 'success');
            const requests = await getPendingFriendRequests(currentUser.uid);
            setPendingRequests(requests);
            const friends = await getFriends(currentUser.uid);
            setFriendsList(friends);
        } catch (err) {
            showAlert(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (requestId) => {
        setLoading(true);
        try {
            await rejectFriendRequest(requestId, currentUser.uid);
            showAlert('Solicitud de amistad rechazada.', 'info');
            const requests = await getPendingFriendRequests(currentUser.uid);
            setPendingRequests(requests);
        } catch (err) {
            showAlert(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriendRequest = (friend) => {
        setFriendToRemove(friend);
        setIsConfirmRemoveModalOpen(true);
    };

    const handleConfirmRemoveFriend = async () => {
        if (!friendToRemove) return;
        setLoading(true);
        try {
            await removeFriend(currentUser.uid, friendToRemove.uid);
            showAlert('Amigo eliminado con éxito.', 'success');
            const friends = await getFriends(currentUser.uid);
            setFriendsList(friends);
        } catch (err) {
            showAlert(err.message, "error");
        } finally {
            setLoading(false);
            setIsConfirmRemoveModalOpen(false);
            setFriendToRemove(null);
        }
    };

    return (
        <div className="profile-section friend-management-container">
            <h2>Gestión de Amigos</h2>
            {loading && <p>Cargando...</p>}

            <CollapsibleSection title="Enviar Solicitud">
                <form onSubmit={handleSendFriendRequest} className="form-container-inline">
                    <input
                        type="email"
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        placeholder="Correo electrónico del amigo"
                        className="input-field"
                        required
                    />
                    <button type="submit" className="button primary" disabled={loading}>Enviar</button>
                </form>
            </CollapsibleSection>

            <CollapsibleSection title="Solicitudes Pendientes" count={pendingRequests.length}>
                {pendingRequests.length > 0 ? (
                    <ul className="list">
                        {pendingRequests.map(request => (
                            <li key={request.id} className="list-item-expense">
                                <span>De: {request.senderEmail}</span>
                                <div className="request-actions">
                                    <button onClick={() => handleAcceptRequest(request.id)} className="button-icon accept">✅</button>
                                    <button onClick={() => handleRejectRequest(request.id)} className="button-icon reject">❌</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tienes solicitudes pendientes.</p>
                )}
            </CollapsibleSection>

            <CollapsibleSection title="Mis Amigos" count={friendsList.length}>
                {friendsList.length > 0 ? (
                    <ul className="list">
                        {friendsList.map(friend => (
                            <li key={friend.uid} className="list-item-expense">
                                <span>{friend.displayName} ({friend.email})</span>
                                <button onClick={() => handleRemoveFriendRequest(friend)} className="button-icon danger">🗑️</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aún no tienes amigos.</p>
                )}
            </CollapsibleSection>

            <ConfirmModal 
                isOpen={isConfirmRemoveModalOpen}
                onClose={() => setIsConfirmRemoveModalOpen(false)}
                onConfirm={handleConfirmRemoveFriend}
                title="Eliminar Amigo"
                message={`¿Estás seguro de que quieres eliminar a ${friendToRemove?.displayName || 'este amigo'} de tu lista de amigos?`}
            />
        </div>
    );
};

export default FriendManagement;
