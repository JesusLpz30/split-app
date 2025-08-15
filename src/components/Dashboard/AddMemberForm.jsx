import React, { useState } from 'react';
import { addUserToGroup } from '../../firebase/firestoreService';
import { useGroup } from '../../context/groupUtils';

const AddMemberForm = () => {
    const [email, setEmail] = useState('');
    const { currentGroup } = useGroup();
    const [errorMessage, setErrorMessage] = useState(''); // Estado para mensajes de error

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Limpiar errores previos
        if (!email.trim() || !currentGroup) return;

        try {
            await addUserToGroup(email.trim(), currentGroup.id, currentGroup);
            setEmail('');
        } catch (error) {
            console.error("Error al agregar miembro:", error);
            setErrorMessage(error.message); // Mostrar error en el UI
        }
    };

    return (
        <div className="form-container-inline">
            <form onSubmit={handleAddSubmit}>
                <input
                    type="email"
                    id="memberEmail"
                    name="memberEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo del nuevo miembro"
                    className="input-field"
                />
                <button type="submit" className="button primary">Agregar Miembro</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default AddMemberForm;
