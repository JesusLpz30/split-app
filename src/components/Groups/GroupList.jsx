import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authUtils';
import { useGroup } from '../../context/groupUtils';
import { db } from '../../firebase/config';
import { doc, onSnapshot, collection, query, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { deleteGroup } from '../../firebase/firestoreService';
import { useAlert } from '../../context/alertUtils'; // Importar useAlert
import { MdEdit, MdDelete } from 'react-icons/md'; // Import new icons

import GroupForm from './GroupForm';
import GroupEditForm from './GroupEditForm';
import Modal from '../Layout/Modal';
import ConfirmModal from '../Layout/ConfirmModal';

const GroupList = () => {
    const { currentUser } = useAuth();
    const { selectGroup } = useGroup();
    const navigate = useNavigate();
    const { showAlert } = useAlert(); // Obtener showAlert
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);

    // Nuevos estados para el balance general
    const [totalBalance, setTotalBalance] = useState(0);
    const [owesMe, setOwesMe] = useState([]); // Array of { name: 'Person Name', amount: 10.00 }
    const [iOwe, setIOwe] = useState([]);   // Array of { name: 'Person Name', amount: 10.00 }

    // Función para calcular el balance de un usuario dentro de un grupo
    const calculateUserBalanceInGroup = (transactions, memberDetails, currentUserId, groupType) => {
        const balances = {};
        memberDetails.forEach(member => {
            balances[member.uid] = { ...member, balance: 0 };
        });

        transactions.forEach(transaction => {
            switch (transaction.type) {
                case 'expense':
                    if (groupType === 'personal') {
                        balances[currentUserId].balance -= transaction.amount;
                    } else {
                        balances[transaction.paidBy.uid].balance += transaction.amount;
                        const amountPerParticipant = transaction.amount / transaction.participants.length;
                        transaction.participants.forEach(participant => {
                            balances[participant.uid].balance -= amountPerParticipant;
                        });
                    }
                    break;
                case 'loan':
                    balances[transaction.lender.uid].balance += transaction.amount;
                    balances[transaction.borrower.uid].balance -= transaction.amount;
                    break;
                case 'income':
                    if (groupType === 'personal') {
                        balances[currentUserId].balance += transaction.amount;
                    } else {
                        balances[transaction.receivedBy.uid].balance -= transaction.amount;
                        const incomePerParticipant = transaction.amount / transaction.participants.length;
                        transaction.participants.forEach(participant => {
                            balances[participant.uid].balance += incomePerParticipant;
                        });
                    }
                    break;
                case 'settle_up':
                    balances[transaction.payer.uid].balance += transaction.amount;
                    balances[transaction.receiver.uid].balance -= transaction.amount;
                    break;
                default:
                    break;
            }
        });

        return balances[currentUserId]?.balance || 0;
    };

    useEffect(() => {
        if (!currentUser) return;

        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, async (userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const groupIds = userData.groups || [];

                if (groupIds.length > 0) {
                    const groupPromises = groupIds.map(async (id) => {
                        const groupDoc = await getDoc(doc(db, 'groups', id));
                        
                        if (!groupDoc.exists()) {
                            return null;
                        }
                        const groupData = { id: groupDoc.id, ...groupDoc.data() };

                        const transactionsRef = collection(db, `groups/${groupData.id}/transactions`);
                        const qTransactions = query(transactionsRef, orderBy('createdAt', 'desc'));
                        const transactionsSnapshot = await getDocs(qTransactions);
                        const transactionsData = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                        // Calculate user balance for this specific group
                        const userBalance = calculateUserBalanceInGroup(transactionsData, groupData.memberDetails, currentUser.uid, groupData.type);

                        return { ...groupData, transactions: transactionsData, currentUserBalance: userBalance };
                    });
                    const groupsData = await Promise.all(groupPromises);
                    const validGroups = groupsData.filter(g => g !== null);

                    // Apply the filter for 'personal' type groups here for overall balance calculation
                    const nonPersonalGroups = validGroups.filter(g => g.type !== 'personal');

                    setUserGroups(validGroups); // Display all groups, including personal ones

                    // Calculate overall balance and individual debts from nonPersonalGroups
                    let overallBalance = 0;
                    const allTransactions = [];
                    const allMemberDetails = new Map(); // To store all unique member details across all groups

                    nonPersonalGroups.forEach(group => { // Use nonPersonalGroups here
                        overallBalance += group.currentUserBalance;
                        allTransactions.push(...group.transactions);
                        group.memberDetails.forEach(member => allMemberDetails.set(member.uid, member));
                    });

                    setTotalBalance(overallBalance);

                    // Calculate who owes whom across all groups
                    const individualBalances = {}; // { uid: balance }

                    allTransactions.forEach(transaction => {
                        // For simplicity, let's assume all transactions involve the current user
                        // This logic needs to be more robust for complex scenarios
                        // For now, we'll focus on expense, loan, income, settle_up
                        switch (transaction.type) {
                            case 'expense':
                                // If it's a personal expense, it doesn't involve other participants in terms of debt
                                // The balance is already handled by overallBalance
                                if (transaction.participants && transaction.participants.length > 0) { // Check if participants exist
                                    // Existing group expense logic
                                    if (transaction.paidBy.uid === currentUser.uid) {
                                        const amountPerParticipant = transaction.amount / transaction.participants.length;
                                        transaction.participants.forEach(p => {
                                            if (p.uid !== currentUser.uid) {
                                                individualBalances[p.uid] = (individualBalances[p.uid] || 0) - amountPerParticipant;
                                            }
                                        });
                                    } else { // If someone else paid, current user might owe them
                                        if (transaction.participants.some(p => p.uid === currentUser.uid)) {
                                            const amountPerParticipant = transaction.amount / transaction.participants.length;
                                            individualBalances[transaction.paidBy.uid] = (individualBalances[transaction.paidBy.uid] || 0) + amountPerParticipant;
                                        }
                                    }
                                }
                                break;
                            case 'loan':
                                if (transaction.lender.uid === currentUser.uid) { // Current user lent money
                                    individualBalances[transaction.borrower.uid] = (individualBalances[transaction.borrower.uid] || 0) - transaction.amount;
                                } else if (transaction.borrower.uid === currentUser.uid) { // Current user borrowed money
                                    individualBalances[transaction.lender.uid] = (individualBalances[transaction.lender.uid] || 0) + transaction.amount;
                                }
                                break;
                            case 'income':
                                // If it's a personal income, it doesn't involve other participants in terms of debt
                                // The balance is already handled by overallBalance
                                if (transaction.participants && transaction.participants.length > 0) { // Check if participants exist
                                    // Existing group income logic
                                    if (transaction.receivedBy.uid === currentUser.uid) {
                                        const incomePerParticipant = transaction.amount / transaction.participants.length;
                                        transaction.participants.forEach(p => {
                                            if (p.uid !== currentUser.uid) {
                                                individualBalances[p.uid] = (individualBalances[p.uid] || 0) + incomePerParticipant;
                                            }
                                        });
                                    } else { // If someone else received income, current user might be owed
                                        if (transaction.participants.some(p => p.uid === currentUser.uid)) {
                                            const incomePerParticipant = transaction.amount / transaction.participants.length;
                                            individualBalances[transaction.receivedBy.uid] = (individualBalances[transaction.receivedBy.uid] || 0) - incomePerParticipant;
                                        }
                                    }
                                }
                                break;
                            case 'settle_up':
                                if (transaction.payer.uid === currentUser.uid) { // Current user paid someone
                                    individualBalances[transaction.receiver.uid] = (individualBalances[transaction.receiver.uid] || 0) + transaction.amount;
                                } else if (transaction.receiver.uid === currentUser.uid) { // Current user received payment
                                    individualBalances[transaction.payer.uid] = (individualBalances[transaction.payer.uid] || 0) - transaction.amount;
                                }
                                break;
                            default:
                                break;
                        }
                    });

                    const newOwesMe = [];
                    const newIOwe = [];

                    for (const uid in individualBalances) {
                        if (uid === currentUser.uid) continue; // Skip current user's own balance

                        const balance = individualBalances[uid];
                        const member = allMemberDetails.get(uid);

                        if (member) {
                            if (balance < 0) { // They owe me
                                newOwesMe.push({ name: member.displayName, amount: Math.abs(balance) });
                            } else if (balance > 0) { // I owe them
                                newIOwe.push({ name: member.displayName, amount: Math.abs(balance) });
                            }
                        }
                    }

                    setOwesMe(newOwesMe);
                    setIOwe(newIOwe);

                } else {
                    setUserGroups([]);
                    setTotalBalance(0);
                    setOwesMe([]);
                    setIOwe([]);
                }
            }
            setLoading(false);
        });

        return () => unsubscribeUser();
    }, [currentUser]);

    

    const handleOpenEditModal = (group) => {
        setEditingGroup(group);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingGroup(null);
    };

    const handleDeleteRequest = (group) => {
        setGroupToDelete(group);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!groupToDelete) return;
        try {
            await deleteGroup(groupToDelete.id, groupToDelete.members);
            showAlert("Grupo eliminado con éxito.", "success");
        } catch (error) {
            console.error("Error al eliminar el grupo:", error);
            showAlert("Hubo un error al eliminar el grupo.", "error");
        } finally {
            setIsConfirmModalOpen(false);
            setGroupToDelete(null);
        }
    };

    const handleSelectGroup = (group) => {
        selectGroup(group);
        navigate(`/group/${group.id}`);
    };

    if (loading) return <p>Cargando tus grupos...</p>;

    return (
        <div className="container">
            <div className="balance-summary-section">
                <h2>Balance General</h2>
                <p className={`total-balance ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
                    Tu balance total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalance)}
                </p>

                {owesMe.length > 0 && (
                    <div className="owes-me">
                        <h3>Te deben:</h3>
                        <ul>
                            {owesMe.map((debt, index) => (
                                <li key={index}>{debt.name}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(debt.amount)}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {iOwe.length > 0 && (
                    <div className="i-owe">
                        <h3>Debes:</h3>
                        <ul>
                            {iOwe.map((debt, index) => (
                                <li key={index}>{debt.name}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(debt.amount)}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {owesMe.length === 0 && iOwe.length === 0 && totalBalance === 0 && (
                    <p>No tienes deudas ni te deben dinero en este momento.</p>
                )}

                
            </div>

            <h1>Mis Grupos</h1>

            <ul className="list">
                {userGroups.map(group => (
                    <li key={group.id} className="list-item-group">
                        <span onClick={() => handleSelectGroup(group)} className="group-name">
                            {group.name}&nbsp;
                            {group.currentUserBalance !== undefined && (
                                                                <span className={`group-balance ${group.currentUserBalance >= 0 ? 'positive' : 'negative'}`}>
                                    {group.type === 'personal' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(group.currentUserBalance) : (group.currentUserBalance >= 0 ? 'Te deben: ' : 'Debes: ' ) + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(group.currentUserBalance))}
                                </span>
                            )}
                        </span>
                        <div className="group-actions">
                            <button onClick={() => handleOpenEditModal(group)} className="button-icon"><MdEdit /></button>
                            <button onClick={() => handleDeleteRequest(group)} className="button-icon"><MdDelete /></button>
                        </div>
                    </li>
                ))}
                {userGroups.length === 0 && <p>No perteneces a ningún grupo. ¡Crea uno para empezar!</p>}
            </ul>

            <GroupForm />

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Grupo">
                <GroupEditForm group={editingGroup} onFormSubmit={handleCloseEditModal} />
            </Modal>

            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el grupo "${groupToDelete?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default GroupList;