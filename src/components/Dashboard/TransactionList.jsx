import React, { useState, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);
import { deleteTransaction, acceptTransaction, rejectTransaction, addTransaction, archiveTransaction } from '../../firebase/firestoreService';
import { useGroup } from '../../context/groupUtils';
import { useAuth } from '../../context/authUtils';
import { useAlert } from '../../context/alertUtils';
import ConfirmModal from '../Layout/ConfirmModal';
import Modal from '../Layout/Modal';
import TransactionForm from './TransactionForm';
import InfoTooltip from '../Layout/InfoTooltip';
import TransactionCard from './TransactionCard';
import '../../components/Dashboard/TransactionCard.css';

const TransactionList = ({ transactions = [] }) => {
    const { currentGroup } = useGroup();
    const { showAlert } = useAlert();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    // Estados para los filtros
    const [typeFilter, setTypeFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const allTransactions = useMemo(() => 
        [...transactions].sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()),
        [transactions]
    );

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(transaction => {
            // Filter out archived transactions by default
            if (transaction.isArchived) {
                return false;
            }

            const typeMatch = typeFilter ? transaction.type === typeFilter : true;
            const userMatch = userFilter ? transaction.initiatedBy.uid === userFilter : true;
            const paymentMethodMatch = paymentMethodFilter ? transaction.paymentMethod === paymentMethodFilter : true;

            // Date filter logic
            const transactionDate = transaction.createdAt?.toDate();
            const start = startDateFilter ? new Date(startDateFilter) : null;
            const end = endDateFilter ? new Date(endDateFilter) : null;

            const dateMatch = (!start || (transactionDate && transactionDate >= start)) &&
                              (!end || (transactionDate && transactionDate <= end));

            return typeMatch && userMatch && paymentMethodMatch && dateMatch;
        });
    }, [allTransactions, typeFilter, userFilter, paymentMethodFilter, startDateFilter, endDateFilter]);

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

    const handleAcceptTransaction = async (transactionId) => {
        try {
            await acceptTransaction(currentGroup.id, transactionId);
            showAlert("Transacción aceptada con éxito.", "success");
        } catch (error) {
            console.error("Error al aceptar transacción:", error);
            showAlert("Hubo un error al aceptar la transacción.", "error");
        }
    };

    const handleRejectTransaction = async (transactionId) => {
        try {
            await rejectTransaction(currentGroup.id, transactionId);
            showAlert("Transacción rechazada.", "info");
        } catch (error) {
            console.error("Error al rechazar transacción:", error);
            showAlert("Hubo un error al rechazar la transacción.", "error");
        }
    };

    const handleReRequestTransaction = async (originalTransaction) => {
        const newTransactionData = {
            ...originalTransaction,
            status: 'pending',
            createdAt: new Date(),
        };
        delete newTransactionData.id;
        delete newTransactionData.acceptedAt;
        delete newTransactionData.rejectedAt;
        delete newTransactionData.updatedAt;

        try {
            await addTransaction(currentGroup.id, newTransactionData);
            showAlert("Nueva solicitud enviada con éxito.", "success");
        } catch (error) {
            console.error("Error al re-enviar solicitud:", error);
            showAlert("Hubo un error al re-enviar la solicitud.", "error");
        }
    };

    const handleArchiveTransaction = async (transactionId) => {
        try {
            await archiveTransaction(currentGroup.id, transactionId);
            showAlert("Transacción archivada con éxito.", "success");
        } catch (error) {
            console.error("Error al archivar transacción:", error);
            showAlert("Hubo un error al archivar la transacción.", "error");
        }
    };

    return (
        <div className="list-container">
            <h4>Historial de Movimientos <InfoTooltip text="Aquí puedes ver todas las transacciones registradas en este grupo, incluyendo gastos, préstamos, ingresos y pagos. Las transacciones pendientes requieren tu acción." /></h4>
            
            <div className="filters-controls">
                <button className="button secondary" onClick={() => setIsFilterModalOpen(true)}>Filtros</button>
            </div>

            <ul className="list">
                {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
                    <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEditRequest={handleEditRequest}
                        onDeleteRequest={handleDeleteRequest}
                        onAcceptTransaction={handleAcceptTransaction}
                        onRejectTransaction={handleRejectTransaction}
                        onReRequestTransaction={handleReRequestTransaction}
                        onArchiveTransaction={handleArchiveTransaction}
                    />
                )) : (
                    <p>No hay movimientos que coincidan con los filtros seleccionados.</p>
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

            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtros de Movimientos">
                <div className="filter-modal-content">
                    <div className="filter-group">
                        <label htmlFor="typeFilter">Tipo:</label>
                        <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
                            <option value="">Todos los Tipos</option>
                            <option value="expense">Gasto</option>
                            <option value="income">Ingreso</option>
                            <option value="loan">Préstamo</option>
                            <option value="settle_up">Pago</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="userFilter">Usuario:</label>
                        <select id="userFilter" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="filter-select">
                            <option value="">Todos los Usuarios</option>
                            {currentGroup?.memberDetails.map(member => (
                                <option key={member.uid} value={member.uid}>{member.displayName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="paymentMethodFilter">Método de Pago:</label>
                        <select id="paymentMethodFilter" value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} className="filter-select">
                            <option value="">Todos los Métodos de Pago</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="startDateFilter">Fecha de Inicio:</label>
                        <DatePicker
                            id="startDateFilter"
                            selected={startDateFilter ? new Date(startDateFilter) : null}
                            onChange={(date) => setStartDateFilter(date ? date.toISOString().split('T')[0] : '')}
                            dateFormat="yyyy-MM-dd"
                            locale="es"
                            className="filter-select"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="endDateFilter">Fecha de Fin:</label>
                        <DatePicker
                            id="endDateFilter"
                            selected={endDateFilter ? new Date(endDateFilter) : null}
                            onChange={(date) => setEndDateFilter(date ? date.toISOString().split('T')[0] : '')}
                            dateFormat="yyyy-MM-dd"
                            locale="es"
                            className="filter-select"
                        />
                    </div>

                    <button onClick={() => { setTypeFilter(''); setUserFilter(''); setPaymentMethodFilter(''); setStartDateFilter(''); setEndDateFilter(''); setIsFilterModalOpen(false); }} className="button secondary">Limpiar Filtros</button>
                </div>
            </Modal>
        </div>
    );
};

export default TransactionList;