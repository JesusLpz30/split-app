import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/authUtils';
import { uploadProfileImage } from '../../firebase/storageService';
import { updateUserProfilePhoto, updateUserProfileDisplayName, deleteUserAccount } from '../../firebase/authService';
import ConfirmModal from '../Layout/ConfirmModal';
import FriendManagement from './FriendManagement';
import MyCards from './MyCards';
import InfoTooltip from '../Layout/InfoTooltip';
import { useAlert } from '../../context/alertUtils';
import './Profile.css';

const DefaultAvatar = () => (
    <svg className="profile-avatar-svg" viewBox="0 0 128 128" role="img" aria-label="avatar">
        <path fill="var(--text-secondary)" d="M103,102.1388 C93.094,111.92 79.3504,118 64.1638,118 C48.8056,118 34.9294,111.768 25,101.7892 C25,95.2 32.8312,90 43.25,90 L85.0826,90 C95.5014,90 103,95.413 103,102.1388 Z"></path>
        <path fill="var(--text-secondary)" d="M64,85 C77.807,85 89,73.807 89,60 C89,46.193 77.807,35 64,35 C50.193,35 39,46.193 39,60 C39,73.807 50.193,85 64,85 Z"></path>
    </svg>
);

const Profile = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const { showAlert } = useAlert();
    const [newImage, setNewImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const [editingDisplayName, setEditingDisplayName] = useState(currentUser.displayName || '');
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

    const shareLink = currentUser ? `${window.location.origin}/add-friend-by-link?uid=${currentUser.uid}` : '';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!newImage) return;
        setLoading(true);
        setError('');
        try {
            const downloadURL = await uploadProfileImage(currentUser.uid, newImage);
            await updateUserProfilePhoto(downloadURL);
            const updatedUser = { ...currentUser, photoURL: downloadURL };
            setCurrentUser(updatedUser);
            showAlert('Imagen de perfil actualizada con éxito!', 'success');
            setNewImage(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError('Error al subir la imagen.');
            showAlert('Error al subir la imagen.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDisplayName = async () => {
        if (editingDisplayName.trim() === '' || editingDisplayName === currentUser.displayName) return;
        setLoading(true);
        setError('');
        try {
            await updateUserProfileDisplayName(editingDisplayName);
            const updatedUser = { ...currentUser, displayName: editingDisplayName };
            setCurrentUser(updatedUser);
            showAlert('Nombre de usuario actualizado con éxito!', 'success');
        } catch (err) {
            console.error("Error updating display name:", err);
            setError('Error al actualizar el nombre.');
            showAlert('Error al actualizar el nombre.', 'error');
        }
        finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        setError('');
        try {
            await deleteUserAccount();
            showAlert('Cuenta eliminada con éxito.', 'success');
        } catch (err) {
            console.error("Error deleting account:", err);
            setError('Error al eliminar la cuenta.');
            showAlert('Error al eliminar la cuenta.', 'error');
        } finally {
            setLoading(false);
            setIsConfirmDeleteModalOpen(false);
        }
    };

    const handleCopyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        showAlert('Enlace copiado al portapapeles!', 'success');
    };

    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div className="profile-container">
            {error && <p className="error-message">{error}</p>}

            {/* Bloque Unificado de Perfil */}
            <div className="profile-section user-profile-header">
                <h3>Perfil de Usuario</h3>
                <div className="avatar-container">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Vista previa" className="profile-avatar" />
                    ) : currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Avatar" className="profile-avatar" />
                    ) : (
                        <DefaultAvatar />
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />

                <div className="avatar-actions">
                    <button onClick={triggerFileSelect} className="button">Cambiar Foto</button>
                    {newImage && (
                        <button onClick={handleUpload} className="button primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Foto'}
                        </button>
                    )}
                </div>
                
                <div className="username-section">
                    <input
                        type="text"
                        value={editingDisplayName}
                        onChange={(e) => setEditingDisplayName(e.target.value)}
                        placeholder="Tu nombre de usuario"
                        className="input-field"
                    />
                    <button onClick={handleUpdateDisplayName} className="button primary" disabled={editingDisplayName.trim() === '' || editingDisplayName === currentUser.displayName || loading}>
                        Guardar Nombre
                    </button>
                </div>
            </div>

            <FriendManagement />

            <MyCards />

            <div className="profile-section">
                <h3>Compartir Perfil <InfoTooltip text="Usa este enlace para que otros usuarios puedan enviarte solicitudes de amistad directamente." /></h3>
                <p>Comparte este enlace para que otros usuarios puedan agregarte como amigo:</p>
                <div className="share-link-container">
                    <input type="text" value={shareLink} readOnly className="input-field" />
                    <button onClick={handleCopyShareLink} className="button">Copiar Enlace</button>
                </div>
                <p className="info-text">Puedes generar un código QR a partir de este enlace con una herramienta externa para compartirlo fácilmente.</p>
            </div>

            <div className="profile-section">
                <h3>Gestión de Cuenta <InfoTooltip text="Aquí puedes gestionar opciones avanzadas de tu cuenta, incluyendo la eliminación permanente de tu perfil y todos los datos asociados." /></h3>
                <button onClick={() => setIsConfirmDeleteModalOpen(true)} className="button danger" disabled={loading}>
                    Eliminar Cuenta
                </button>
            </div>

            <ConfirmModal 
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Confirmar Eliminación de Cuenta"
                message="¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y eliminará todos tus datos."
            />
        </div>
    );
};

export default Profile;