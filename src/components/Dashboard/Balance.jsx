import React, { useState } from 'react';
import BalanceExplanationModal from './BalanceExplanationModal';
import InfoTooltip from '../Layout/InfoTooltip';
import MemberActionsModal from './MemberActionsModal'; // Import the new modal
import { useAuth } from '../../context/authUtils'; // Import useAuth to get currentUser
import { MdPersonAdd } from 'react-icons/md'; // Import MdPersonAdd icon
import { useTheme } from '../../context/themeUtils'; // Import useTheme

const Balance = ({ finalBalances, currentUser, isPersonalGroup, onRemoveMember, onLeaveGroup, setIsAddMemberModalOpen }) => {
    const { currentUser: loggedInUser } = useAuth(); // Get the currently logged-in user
    const { theme } = useTheme(); // Get the current theme
    const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
    const [isMemberActionsModalOpen, setIsMemberActionsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // For positioning the modal

    const personalBalance = isPersonalGroup ? finalBalances[0]?.balance || 0 : 0;

    const handleMemberClick = (member, event) => {
        setSelectedMember(member);
        setAnchorEl(event.currentTarget); // Set the clicked element as anchor
        setIsMemberActionsModalOpen(true);
    };

    const handleCloseMemberActionsModal = () => {
        setIsMemberActionsModalOpen(false);
        setSelectedMember(null);
        setAnchorEl(null);
    };

    // Determine icon color based on theme
    const getIconColor = () => {
        switch (theme) {
            case 'dark':
                return '#f8f9fa'; // Light color for dark theme
            case 'light':
                return '#343a40'; // Dark color for light theme
            case 'matrix':
                return '#00ff41'; // Green for matrix theme
            default:
                return '#007bff'; // Default blue
        }
    };

    return (
        <div className="balance-container" style={{ position: 'relative' }}>
            <div className="balance-header">
                {isPersonalGroup ? (
                    <h4>Tu Saldo Personal <InfoTooltip text="Este es tu saldo total en este grupo personal." /></h4>
                ) : (
                    <h4>Saldos del Grupo <InfoTooltip text="Un saldo positivo significa que otros miembros del grupo te deben dinero. Un saldo negativo significa que tú debes dinero a otros miembros del grupo." /></h4>
                )}
            </div>
            {isPersonalGroup ? (
                <ul className="list">
                    <li className={`list-item-balance ${personalBalance > 0 ? 'positive' : 'negative'}`}>
                        <span
                            onClick={(e) => handleMemberClick(currentUser, e)}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {currentUser.displayName} (Tú)
                        </span>
                        <span className="balance-amount">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(personalBalance)}
                        </span>
                    </li>
                </ul>
            ) : (
                <ul className="list">
                    {finalBalances.map(item => (
                        <li key={item.uid} className={`list-item-balance ${item.balance > 0 ? 'positive' : 'negative'}`}>
                            <span
                                onClick={(e) => handleMemberClick(item, e)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {item.displayName} {item.uid === loggedInUser.uid ? '(Tú)' : ''}
                            </span>
                            <span className="balance-amount">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.balance)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {!isPersonalGroup && (
                <button
                    className="button-icon"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    title="Añadir Miembro"
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getIconColor(), // Use dynamic color
                    }}
                >
                    <MdPersonAdd size={18} />
                </button>
            )}

            <BalanceExplanationModal
                isOpen={isExplanationModalOpen}
                onClose={() => setIsExplanationModalOpen(false)}
            />

            <MemberActionsModal
                isOpen={isMemberActionsModalOpen}
                onClose={handleCloseMemberActionsModal}
                member={selectedMember}
                anchorEl={anchorEl}
                onRemoveMember={onRemoveMember}
                onLeaveGroup={onLeaveGroup}
            />
        </div>
    );
};

export default Balance;
