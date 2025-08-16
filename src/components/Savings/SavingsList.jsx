import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { getSavingsGoals, deleteSavingsGoal } from '../../firebase/firestoreService';
import Modal from '../Layout/Modal';
import SavingsForm from './SavingsForm';

const SavingsList = () => {
    const { currentUser } = useAuth();
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const fetchSavingsGoals = async () => {
        if (!currentUser) return;
        setLoading(true);
        setError('');
        try {
            const goals = await getSavingsGoals(currentUser.uid);
            setSavingsGoals(goals);
        } catch (err) {
            console.error("Error fetching savings goals:", err);
            setError("Hubo un error al cargar tus objetivos de ahorro.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavingsGoals();
    }, [currentUser]);

    const handleEdit = (goal) => {
        setSelectedGoal(goal);
        setIsModalOpen(true);
    };

    const handleDelete = async (goalId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este objetivo de ahorro?")) {
            try {
                await deleteSavingsGoal(goalId);
                fetchSavingsGoals(); // Refresh the list
            } catch (err) {
                console.error("Error deleting savings goal:", err);
                setError("Hubo un error al eliminar el objetivo.");
            }d
        }
    };

    const handleFormSubmit = () => {
        setIsModalOpen(false);
        setSelectedGoal(null);
        fetchSavingsGoals(); // Refresh the list after form submission
    };

    if (loading) {
        return <p>Cargando objetivos de ahorro...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="savings-list-container">
            <h3>Mis Objetivos de Ahorro</h3>
            <button onClick={() => { setSelectedGoal(null); setIsModalOpen(true); }} className="button primary">
                Añadir Nuevo Objetivo
            </button>

            {savingsGoals.length === 0 ? (
                <p>No tienes objetivos de ahorro registrados. ¡Añade uno para empezar!</p>
            ) : (
                <div className="savings-goals-grid">
                    {savingsGoals.map((goal) => (
                        <div key={goal.id} className="savings-goal-card">
                            <h4>{goal.name}</h4>
                            <p>Objetivo: ${goal.targetAmount.toFixed(2)}</p>
                            <p>Actual: ${goal.currentAmount.toFixed(2)}</p>
                            <p>Falta: ${(goal.targetAmount - goal.currentAmount).toFixed(2)}</p>
                            {goal.description && <p className="description">{goal.description}</p>}
                            <div className="actions">
                                <button onClick={() => handleEdit(goal)} className="button secondary">Editar</button>
                                <button onClick={() => handleDelete(goal.id)} className="button danger">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <SavingsForm onFormSubmit={handleFormSubmit} existingGoal={selectedGoal} />
            </Modal>
        </div>
    );
};

export default SavingsList;
