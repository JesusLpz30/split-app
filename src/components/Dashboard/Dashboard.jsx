import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/authUtils';
import { useGroup } from '../../context/groupUtils';
import { useAlert } from '../../context/alertUtils';
import { MdPersonAdd } from 'react-icons/md'; // Import MdPersonAdd icon

import AddMemberForm from './AddMemberForm';
import TransactionList from './TransactionList';
import Balance from './Balance';
import Modal from '../Layout/Modal';
import TransactionForm from './TransactionForm';
import InfoTooltip from '../Layout/InfoTooltip';
import ExportReportFilterModal from './ExportReportFilterModal'; // Import the new modal

const Dashboard = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { currentGroup, selectGroup } = useGroup();
    const { showAlert } = useAlert();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); // New state for AddMemberModal
    const [isExportFilterModalOpen, setIsExportFilterModalOpen] = useState(false); // New state for ExportFilterModal

    const calculateBalances = () => {
        if (!currentGroup || !currentGroup.memberDetails) return [];

        if (currentGroup.type === 'personal') {
            let personalBalance = 0;
            transactions.forEach(transaction => {
                switch (transaction.type) {
                    case 'expense':
                        personalBalance -= transaction.amount;
                        break;
                    case 'income':
                        personalBalance += transaction.amount;
                        break;
                    case 'loan':
                        if (transaction.lender.uid === currentUser.uid) {
                            personalBalance += transaction.amount;
                        } else if (transaction.borrower.uid === currentUser.uid) {
                            personalBalance -= transaction.amount;
                        }
                        break;
                    case 'settle_up':
                        if (transaction.payer.uid === currentUser.uid) {
                            personalBalance -= transaction.amount;
                        } else if (transaction.receiver.uid === currentUser.uid) {
                            personalBalance += transaction.amount;
                        }
                        break;
                    default:
                        break;
                }
            });
            return [{ uid: currentUser.uid, displayName: currentUser.displayName, balance: personalBalance }];
        } else {
            const balances = {};
            currentGroup.memberDetails.forEach(member => {
                balances[member.uid] = { ...member, balance: 0 };
            });

            transactions.forEach(transaction => {
                switch (transaction.type) {
                    case 'expense': {
                        balances[transaction.paidBy.uid].balance += transaction.amount;
                        const amountPerParticipant = transaction.amount / transaction.participants.length;
                        transaction.participants.forEach(participant => {
                            balances[participant.uid].balance -= amountPerParticipant;
                        });
                        break;
                    }
                    case 'loan':
                        balances[transaction.lender.uid].balance += transaction.amount;
                        balances[transaction.borrower.uid].balance -= transaction.amount;
                        break;
                    case 'income': {
                        balances[transaction.receivedBy.uid].balance -= transaction.amount;
                        const incomePerParticipant = transaction.amount / transaction.participants.length;
                        transaction.participants.forEach(participant => {
                            balances[participant.uid].balance += incomePerParticipant;
                        });
                        break;
                    }
                    case 'settle_up':
                        balances[transaction.payer.uid].balance += transaction.amount;
                        balances[transaction.receiver.uid].balance -= transaction.amount;
                        break;
                    default:
                        break;
                }
            });
            return Object.values(balances);
        }
    };

    const finalBalances = calculateBalances();

    const handleRemoveMember = async (memberId) => {
        if (!currentGroup || !currentGroup.id) return;

        try {
            const groupRef = doc(db, 'groups', currentGroup.id);
            await updateDoc(groupRef, {
                memberDetails: arrayRemove(currentGroup.memberDetails.find(m => m.uid === memberId))
            });
            showAlert('Miembro eliminado del grupo con éxito.', 'success');
        } catch (error) {
            console.error("Error al eliminar miembro:", error);
            showAlert('Error al eliminar miembro.', 'error');
        }
    };

    const handleLeaveGroup = async (memberId) => {
        if (!currentGroup || !currentGroup.id) return;

        try {
            const groupRef = doc(db, 'groups', currentGroup.id);
            const userRef = doc(db, 'users', memberId);

            // Remove member from group's memberDetails
            await updateDoc(groupRef, {
                memberDetails: arrayRemove(currentGroup.memberDetails.find(m => m.uid === memberId))
            });

            // Remove group from user's groups array
            await updateDoc(userRef, {
                groups: arrayRemove(currentGroup.id)
            });

            // Check if group is empty after member leaves and delete if so
            const updatedGroupDoc = await getDoc(groupRef);
            if (updatedGroupDoc.exists() && updatedGroupDoc.data().memberDetails.length === 0) {
                await deleteDoc(groupRef);
                showAlert('Has salido del grupo y el grupo ha sido eliminado por estar vacío.', 'success');
            } else {
                showAlert('Has salido del grupo con éxito.', 'success');
            }

            navigate('/groups'); // Redirect to groups list or dashboard
        } catch (error) {
            console.error("Error al salir del grupo:", error);
            showAlert('Error al salir del grupo.', 'error');
        }
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        const groupRef = doc(db, 'groups', groupId);
        const unsubscribeGroup = onSnapshot(groupRef, (doc) => {
            if (doc.exists()) {
                const newGroupData = { id: doc.id, ...doc.data() };
                selectGroup(newGroupData);
            } else {
                setError("Este grupo no existe o fue eliminado.");
            }
            setLoading(false);
        });

        const transactionsRef = collection(db, `groups/${groupId}/transactions`);
        const qTransactions = query(transactionsRef, orderBy('createdAt', 'desc'));
        const unsubscribeTransactions = onSnapshot(qTransactions, (querySnapshot) => {
            const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionsData);
        });

        return () => {
            unsubscribeGroup();
            unsubscribeTransactions();
        };
    }, [groupId, selectGroup]);

    const handleCloseTransactionModal = () => {
        setIsTransactionModalOpen(false);
        setEditingTransaction(null); // Clear editing transaction when modal closes
    };

    const handleEditRequest = (transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleExportTransactions = (filters) => {
        let filteredTransactions = transactions;

        // Apply filters
        if (filters.startDate) {
            filteredTransactions = filteredTransactions.filter(t => t.createdAt?.toDate() >= filters.startDate);
        }
        if (filters.endDate) {
            filteredTransactions = filteredTransactions.filter(t => t.createdAt?.toDate() <= filters.endDate);
        }
        if (filters.transactionTypes && filters.transactionTypes.length > 0) {
            filteredTransactions = filteredTransactions.filter(t => filters.transactionTypes.includes(t.type));
        }
        if (filters.participants && filters.participants.length > 0) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.participants?.some(p => filters.participants.includes(p.uid)) ||
                (t.paidBy && filters.participants.includes(t.paidBy.uid)) ||
                (t.lender && filters.participants.includes(t.lender.uid)) ||
                (t.borrower && filters.participants.includes(t.borrower.uid)) ||
                (t.receivedBy && filters.participants.includes(t.receivedBy.uid)) ||
                (t.payer && filters.participants.includes(t.payer.uid)) ||
                (t.receiver && filters.participants.includes(t.receiver.uid))
            );
        }
        if (filters.initiatedBy && filters.initiatedBy.length > 0) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.initiatedBy && filters.initiatedBy.includes(t.initiatedBy.uid)
            );
        }
        if (filters.paymentMethods && filters.paymentMethods.length > 0) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.paymentMethod && filters.paymentMethods.includes(t.paymentMethod)
            );
        }

        const headers = ["ID", "Tipo", "Descripcion", "Monto", "IniciadoPor", "Fecha", "Estado", "PagadoPor/PrestadoPor", "RecibidoPor/Prestatario", "Participantes/Receptor"];
        
        const rows = filteredTransactions.map(t => {
            let primaryActor = '';
            let secondaryActor = '';
            let participants = '';

            switch (t.type) {
                case 'expense':
                    primaryActor = t.paidBy?.displayName || '';
                    participants = t.participants?.map(p => p.displayName).join(', ') || '';
                    break;
                case 'loan':
                    primaryActor = t.lender?.displayName || '';
                    secondaryActor = t.borrower?.displayName || '';
                    break;
                case 'income':
                    primaryActor = t.receivedBy?.displayName || '';
                    participants = t.participants?.map(p => p.displayName).join(', ') || '';
                    break;
                case 'settle_up':
                    primaryActor = t.payer?.displayName || '';
                    secondaryActor = t.receiver?.displayName || '';
                    break;
                default:
                    break;
            }

            return [
                t.id,
                t.type,
                t.description,
                t.amount,
                t.initiatedBy?.displayName || '',
                t.createdAt?.toDate().toLocaleDateString() || '',
                t.status || 'N/A',
                primaryActor,
                secondaryActor,
                participants
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `transacciones_${currentGroup.name || 'grupo'}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showAlert('Reporte exportado con éxito!', 'success');
        }
    };

    if (loading) {
        return <p>Cargando panel del grupo...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!currentGroup || currentGroup.id !== groupId) {
        return <p>Cargando datos del grupo...</p>;
    };

    const isPersonalGroup = currentGroup.type === 'personal';

    return (
        <div className="container">
            <h2>{currentGroup.name}</h2>
            <div className="dashboard-content-grid">
                <div className="dashboard-summary-actions">
                    <Balance
                        finalBalances={isPersonalGroup ? finalBalances : finalBalances}
                        members={isPersonalGroup ? [currentUser] : currentGroup.memberDetails}
                        currentUser={currentUser}
                        isPersonalGroup={isPersonalGroup}
                        onRemoveMember={handleRemoveMember}
                        onLeaveGroup={handleLeaveGroup}
                        setIsAddMemberModalOpen={setIsAddMemberModalOpen} // Pass the prop
                    />
                    <div className="dashboard-actions-group">
                        <button className="button primary" onClick={() => setIsTransactionModalOpen(true)}>
                            Registrar Nueva Transacción
                        </button>
                        <button className="button secondary" onClick={() => setIsExportFilterModalOpen(true)}>
                            Exportar Reporte (CSV)
                        </button>
                        <button className="button secondary" onClick={() => navigate(`/group/${groupId}/archived`)}>
                            Ver Archivados
                        </button>
                    </div>
                </div>
                <div className="dashboard-transaction-list">
                    <TransactionList transactions={transactions} onEditRequest={handleEditRequest} />
                </div>
            </div>

            <Modal isOpen={isTransactionModalOpen} onClose={handleCloseTransactionModal} title="Registrar Nueva Transacción">
                <TransactionForm existingTransaction={editingTransaction} onFormSubmit={handleCloseTransactionModal} isPersonalGroup={isPersonalGroup} />
            </Modal>

            <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Añadir Nuevo Miembro">
                <AddMemberForm />
            </Modal>

            <ExportReportFilterModal
                isOpen={isExportFilterModalOpen}
                onClose={() => setIsExportFilterModalOpen(false)}
                onGenerateReport={handleExportTransactions}
                members={currentGroup.memberDetails} // Pass members for participant filter
            />
        </div>
    );
};

export default Dashboard;
