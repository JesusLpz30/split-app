import React, { useState } from 'react';
import { useAuth } from '../../context/authUtils';
import { useTheme } from '../../context/themeUtils';
import { deleteUserAccount } from '../../firebase/authService';
import { useAlert } from '../../context/alertUtils';
import Modal from '../Layout/Modal';
import ConfirmModal from '../Layout/ConfirmModal'; // Mantener si se usa para eliminar cuenta
import InfoTooltip from '../Layout/InfoTooltip';
import './Settings.css';

const Settings = () => {
    const { currentUser } = useAuth();
    const { theme, cycleTheme } = useTheme();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    // Eliminar estados de categorías
    // const [categories, setCategories] = useState([]);
    // const [newCategoryName, setNewCategoryName] = useState('');
    // const [newCategoryType, setNewCategoryType] = useState('expense');
    // const [editingCategory, setEditingCategory] = useState(null);
    // const [isConfirmDeleteCategoryModalOpen, setIsConfirmDeleteCategoryModalOpen] = useState(false);
    // const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Eliminar useEffect de categorías
    // useEffect(() => {
    //     if (!currentUser) return;
    //     const unsubscribe = getCategories(currentUser.uid, (fetchedCategories) => {
    //         setCategories(fetchedCategories);
    //     });
    //     return () => unsubscribe();
    // }, [currentUser]);

    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== currentUser.email) {
            setError("El texto de confirmación no coincide. Por favor, escribe tu email.");
            return;
        }

        setLoading(true);
        setError('');

        const result = await deleteUserAccount();

        if (!result.success) {
            if (result.error.code === 'auth/requires-recent-login') {
                showAlert('Esta operación es sensible y requiere autenticación reciente. Por favor, cierra sesión y vuelve a iniciarla antes de eliminar tu cuenta.', 'error');
            } else {
                showAlert('Ocurrió un error al eliminar tu cuenta.', 'error');
            }
            setLoading(false);
        } else {
            showAlert('Cuenta eliminada con éxito.', 'success');
        }
    };

    // Eliminar manejadores de categorías
    // const handleAddOrUpdateCategory = async (e) => { /* ... */ };
    // const handleEditCategory = (category) => { /* ... */ };
    // const handleDeleteCategoryRequest = (category) => { /* ... */ };
    // const handleConfirmDeleteCategory = async () => { /* ... */ };

    return (
        <div className="settings-container">
            <h1>Ajustes</h1>
            {error && <p className="error-message">{error}</p>}

            <div className="settings-section">
                <h3>Apariencia <InfoTooltip text="Cambia el tema visual de la aplicación entre las opciones disponibles: Oscuro, Claro y Matrix." /></h3>
                <div className="theme-switcher">
                    <span>Tema Actual: <span className="theme-name">{theme}</span></span>
                    <button className="button" onClick={cycleTheme}>Cambiar Tema</button>
                </div>
            </div>

            {/* Sección de Categorías eliminada */}
            {/*
            <div className="settings-section">
                <h3>Categorías <InfoTooltip text="Administra tus categorías personalizadas para gastos e ingresos. Puedes añadir nuevas, editar las existentes o eliminarlas. Estas categorías te ayudarán a organizar tus movimientos financieros." /></h3>
                <form onSubmit={handleAddOrUpdateCategory} className="form-container">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nombre de la categoría"
                        className="input-field"
                        required
                    />
                    <select
                        value={newCategoryType}
                        onChange={(e) => setNewCategoryType(e.target.value)}
                        className="input-field"
                    >
                        <option value="expense">Gasto</option>
                        <option value="income">Ingreso</option>
                    </select>
                    <button type="submit" className="button primary" disabled={loading}>
                        {editingCategory ? 'Actualizar Categoría' : 'Añadir Categoría'}
                    </button>
                    {editingCategory && (
                        <button type="button" className="button secondary" onClick={() => {
                            setEditingCategory(null);
                            setNewCategoryName('');
                            setNewCategoryType('expense');
                        }} disabled={loading}>
                            Cancelar Edición
                        </button>
                    )}
                </form>

                {categories.length > 0 ? (
                    <ul className="list">
                        {categories.map(category => (
                            <li key={category.id} className="list-item-expense">
                                <span>{category.name} ({category.type === 'expense' ? 'Gasto' : 'Ingreso'})</span>
                                <div className="category-actions">
                                    <button onClick={() => handleEditCategory(category)} className="button-icon">✏️</button>
                                    <button onClick={() => handleDeleteCategoryRequest(category)} className="button-icon">🗑️</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay categorías definidas. Añade algunas para organizar tus movimientos.</p>
                )}
            </div>
            */}

            <div className="settings-section danger-zone">
                <h3>Zona de Peligro <InfoTooltip text="Esta sección contiene acciones irreversibles que afectan directamente tu cuenta de usuario. Procede con precaución." /></h3>
                <div className="danger-zone-action">
                    <div>
                        <h4>Eliminar esta cuenta</h4>
                        <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten la certeza.</p>
                    </div>
                    <button className="button danger" onClick={() => setIsDeleteAccountModalOpen(true)} disabled={loading}>
                        Eliminar mi cuenta
                    </button>
                </div>
            </div>

            <Modal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} title="¿Estás absolutamente seguro?">
                <div className="delete-modal-content">
                    <p>Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos asociados.</p>
                    <p>Por favor, escribe <strong>{currentUser.email}</strong> para confirmar.</p>
                    <input 
                        type="text" 
                        className="input-field"
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        placeholder="Escribe tu email"
                    />
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button className="button secondary" onClick={() => setIsDeleteAccountModalOpen(false)} disabled={loading}>
                            Cancelar
                        </button>
                        <button 
                            className="button danger" 
                            onClick={handleDeleteAccount} 
                            disabled={deleteConfirmationText !== currentUser.email || loading}
                        >
                            {loading ? 'Eliminando...' : 'Entiendo las consecuencias, eliminar mi cuenta'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Eliminar ConfirmModal de categorías si ya no se usa */}
            {/*
            <ConfirmModal 
                isOpen={isConfirmDeleteCategoryModalOpen}
                onClose={() => setIsConfirmDeleteCategoryModalOpen(false)}
                onConfirm={handleConfirmDeleteCategory}
                title="Confirmar Eliminación de Categoría"
                message={`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
            />
            */}
        </div>
    );
};

export default Settings;