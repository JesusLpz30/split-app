import React, { useState } from 'react';
import { createGroup } from '../../firebase/firestoreService';
import { useAuth } from '../../context/authUtils';
import Modal from '../Layout/Modal'; // Importar Modal

const GroupForm = () => {
    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState('shared'); // Nuevo estado para el tipo de grupo, por defecto 'shared'
    const { currentUser } = useAuth();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Estado para el modal de éxito
    const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || !currentUser) return;

        try {
            await createGroup(groupName, currentUser, groupType); // Pasar groupType a createGroup
            setGroupName('');
            setGroupType('shared'); // Resetear a shared después de crear
            setSuccessMessage(`Grupo "${groupName}" creado con éxito!`);
            setIsSuccessModalOpen(true); // Abrir modal de éxito
            // Ya no es necesario window.location.reload(); el listener en GroupList lo actualizará
        } catch (error) {
            console.error("Error al crear el grupo:", error);
            // Aquí podríamos usar un modal de error en lugar de un alert
            alert("Hubo un error al crear el grupo.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h4>Crear un Nuevo Grupo</h4>
            <input
                id="groupName"
                name="groupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ej: Gastos Daniela y Victor"
                className="input-field"
            />
            <div className="group-type-selection" style={{ marginBottom: '15px' }}>
                <label style={{ marginRight: '15px' }}>
                    <input
                        id="groupTypeShared"
                        name="groupType"
                        type="radio"
                        value="shared"
                        checked={groupType === 'shared'}
                        onChange={() => setGroupType('shared')}
                        style={{ marginRight: '5px' }}
                    />
                    Compartido
                </label>
                <label>
                    <input
                        id="groupTypePersonal"
                        name="groupType"
                        type="radio"
                        value="personal"
                        checked={groupType === 'personal'}
                        onChange={() => setGroupType('personal')}
                        style={{ marginRight: '5px' }}
                    />
                    Personal
                </label>
            </div>
            <button type="submit" className="button primary">Crear Grupo</button>

            {/* Modal de éxito */}
            <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Grupo Creado">
                <p>{successMessage}</p>
                <button className="button primary" onClick={() => setIsSuccessModalOpen(false)}>Cerrar</button>
            </Modal>
        </form>
    );
};

export default GroupForm;
