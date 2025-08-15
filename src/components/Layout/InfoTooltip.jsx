import React, { useState } from 'react';
import Modal from './Modal'; // Asumiendo que tienes un componente Modal reutilizable

const InfoTooltip = ({ text, title = "Información" }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const words = text.split(' ').filter(word => word.length > 0);
    const isLongText = words.length > 20;

    const handleIconClick = () => {
        if (isLongText) {
            setIsModalOpen(true);
        } else {
            setShowTooltip(!showTooltip);
        }
    };

    return (
        <React.Fragment> {/* Use explicit React.Fragment */}
            <span 
                onClick={handleIconClick}
                onMouseEnter={() => !isLongText && setShowTooltip(true)}
                onMouseLeave={() => !isLongText && setShowTooltip(false)}
                style={{
                    cursor: 'pointer',
                    color: 'var(--text-secondary)', // Keep original color for now, can be overridden by parent
                    fontSize: '0.7em', // Smaller font size
                    fontWeight: 'bold',
                    border: '1px solid var(--text-secondary)',
                    borderRadius: '50%',
                    width: '16px', // Smaller width
                    height: '16px', // Smaller height
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    userSelect: 'none',
                    flexShrink: 0, // Prevent shrinking in flex container
                }}
                title={!isLongText ? text : "Haz clic para más información"}
            >
                i
            </span>

            {showTooltip && !isLongText && (
                <div 
                    style={{
                        position: 'absolute',
                        // Positioning will now be relative to the button, not the InfoTooltip's original parent span
                        // We might need to adjust this in App.css or TransactionCard.css if it doesn't look right
                        bottom: '120%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--bg-secondary)', // Use theme variable
                        color: 'var(--text-primary)', // Use theme variable
                        padding: '8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        boxShadow: '0 2px 5px var(--shadow-color)', // Use theme variable
                        border: '1px solid var(--border-primary)', // Use theme variable
                        fontSize: '0.8em',
                    }}
                >
                    {text}
                </div>
            )}

            {isLongText && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={title}>
                    <p>{text}</p>
                </Modal>
            )}
        </React.Fragment>
    );
};

export default InfoTooltip;