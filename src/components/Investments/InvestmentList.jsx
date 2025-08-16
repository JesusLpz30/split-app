import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import InvestmentSummary from './InvestmentSummary';

const InvestmentList = () => {
    const { currentUser } = useAuth();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInvestments = async () => {
        if (!currentUser) return;
        setLoading(true);
        setError('');
        try {
            const fetchedInvestments = [];

            // Fetch investments from personal transactions
            const personalInvestmentsQuery = query(
                collection(db, `users/${currentUser.uid}/personalTransactions`),
                where('isInvestment', '==', true),
                orderBy('createdAt', 'desc')
            );
            const personalSnapshot = await getDocs(personalInvestmentsQuery);
            personalSnapshot.forEach(doc => {
                fetchedInvestments.push({ id: doc.id, ...doc.data() });
            });

            // Fetch investments from group transactions (where current user is involved)
            // This part might need more complex logic depending on how group transactions are structured
            // For simplicity, we'll just fetch all group transactions and filter by initiatedBy for now
            // A more robust solution would involve checking participants array
            const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid));
            const groupsSnapshot = await getDocs(groupsQuery);

            for (const groupDoc of groupsSnapshot.docs) {
                const groupInvestmentsQuery = query(
                    collection(db, `groups/${groupDoc.id}/transactions`),
                    where('isInvestment', '==', true),
                    where('initiatedBy.uid', '==', currentUser.uid), // Only show investments initiated by current user in groups
                    orderBy('createdAt', 'desc')
                );
                const groupSnapshot = await getDocs(groupInvestmentsQuery);
                groupSnapshot.forEach(doc => {
                    fetchedInvestments.push({ id: doc.id, ...doc.data(), groupId: groupDoc.id });
                });
            }

            setInvestments(fetchedInvestments);
        } catch (err) {
            console.error("Error fetching investments:", err);
            setError("Hubo un error al cargar tus inversiones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, [currentUser]);

    if (loading) {
        return <p>Cargando inversiones...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="investment-list-container">
            <h3>Mis Inversiones</h3>
            <InvestmentSummary investments={investments} />

            {investments.length === 0 ? (
                <p>No tienes inversiones registradas. ¡Registra una transacción y márcala como inversión!</p>
            ) : (
                <div className="investment-cards-grid">
                    {investments.map((inv) => (
                        <div key={inv.id} className="investment-card">
                            <h4>{inv.description}</h4>
                            <p>Plataforma: {inv.investmentPlatform}</p>
                            <p>Monto Inicial: ${inv.investmentInitialAmount.toFixed(2)}</p>
                            <p>Valor Actual: ${inv.investmentCurrentValue.toFixed(2)}</p>
                            <p>Ganancia/Pérdida: ${(inv.investmentCurrentValue - inv.investmentInitialAmount).toFixed(2)}</p>
                            {inv.groupId && <p>Grupo: {inv.groupId}</p>} {/* Display group ID if it's a group investment */}
                            {/* Add edit/delete functionality later if needed */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestmentList;
