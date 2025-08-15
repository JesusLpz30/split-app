import React, { useState, useEffect } from 'react';
import { updateGroup } from '../../firebase/firestoreService';

const GroupEditForm = ({ group, onFormSubmit }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (group) {
            setName(group.name);
        }
    }, [group]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !group) return;

        try {
            await updateGroup(group.id, name);
            onFormSubmit(); // Cierra el modal
        } catch (error) {
            console.error("Error al actualizar el grupo:", error);
            alert("Hubo un error al actualizar el grupo.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
            />
            <button type="submit" className="button primary">Guardar Cambios</button>
        </form>
    );
};

export default GroupEditForm;