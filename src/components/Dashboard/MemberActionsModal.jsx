import React from 'react';
import Modal from '../Layout/Modal'; // Assuming you have a generic Modal component
import { useAuth } from '../../context/authUtils';

const MemberActionsModal = ({ isOpen, onClose, member, onRemoveMember, onLeaveGroup }) => {
    const { currentUser } = useAuth();

    if (!member) return null;

    const isCurrentUser = member.uid === currentUser.uid;

    const handleAction = () => {
        if (isCurrentUser) {
            onLeaveGroup(member.uid);
        } else {
            onRemoveMember(member.uid);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={member.displayName}>
            <div className="member-actions-modal">
                {isCurrentUser ? (
                    <button className="button danger" onClick={handleAction}>
                        Salir del Grupo
                    </button>
                ) : (
                    <button className="button danger" onClick={handleAction}>
                        Sacar del Grupo
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default MemberActionsModal;