import React from 'react';
import Modal from '../Layout/Modal';

const BalanceExplanationModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="¿Qué significan los saldos?">
            <p>Los saldos del grupo indican quién debe a quién para equilibrar las cuentas.</p>
            <ul>
                <li>
                    <strong>Saldo Positivo (verde):</strong> Significa que esa persona ha pagado más de lo que le corresponde o le deben dinero. Los demás le deben a ella.
                </li>
                <li>
                    <strong>Saldo Negativo (rojo):</strong> Significa que esa persona ha pagado menos de lo que le corresponde o debe dinero a los demás. Ella debe a los demás.
                </li>
            </ul>
            <p>El objetivo es que todos los saldos lleguen a cero.</p>
            <button className="button primary" onClick={onClose}>Entendido</button>
        </Modal>
    );
};

export default BalanceExplanationModal;
