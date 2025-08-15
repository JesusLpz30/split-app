import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { useGroup } from '../../context/groupUtils';
import { addTransaction, updateTransaction } from '../../firebase/firestoreService';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const TransactionForm = ({ onFormSubmit, existingTransaction, isPersonalGroup }) => {
    const { currentUser } = useAuth();
    const { currentGroup } = useGroup();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [suggestedCategories, setSuggestedCategories] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(''); // New state for payment method
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const fetchUniqueDescriptions = async () => {
            const uniqueDescriptions = new Set();

            const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid));
            const groupsSnapshot = await getDocs(groupsQuery);

            for (const groupDoc of groupsSnapshot.docs) {
                const transactionsRef = collection(db, `groups/${groupDoc.id}/transactions`);
                const transactionsSnapshot = await getDocs(transactionsRef);
                transactionsSnapshot.forEach(transactionDoc => {
                    const data = transactionDoc.data();
                    if (data.description) {
                        uniqueDescriptions.add(data.description);
                    }
                });
            }

            const personalTransactionsRef = collection(db, `users/${currentUser.uid}/personalTransactions`);
            const personalTransactionsSnapshot = await getDocs(personalTransactionsRef);
            personalTransactionsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.description) {
                    uniqueDescriptions.add(data.description);
                }
            });

            setSuggestedCategories(Array.from(uniqueDescriptions));
        };

        fetchUniqueDescriptions();
    }, [currentUser]);

    useEffect(() => {
        if (existingTransaction) {
            setDescription(existingTransaction.description);
            setAmount(existingTransaction.amount);
            setTransactionType(existingTransaction.type);
            if (existingTransaction.type === 'loan') {
                setSelectedRecipient(existingTransaction.borrower.uid);
            } else if (existingTransaction.type === 'settle_up') {
                setSelectedRecipient(existingTransaction.receiver.uid);
            }
            if (existingTransaction.categoryName) {
                setCategoryInput(existingTransaction.categoryName);
            }
            // Set payment method for existing transaction
            if (existingTransaction.paymentMethod) {
                setPaymentMethod(existingTransaction.paymentMethod);
            }
        } else {
            setDescription('');
            setAmount('');
            setTransactionType('');
            setSelectedRecipient('');
            setCategoryInput('');
            setPaymentMethod(''); // Reset payment method for new transaction
        }
    }, [existingTransaction]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Modificación: la descripción es opcional si hay una categoría
        if ((!description.trim() && !categoryInput.trim()) || !amount || parseFloat(amount) <= 0 || !transactionType) {
            setError("Por favor, completa la descripción o la categoría, el monto y el tipo de transacción.");
            return;
        }

        let transactionData = {
            description: description.trim(), // Asegurarse de que sea un string vacío si no hay input
            amount: parseFloat(amount),
            type: transactionType,
            initiatedBy: { uid: currentUser.uid, displayName: currentUser.displayName },
            groupId: currentGroup.id,
            categoryName: categoryInput.trim() || description.trim(),
            paymentMethod: paymentMethod, // Add payment method
        };

        if (!existingTransaction) {
            switch (transactionType) {
                case 'expense':
                    transactionData.paidBy = { uid: currentUser.uid, displayName: currentUser.displayName };
                    transactionData.participants = isPersonalGroup ? 
                        [{ uid: currentUser.uid, displayName: currentUser.displayName }] : 
                        currentGroup.memberDetails.map(member => ({
                            uid: member.uid,
                            displayName: member.displayName
                        }));
                    break;
                case 'loan': {
                    if (isPersonalGroup) {
                        setError("Préstamos no son aplicables en grupos personales de esta manera.");
                        return;
                    }
                    if (!selectedRecipient) {
                        setError("Por favor, selecciona a quién le prestas.");
                        return;
                    }
                    const loanRecipient = currentGroup.memberDetails.find(m => m.uid === selectedRecipient);
                    if (!loanRecipient) {
                        setError("Destinatario no válido.");
                        return;
                    }
                    transactionData.lender = { uid: currentUser.uid, displayName: currentUser.displayName };
                    transactionData.borrower = { uid: loanRecipient.uid, displayName: loanRecipient.displayName };
                    transactionData.status = 'pending';
                    break;
                }
                case 'income':
                    transactionData.receivedBy = { uid: currentUser.uid, displayName: currentUser.displayName };
                    transactionData.participants = isPersonalGroup ? 
                        [{ uid: currentUser.uid, displayName: currentUser.displayName }] : 
                        currentGroup.memberDetails.map(member => ({
                            uid: member.uid,
                            displayName: member.displayName
                        }));
                    break;
                case 'settle_up': {
                    if (isPersonalGroup) {
                        setError("Saldar deudas no es aplicable en grupos personales de esta manera.");
                        return;
                    }
                    if (!selectedRecipient) {
                        setError("Por favor, selecciona a quién le pagas.");
                        return;
                    }
                    const settleUpRecipient = currentGroup.memberDetails.find(m => m.uid === selectedRecipient);
                    if (!settleUpRecipient) {
                        setError("Destinatario no válido.");
                        return;
                    }
                    transactionData.payer = { uid: currentUser.uid, displayName: currentUser.displayName };
                    transactionData.receiver = { uid: settleUpRecipient.uid, displayName: settleUpRecipient.displayName };
                    transactionData.status = 'pending';
                    break;
                }
                default:
                    setError("Tipo de transacción no válido.");
                    return;
            }
        }

        try {
            if (existingTransaction) {
                await updateTransaction(currentGroup.id, existingTransaction.id, {
                    description: transactionData.description,
                    amount: transactionData.amount,
                    categoryName: transactionData.categoryName,
                    paymentMethod: transactionData.paymentMethod, // Update payment method
                });
            } else {
                await addTransaction(currentGroup.id, transactionData);
            }
            if (onFormSubmit) onFormSubmit();
        } catch (err) {
            console.error("Error al guardar la transacción:", err);
            setError("Hubo un error al guardar la transacción. Inténtalo de nuevo.");
        }
    };

    const otherGroupMembers = currentGroup.memberDetails.filter(
        (member) => member.uid !== currentUser.uid
    );

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h4>{existingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}</h4>
            {error && <p className="error-message">{error}</p>}

            <label htmlFor="transactionType">Tipo de Transacción</label>
            <select
                id="transactionType"
                className="input-field"
                value={transactionType}
                onChange={(e) => {
                    setTransactionType(e.target.value);
                    setCategoryInput('');
                }}
                required
                disabled={!!existingTransaction}
            >
                <option value="">Selecciona un tipo</option>
                <option value="expense">Gasto (Lo pagué yo)</option>
                <option value="income">Ingreso (Es para mí)</option>
                {!isPersonalGroup && (
                    <>
                        <option value="loan">Préstamo (Le presté a...)</option>
                        <option value="settle_up">Saldar Deuda (Le pagué a...)</option>
                    </>
                )}
            </select>

            {(transactionType === 'expense' || transactionType === 'income') && (
                <>
                    <label htmlFor="categoryInput">Categoría</label>
                    <input
                        id="categoryInput"
                        type="text"
                        list="category-suggestions"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        placeholder="Escribe o selecciona una categoría"
                        className="input-field"
                        required={false} // Ya no es requerido aquí
                        disabled={!!existingTransaction}
                    />
                    <datalist id="category-suggestions">
                        {suggestedCategories.map((cat, index) => (
                            <option key={index} value={cat} />
                        ))}
                    </datalist>
                </>
            )}

            <label htmlFor="description">Descripción</label>
            <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la transacción"
                className="input-field"
                required={false} // Ya no es requerido aquí
            />

            <label htmlFor="amount">Monto</label>
            <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Monto"
                className="input-field"
                required
            />

            {/* Ocultar selección de recipiente para grupos personales */}
            {(!isPersonalGroup && (transactionType === 'loan' || transactionType === 'settle_up')) && (
                <>
                    <label htmlFor="recipientSelect">
                        {transactionType === 'loan' ? '¿A quién le prestas?' : '¿A quién le pagas?'}
                    </label>
                    <select
                        id="recipientSelect"
                        className="input-field"
                        value={selectedRecipient}
                        onChange={(e) => setSelectedRecipient(e.target.value)}
                        required
                        disabled={!!existingTransaction}
                    >
                        <option value="">Selecciona un miembro</option>
                        {otherGroupMembers.map((member) => (
                            <option key={member.uid} value={member.uid}>
                                {member.displayName}
                            </option>
                        ))}
                    </select>
                </>
            )}

            <label htmlFor="paymentMethod">Método de Pago</label>
            <select
                id="paymentMethod"
                className="input-field"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
            >
                <option value="">Selecciona un método</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
            </select>

            <button type="submit" className="button primary">
                {existingTransaction ? 'Guardar Cambios' : 'Registrar Transacción'}
            </button>
        </form>
    );
};

export default TransactionForm;
