import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { addSavingsGoal, updateSavingsGoal } from '../../firebase/firestoreService';

const SavingsForm = ({ onFormSubmit, existingGoal }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingGoal) {
            setName(existingGoal.name);
            setTargetAmount(existingGoal.targetAmount);
            setCurrentAmount(existingGoal.currentAmount);
            setDescription(existingGoal.description);
        } else {
            setName('');
            setTargetAmount('');
            setCurrentAmount('');
            setDescription('');
        }
    }, [existingGoal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
            setError("Por favor, completa el nombre y el monto objetivo.");
            return;
        }

        const goalData = {
            name: name.trim(),
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0, // Default to 0 if not set
            description: description.trim(),
            userId: currentUser.uid,
        };

        try {
            if (existingGoal) {
                await updateSavingsGoal(existingGoal.id, goalData);
            } else {
                await addSavingsGoal(goalData);
            }
            if (onFormSubmit) onFormSubmit();
        } catch (err) {
            console.error("Error al guardar el objetivo de ahorro:", err);
            setError("Hubo un error al guardar el objetivo. Inténtalo de nuevo.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h4>{existingGoal ? 'Editar Objetivo de Ahorro' : 'Nuevo Objetivo de Ahorro'}</h4>
            {error && <p className="error-message">{error}</p>}

            <label htmlFor="goalName">Nombre del Objetivo</label>
            <input
                id="goalName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Viaje a Japón, Coche nuevo"
                className="input-field"
                required
            />

            <label htmlFor="targetAmount">Monto Objetivo</label>
            <input
                id="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Monto deseado"
                className="input-field"
                required
            />

            <label htmlFor="currentAmount">Monto Actual (opcional)</label>
            <input
                id="currentAmount"
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="Monto actual ahorrado"
                className="input-field"
            />

            <label htmlFor="goalDescription">Descripción (opcional)</label>
            <textarea
                id="goalDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles adicionales sobre tu objetivo"
                className="input-field"
                rows="3"
            ></textarea>

            <button type="submit" className="button primary">
                {existingGoal ? 'Guardar Cambios' : 'Crear Objetivo'}
            </button>
        </form>
    );
};

export default SavingsForm;
