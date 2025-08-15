import React, { useState, useEffect } from 'react';
import Modal from '../Layout/Modal';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { subDays } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);

const ExportReportFilterModal = ({ isOpen, onClose, onGenerateReport, members }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [selectedInitiators, setSelectedInitiators] = useState([]);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // New state for current page

    const allTransactionTypes = ['expense', 'income', 'loan', 'settle_up'];
    const allMembers = members || [];
    const allPaymentMethods = ['Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia', 'Otro'];

    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            setEndDate(today);
            setStartDate(subDays(today, 31));
            setTransactionTypes(allTransactionTypes);
            setSelectedParticipants(allMembers.map(member => member.uid));
            setSelectedInitiators(allMembers.map(member => member.uid));
            setSelectedPaymentMethods(allPaymentMethods);
            setCurrentPage(1); // Reset to first page when modal opens
        }
    }, [isOpen, allMembers, allPaymentMethods, allTransactionTypes]);

    const handleGenerateReport = () => {
        const filters = {
            startDate: startDate,
            endDate: endDate,
            transactionTypes: transactionTypes,
            participants: selectedParticipants,
            initiatedBy: selectedInitiators,
            paymentMethods: selectedPaymentMethods,
        };
        onGenerateReport(filters);
        onClose();
    };

    const handleTransactionTypeChange = (type) => {
        setTransactionTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleParticipantChange = (uid) => {
        setSelectedParticipants(prev =>
            prev.includes(uid) ? prev.filter(p => p !== uid) : [...prev, uid]
        );
    };

    const handleInitiatorChange = (uid) => {
        setSelectedInitiators(prev =>
            prev.includes(uid) ? prev.filter(i => i !== uid) : [...prev, uid]
        );
    };

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethods(prev =>
            prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
        );
    };

    const handleSelectAllTransactionTypes = () => {
        setTransactionTypes(allTransactionTypes);
    };

    const handleDeselectAllTransactionTypes = () => {
        setTransactionTypes([]);
    };

    const handleSelectAllParticipants = () => {
        setSelectedParticipants(allMembers.map(member => member.uid));
    };

    const handleDeselectAllParticipants = () => {
        setSelectedParticipants([]);
    };

    const handleSelectAllInitiators = () => {
        setSelectedInitiators(allMembers.map(member => member.uid));
    };

    const handleDeselectAllInitiators = () => {
        setSelectedInitiators([]);
    };

    const handleSelectAllPaymentMethods = () => {
        setSelectedPaymentMethods(allPaymentMethods);
    };

    const handleDeselectAllPaymentMethods = () => {
        setSelectedPaymentMethods([]);
    };

    const goToNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => prev - 1);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 1:
                return (
                    <div className="filter-section">
                        <h5>Rango de Fechas</h5>
                        <p>Selecciona un rango de fechas para incluir transacciones.</p>
                        <div className="form-group filter-group">
                            <label htmlFor="startDate">Fecha Inicio:</label>
                            <DatePicker
                                id="startDate"
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="yyyy-MM-dd"
                                locale="es"
                                className="filter-select"
                            />
                        </div>
                        <div className="form-group filter-group">
                            <label htmlFor="endDate">Fecha Fin:</label>
                            <DatePicker
                                id="endDate"
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="yyyy-MM-dd"
                                locale="es"
                                className="filter-select"
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="filter-section">
                        <h5>Tipos de Transacción</h5>
                        <p>Elige los tipos de transacciones que deseas incluir.</p>
                        <div className="form-group filter-group">
                            <label>Tipos de Transacción:</label>
                            <div className="checkbox-group">
                                {allTransactionTypes.map(type => (
                                    <label key={type}>
                                        <input
                                            type="checkbox"
                                            value={type}
                                            checked={transactionTypes.includes(type)}
                                            onChange={() => handleTransactionTypeChange(type)}
                                        />
                                        {type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : type === 'loan' ? 'Préstamo' : 'Liquidación (Settle Up)'}
                                    </label>
                                ))}
                            </div>
                            <div className="select-all-buttons">
                                <button className="button secondary" onClick={handleSelectAllTransactionTypes}>Seleccionar Todos</button>
                                <button className="button secondary" onClick={handleDeselectAllTransactionTypes}>Deseleccionar Todos</button>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="filter-section">
                        <h5>Participantes</h5>
                        <p>Selecciona los participantes involucrados en las transacciones.</p>
                        <div className="form-group filter-group">
                            <label>Participantes:</label>
                            <div className="checkbox-group">
                                {allMembers.map(member => (
                                    <label key={member.uid}>
                                        <input
                                            type="checkbox"
                                            value={member.uid}
                                            checked={selectedParticipants.includes(member.uid)}
                                            onChange={() => handleParticipantChange(member.uid)}
                                        />
                                        {member.displayName}
                                    </label>
                                ))}
                            </div>
                            <div className="select-all-buttons">
                                <button className="button secondary" onClick={handleSelectAllParticipants}>Seleccionar Todos</button>
                                <button className="button secondary" onClick={handleDeselectAllParticipants}>Deseleccionar Todos</button>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="filter-section">
                        <h5>Iniciado Por</h5>
                        <p>Filtra transacciones iniciadas por miembros específicos.</p>
                        <div className="form-group filter-group">
                            <label>Iniciado Por:</label>
                            <div className="checkbox-group">
                                {allMembers.map(member => (
                                    <label key={member.uid}>
                                        <input
                                            type="checkbox"
                                            value={member.uid}
                                            checked={selectedInitiators.includes(member.uid)}
                                            onChange={() => handleInitiatorChange(member.uid)}
                                        />
                                        {member.displayName}
                                    </label>
                                ))}
                            </div>
                            <div className="select-all-buttons">
                                <button className="button secondary" onClick={handleSelectAllInitiators}>Seleccionar Todos</button>
                                <button className="button secondary" onClick={handleDeselectAllInitiators}>Deseleccionar Todos</button>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="filter-section">
                        <h5>Forma de Pago</h5>
                        <p>Filtra transacciones por el método de pago utilizado.</p>
                        <div className="form-group filter-group">
                            <label>Método de Pago:</label>
                            <div className="checkbox-group">
                                {allPaymentMethods.map(method => (
                                    <label key={method}>
                                        <input
                                            type="checkbox"
                                            value={method}
                                            checked={selectedPaymentMethods.includes(method)}
                                            onChange={() => handlePaymentMethodChange(method)}
                                        />
                                        {method}
                                    </label>
                                ))}
                            </div>
                            <div className="select-all-buttons">
                                <button className="button secondary" onClick={handleSelectAllPaymentMethods}>Seleccionar Todos</button>
                                <button className="button secondary" onClick={handleDeselectAllPaymentMethods}>Deseleccionar Todos</button>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button className="button primary" onClick={handleGenerateReport}>
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Filtrar Reporte de Transacciones">
            <div className="export-filter-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {renderPage()}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    {currentPage > 1 && (
                        <button className="button secondary" onClick={goToPreviousPage}>
                            Anterior
                        </button>
                    )}
                    {currentPage < 5 && (
                        <button className="button primary" onClick={goToNextPage}>
                            Siguiente
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ExportReportFilterModal;