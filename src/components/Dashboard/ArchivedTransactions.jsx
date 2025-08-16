import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useGroup } from '../../context/groupUtils';
import { useAuth } from '../../context/authUtils';
import { useAlert } from '../../context/alertUtils';
import { unarchiveTransaction, deleteTransaction } from '../../firebase/firestoreService'; // Import unarchiveTransaction and other necessary functions

import ConfirmModal from '../Layout/ConfirmModal';
import Modal from '../Layout/Modal';
import TransactionForm from './TransactionForm';
import InfoTooltip from '../Layout/InfoTooltip';
import TransactionCard from './TransactionCard';
import '../../components/Dashboard/TransactionCard.css'; // Import its CSS

const ArchivedTransactions = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { currentGroup } = useGroup();
    const { showAlert } = useAlert();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterCategory, setFilterCategory] = useState('');
    const [filterInitiator, setFilterInitiator] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [expandedTransactionId, setExpandedTransactionId] = useState(null);

    const handleToggleExpand = (transactionId) => {
        setExpandedTransactionId(expandedTransactionId === transactionId ? null : transactionId);
    };

    // Fetch only archived transactions
    useEffect(() => {
        if (!groupId) return;

        setLoading(true);
        setError(null);

        const transactionsRef = collection(db, `groups/${groupId}/transactions`);
        let qTransactions = query(
            transactionsRef,
            where('isArchived', '==', true)
        );

        if (filterCategory) {
            qTransactions = query(qTransactions, where('category', '==', filterCategory));
        }
        if (filterInitiator) {
            qTransactions = query(qTransactions, where('initiatedBy.uid', '==', filterInitiator));
        }
        if (filterStartDate) {
            qTransactions = query(qTransactions, where('archivedAt', '>=', new Date(filterStartDate)));
        }
        if (filterEndDate) {
            qTransactions = query(qTransactions, where('archivedAt', '<=', new Date(filterEndDate)));
        }

        qTransactions = query(qTransactions, orderBy('archivedAt', 'desc'));

        const unsubscribe = onSnapshot(qTransactions, (querySnapshot) => {
            const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching archived transactions:", err);
            setError("Error al cargar transacciones archivadas.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [groupId, filterCategory, filterInitiator, filterStartDate, filterEndDate]);

    const handleUnarchiveTransaction = async (transactionId) => {
        try {
            await unarchiveTransaction(currentGroup.id, transactionId);
            showAlert("Transacción desarchivada con éxito.", "success");
        } catch (error) {
            console.error("Error al desarchivar transacción:", error);
            showAlert("Hubo un error al desarchivar la transacción.", "error");
        }
    };

    const handleDeleteRequest = (transactionId) => {
        setTransactionToDelete(transactionId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await deleteTransaction(currentGroup.id, transactionToDelete);
            showAlert("Transacción eliminada con éxito.", "success");
        } catch (error) {
            console.error("Error al eliminar transacción:", error);
            showAlert("Hubo un error al eliminar la transacción.", "error");
        } finally {
            setIsConfirmOpen(false);
            setTransactionToDelete(null);
        }
    };

    const handleEditRequest = (transaction) => {
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTransaction(null);
    };

    // Note: Accept, Reject, Re-request are typically not needed for archived view,
    // but keeping placeholders if future functionality requires it.
    const handleAcceptTransaction = async () => {
        showAlert("Esta transacción ya está archivada.", "info");
    };

    const handleRejectTransaction = async () => {
        showAlert("Esta transacción ya está archivada.", "info");
    };

    const handleReRequestTransaction = async () => {
        showAlert("Esta transacción ya está archivada.", "info");
    };

    if (loading) {
        return <p>Cargando transacciones archivadas...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="list-container">
            <button onClick={() => navigate(-1)} className="back-button">← Volver</button>
            <button onClick={() => setIsFilterModalOpen(true)} className="button secondary">Filtrar Transacciones</button>
            <h4>Transacciones Archivadas <InfoTooltip text="Aquí puedes ver todas las transacciones que has archivado. Puedes desarchivarlas o eliminarlas permanentemente." /></h4>
            
            <ul className="list">
                {transactions.length > 0 ? transactions.map(transaction => (
                    <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEditRequest={handleEditRequest}
                        onDeleteRequest={handleDeleteRequest}
                        // For archived view, we provide unarchive instead of archive
                        onArchiveTransaction={handleUnarchiveTransaction} // Use unarchive function
                        // Pass dummy functions for actions not relevant in archived view
                        onAcceptTransaction={handleAcceptTransaction}
                        onRejectTransaction={handleRejectTransaction}
                        onReRequestTransaction={handleReRequestTransaction}
                        isExpanded={transaction.id === expandedTransactionId}
                        onToggleExpand={handleToggleExpand}
                    />
                )) : (
                    <p>No hay transacciones archivadas en este grupo.</p>
                )}
            </ul>

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación de Transacción"
                message="¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer."
            />

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Transacción">
                <TransactionForm existingTransaction={editingTransaction} onFormSubmit={handleCloseEditModal} />
            </Modal>

            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtrar Transacciones">
                <div className="filters-modal-content">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Todas las Categorías</option>
                        {currentGroup.categories && currentGroup.categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterInitiator}
                        onChange={(e) => setFilterInitiator(e.target.value)}
                    >
                        <option value="">Todos los Iniciadores</option>
                        {currentGroup.memberDetails && currentGroup.memberDetails.map(member => (
                            <option key={member.uid} value={member.uid}>{member.displayName}</option>
                        ))}
                    </select>

                    <DatePicker
                        selected={filterStartDate ? new Date(filterStartDate) : null}
                        onChange={(date) => setFilterStartDate(date ? date.toISOString().split('T')[0] : '')}
                        dateFormat="yyyy-MM-dd"
                        locale="es"
                        placeholderText="Fecha Inicio"
                        className="input-field"
                    />
                    <DatePicker
                        selected={filterEndDate ? new Date(filterEndDate) : null}
                        onChange={(date) => setFilterEndDate(date ? date.toISOString().split('T')[0] : '')}
                        dateFormat="yyyy-MM-dd"
                        locale="es"
                        placeholderText="Fecha Fin"
                        className="input-field"
                    />

                    <div className="modal-actions">
                        <button onClick={() => setIsFilterModalOpen(false)} className="button primary">Aplicar Filtros</button>
                        <button onClick={() => {
                            setFilterCategory('');
                            setFilterInitiator('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                            setIsFilterModalOpen(false);
                        }} className="button secondary">Limpiar Filtros</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArchivedTransactions;