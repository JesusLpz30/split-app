import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="confirm-modal-content">
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="button secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="button danger" onClick={onConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
