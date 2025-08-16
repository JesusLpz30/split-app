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
    const [suggestedPaymentMethods, setSuggestedPaymentMethods] = useState([]); // New state for suggested payment methods
    const [paymentMethod, setPaymentMethod] = useState(''); // New state for payment method
    const [isInvestment, setIsInvestment] = useState(false); // New state for investment flag
    const [investmentPlatform, setInvestmentPlatform] = useState(''); // New state for investment platform
    const [investmentInitialAmount, setInvestmentInitialAmount] = useState(''); // New state for initial investment amount
    const [investmentCurrentValue, setInvestmentCurrentValue] = useState(''); // New state for current investment value
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const fetchUniqueData = async () => {
            const uniqueDescriptions = new Set();
            const uniquePaymentMethods = new Set();

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
                    if (data.paymentMethod) {
                        uniquePaymentMethods.add(data.paymentMethod);
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
                if (data.paymentMethod) {
                    uniquePaymentMethods.add(data.paymentMethod);
                }
            });

            setSuggestedCategories(Array.from(uniqueDescriptions));
            setSuggestedPaymentMethods(Array.from(uniquePaymentMethods));
        };

        fetchUniqueData();
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
            // Set investment fields for existing transaction
            if (existingTransaction.isInvestment) {
                setIsInvestment(existingTransaction.isInvestment);
                setInvestmentPlatform(existingTransaction.investmentPlatform || '');
                setInvestmentInitialAmount(existingTransaction.investmentInitialAmount || '');
                setInvestmentCurrentValue(existingTransaction.investmentCurrentValue || '');
            }
        } else {
            setDescription('');
            setAmount('');
            setTransactionType('');
            setSelectedRecipient('');
            setCategoryInput('');
            setPaymentMethod(''); // Reset payment method for new transaction
            setIsInvestment(false);
            setInvestmentPlatform('');
            setInvestmentInitialAmount('');
            setInvestmentCurrentValue('');
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

        if (isInvestment) {
            if (!investmentPlatform.trim() || !investmentInitialAmount || parseFloat(investmentInitialAmount) <= 0) {
                setError("Por favor, completa la plataforma y el monto inicial de la inversión.");
                return;
            }
            transactionData.isInvestment = true;
            transactionData.investmentPlatform = investmentPlatform.trim();
            transactionData.investmentInitialAmount = parseFloat(investmentInitialAmount);
            transactionData.investmentCurrentValue = parseFloat(investmentCurrentValue) || parseFloat(investmentInitialAmount);
        }

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
                    paymentMethod: transactionData.paymentMethod,
                    isInvestment: transactionData.isInvestment,
                    investmentPlatform: transactionData.investmentPlatform,
                    investmentInitialAmount: transactionData.investmentInitialAmount,
                    investmentCurrentValue: transactionData.investmentCurrentValue,
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

            <div className="checkbox-container">
                <input
                    type="checkbox"
                    id="isInvestment"
                    checked={isInvestment}
                    onChange={(e) => setIsInvestment(e.target.checked)}
                />
                <label htmlFor="isInvestment">¿Es una inversión?</label>
            </div>

            {isInvestment && (
                <>
                    <label htmlFor="investmentPlatform">Plataforma de Inversión</label>
                    <input
                        id="investmentPlatform"
                        type="text"
                        value={investmentPlatform}
                        onChange={(e) => setInvestmentPlatform(e.target.value)}
                        placeholder="Ej: GBM, Bitso, CetesDirecto"
                        className="input-field"
                        required
                    />

                    <label htmlFor="investmentInitialAmount">Monto Inicial Invertido</label>
                    <input
                        id="investmentInitialAmount"
                        type="number"
                        value={investmentInitialAmount}
                        onChange={(e) => setInvestmentInitialAmount(e.target.value)}
                        placeholder="Monto inicial"
                        className="input-field"
                        required
                    />

                    <label htmlFor="investmentCurrentValue">Valor Actual (opcional)</label>
                    <input
                        id="investmentCurrentValue"
                        type="number"
                        value={investmentCurrentValue}
                        onChange={(e) => setInvestmentCurrentValue(e.target.value)}
                        placeholder="Valor actual de la inversión"
                        className="input-field"
                    />
                </>
            )}

            <label htmlFor="paymentMethod">Método de Pago</label>
            <input
                id="paymentMethod"
                type="text"
                list="payment-method-suggestions"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Escribe o selecciona un método"
                className="input-field"
                required
            />
            <datalist id="payment-method-suggestions">
                {suggestedPaymentMethods.map((method, index) => (
                    <option key={index} value={method} />
                ))}
            </datalist>

            <button type="submit" className="button primary">
                {existingTransaction ? 'Guardar Cambios' : 'Registrar Transacción'}
            </button>
        </form>
    );
};

export default TransactionForm;
