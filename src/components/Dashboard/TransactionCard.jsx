import React, { useState } from 'react';
import InfoTooltip from '../Layout/InfoTooltip';
import { useAuth } from '../../context/authUtils';
import { useGroup } from '../../context/groupUtils';
import { MdEdit, MdDelete, MdArchive, MdCheckCircle, MdCancel, MdRefresh, MdOutlineMoneyOff, MdOutlineHandshake, MdOutlineAccountBalanceWallet, MdOutlineSwapHoriz, MdWarning } from 'react-icons/md';

const TransactionCard = ({
    transaction,
    onEditRequest,
    onDeleteRequest,
    onAcceptTransaction,
    onRejectTransaction,
    onReRequestTransaction,
    onArchiveTransaction // New prop
}) => {
    const { currentUser } = useAuth();
    const { currentGroup } = useGroup();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    let IconComponent = null; // Use a component directly
    let typeText = '';
    let amountDisplay = '';
    let amountClass = '';

    switch (transaction.type) {
        case 'expense':
            IconComponent = MdOutlineMoneyOff;
            typeText = 'Gasto';
            amountDisplay = `-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction.amount)}`;
            amountClass = 'negative';
            break;
        case 'loan':
            IconComponent = MdOutlineHandshake;
            typeText = 'Préstamo';
            amountDisplay = `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction.amount)}`;
            amountClass = 'neutral';
            break;
        case 'income':
            IconComponent = MdOutlineAccountBalanceWallet;
            typeText = 'Ingreso';
            amountDisplay = `+${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction.amount)}`;
            amountClass = 'positive';
            break;
        case 'settle_up':
            IconComponent = MdOutlineSwapHoriz;
            typeText = 'Pago';
            amountDisplay = `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction.amount)}`;
            amountClass = 'neutral';
            break;
        default:
            return null;
    }

    const initiator = currentGroup.memberDetails.find(m => m.uid === transaction.initiatedBy.uid);
    const transactionDate = transaction.createdAt?.toDate();

    // Define month abbreviations
    const monthAbbreviations = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Derive short date (day / abbreviated month)
    const shortDate = transactionDate ? `${transactionDate.getDate()} / ${monthAbbreviations[transactionDate.getMonth()]}` : '';

    // Helper function to get short payment method and full title
    const getShortPaymentMethod = (method) => {
        switch (method) {
            case 'Tarjeta de Crédito':
                return { short: 'TDC', full: 'Tarjeta de Crédito' };
            case 'Tarjeta de Débito':
                return { short: 'TDD', full: 'Tarjeta de Débito' };
            case 'Transferencia':
                return { short: 'Transf.', full: 'Transferencia' };
            case 'Efectivo':
                return { short: 'Efectivo', full: 'Efectivo' };
            case 'Otro':
                return { short: 'Otro', full: 'Otro' };
            default:
                return { short: method || '-', full: method || 'Sin método de pago' };
        }
    };

    const { short: shortPaymentMethod, full: fullPaymentMethod } = getShortPaymentMethod(transaction.paymentMethod);

    return (
        <li className="transaction-card">
            <div className="transaction-card-header" onClick={toggleExpand}>
                {initiator?.photoURL && (
                    <img src={initiator.photoURL} alt={initiator.displayName} className="initiator-photo" />
                )}
                <span className="card-col-icon">{IconComponent && <IconComponent />}</span>
                <span className="card-col-type">{typeText}</span>
                <span className="card-col-category">{transaction.categoryName || '-'}</span>
                {transaction.status === 'pending' && (transaction.lender?.uid === currentUser.uid || transaction.borrower?.uid === currentUser.uid || transaction.payer?.uid === currentUser.uid || transaction.receiver?.uid === currentUser.uid) && (
                    <MdWarning className="alert-icon" title="Requiere tu confirmación" />
                )}
                <span className="card-col-payment-method" title={fullPaymentMethod}>{shortPaymentMethod}</span>
                <span className="card-col-date">{shortDate}</span>
                <span className={`card-col-amount ${amountClass}`}>{amountDisplay}</span>
                <button className="expand-button">{isExpanded ? '▲' : '▼'}</button>
            </div>

            {isExpanded && (
                <div className="transaction-card-details">
                    <p><strong>Descripción:</strong> {transaction.description || 'Sin descripción'}</p>
                    <p><strong>Método de Pago:</strong> {fullPaymentMethod}</p>
                    <p><strong>Fecha:</strong> {transactionDate ? transactionDate.toLocaleDateString() : ''}</p>
                    <p><strong>Agregado por:</strong> {initiator?.displayName} el {transactionDate ? transactionDate.toLocaleString() : ''}</p>

                    <div className="card-col-actions">
                        {(transaction.type === 'loan' || transaction.type === 'settle_up') && (
                            <>
                                {transaction.status === 'pending' && (transaction.borrower?.uid === currentUser.uid || transaction.receiver?.uid === currentUser.uid) ? (
                                    <>
                                        <button onClick={() => onAcceptTransaction(transaction.id)} className="button-icon accept"><MdCheckCircle /></button>
                                        <button onClick={() => onRejectTransaction(transaction.id)} className="button-icon reject"><MdCancel /></button>
                                    </>
                                ) : transaction.status === 'pending' ? (
                                    <span className="status-pending">Pendiente</span>
                                ) : transaction.status === 'completed' ? (
                                    <span className="status-completed">OK</span>
                                ) : (
                                    <span className="status-rejected">X</span>
                                )}
                                {transaction.status === 'rejected' && transaction.initiatedBy.uid === currentUser.uid && (
                                    <button onClick={() => onReRequestTransaction(transaction)} className="button-icon re-request"><MdRefresh /></button>
                                )}
                            </>
                        )}
                        {transaction.initiatedBy.uid === currentUser.uid && (
                            <>
                                <button onClick={() => onEditRequest(transaction)} className="button-icon"><MdEdit /></button>
                                <button onClick={() => onDeleteRequest(transaction.id)} className="button-icon"><MdDelete /></button>
                                {/* New Archive button */}
                                <button onClick={() => onArchiveTransaction(transaction.id)} className="button-icon"><MdArchive /></button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
};

export default TransactionCard;
