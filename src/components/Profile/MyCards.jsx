import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/authUtils';
import { useAlert } from '../../context/alertUtils';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { banks, getCardTypeByNumber } from '../../firebase/banks';
import Modal from '../Layout/Modal';
// import ConfirmModal from '../Layout/ConfirmModal'; // No longer needed
import { FaEdit, FaShareAlt, FaTrash } from 'react-icons/fa'; // Import icons
import './MyCards.css';

// --- Componente de Tarjeta de Crédito (Visual) ---
const CreditCard = ({ card, onEdit, onShare, onDelete }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const formatCardNumber = (number) => {
        return number.replace(/(\d{4})/g, '$1 ').trim();
    };
    const cardBrand = getCardTypeByNumber(card.cardNumber);

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="card-container-3d" onClick={handleCardClick}>
            <div className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                <div className={`card-item-display card-front ${cardBrand.toLowerCase()}`}>
                    <div className="card-header">
                        <div className="card-bank">{card.issuingBank}</div>
                        <div className="card-brand">{cardBrand}</div>
                    </div>
                    <div className="card-body">
                        <div className="card-number">{formatCardNumber(card.cardNumber)}</div>
                    </div>
                    <div className="card-footer">
                        <div className="card-holder">{card.cardholderName}</div>
                        <div className="card-expiry">Exp: {card.expirationDate}</div>
                    </div>
                    <div className="card-type-indicator">{card.cardType}</div>
                </div>
                <div className={`card-item-display card-back ${cardBrand.toLowerCase()}`}>
                    <div className="magnetic-stripe"></div>
                    <div className="card-back-actions">
                        <FaEdit className="card-action-icon" onClick={(e) => { e.stopPropagation(); onEdit(card); }} />
                        <FaShareAlt className="card-action-icon" onClick={(e) => { e.stopPropagation(); onShare(card); }} />
                        <FaTrash className="card-action-icon" onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Componente de Dropdown con Búsqueda ---
const SearchableDropdown = ({ options, selected, onSelect, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const filteredOptions = options.filter(option => 
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSelect = (option) => {
        onSelect(option.name);
        setSearchTerm('');
        setIsOpen(false);
    };
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);
    return (
        <div className="searchable-dropdown" ref={wrapperRef}>
            <input 
                type="text"
                className="input-field"
                placeholder={placeholder}
                value={selected || searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onSelect(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
            />
            {isOpen && (
                <ul className="dropdown-list">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <li key={option.name} onClick={() => handleSelect(option)}>{option.name}</li>
                        ))
                    ) : (
                        <li className="no-results">No se encontraron bancos</li>
                    )}
                </ul>
            )}
        </div>
    );
};

// --- Componente Principal de Mis Tarjetas ---
const MyCards = () => {
    const { currentUser } = useAuth();
    const { showAlert } = useAlert();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false); // Renamed for clarity
    const [cardData, setCardData] = useState({
        cardholderName: '',
        issuingBank: '',
        expirationDate: '',
        cardNumber: '',
        cardType: 'Crédito',
    });

    const fetchCards = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'cards'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            const userCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCards(userCards);
        } catch (error) {
            console.error("Error fetching cards:", error);
            showAlert('Error al cargar las tarjetas.', 'error');
        }
        setLoading(false);
    }, [currentUser, showAlert]);

    useEffect(() => {
        if (currentUser) {
            fetchCards();
        }
    }, [currentUser, fetchCards]);

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        }
        if (name === 'expirationDate') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length > 2) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            }
        }
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleBankSelect = (bankName) => {
        setCardData(prev => ({ ...prev, issuingBank: bankName }));
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        const finalCardNumber = cardData.cardNumber.replace(/\s/g, '');
        if (!cardData.cardholderName || !cardData.issuingBank || !cardData.expirationDate || !finalCardNumber) {
            showAlert('Por favor, completa todos los campos.', 'warning');
            return;
        }
        if (finalCardNumber.length !== 16) {
            showAlert('El número de tarjeta debe tener 16 dígitos.', 'warning');
            return;
        }
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardData.expirationDate)) {
            showAlert('La fecha de expiración debe estar en formato MM/AA.', 'warning');
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, 'cards'), { ...cardData, cardNumber: finalCardNumber, userId: currentUser.uid });
            showAlert('Tarjeta agregada con éxito.', 'success');
            setCardData({ cardholderName: '', issuingBank: '', expirationDate: '', cardNumber: '', cardType: 'Crédito' });
            setIsAddCardModalOpen(false); // Cerrar modal al agregar
            fetchCards();
        } catch (error) {
            console.error("Error adding card:", error);
            showAlert('Error al agregar la tarjeta.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'cards', cardId));
            showAlert('Tarjeta eliminada con éxito.', 'success');
            fetchCards();
        } catch (error) {
            console.error("Error deleting card:", error);
            showAlert('Error al eliminar la tarjeta.', 'error');
        }
        setLoading(false);
    };

    const handleEditCard = (card) => {
        showAlert(`Editar tarjeta: ${card.cardholderName} - ${card.cardNumber.slice(-4)}`, 'info');
        // Implement actual edit logic here (e.g., open a modal with card data)
    };

    const handleShareCard = (card) => {
        showAlert(`Compartir tarjeta: ${card.cardholderName} - ${card.cardNumber.slice(-4)}`, 'info');
        // Implement actual share logic here
    };

    return (
        <div className="profile-section">
            <h3>Mis Tarjetas</h3>
            <div className="cards-list">
                {loading && <p>Cargando tarjetas...</p>}
                {cards.map(card => (
                    <CreditCard 
                        key={card.id} 
                        card={card} 
                        onEdit={handleEditCard}
                        onShare={handleShareCard}
                        onDelete={handleDeleteCard}
                    />
                ))}
            </div>
            <div className="add-card-button-container">
                <button onClick={() => setIsAddCardModalOpen(true)} className="button primary">
                    Agregar Tarjeta
                </button>
            </div>

            <Modal isOpen={isAddCardModalOpen} onClose={() => setIsAddCardModalOpen(false)} title="Agregar Nueva Tarjeta">
                <form onSubmit={handleAddCard} className="card-form-modal">
                    <input
                        type="text"
                        name="cardholderName"
                        value={cardData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="Nombre del titular"
                        className="input-field"
                    />
                    <SearchableDropdown 
                        options={banks}
                        selected={cardData.issuingBank}
                        onSelect={handleBankSelect}
                        placeholder="Banco emisor"
                    />
                    <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="Número de tarjeta"
                        maxLength="19"
                        className="input-field"
                    />
                    <input
                        type="text"
                        name="expirationDate"
                        value={cardData.expirationDate}
                        onChange={handleInputChange}
                        placeholder="Fecha de expiración (MM/AA)"
                        maxLength="5"
                        className="input-field"
                    />
                    <select 
                        name="cardType" 
                        value={cardData.cardType} 
                        onChange={handleInputChange} 
                        className="input-field">
                        <option value="Crédito">Crédito</option>
                        <option value="Débito">Débito</option>
                    </select>
                    <button type="submit" className="button primary" disabled={loading}>
                        {loading ? 'Agregando...' : 'Confirmar'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default MyCards;
