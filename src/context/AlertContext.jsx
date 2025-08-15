import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertContext, useAlert } from './alertUtils';

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((message, type = 'info', duration = 3000) => {
        setAlert({ message, type });
        if (duration) {
            setTimeout(() => setAlert(null), duration);
        }
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(null);
    }, []);

    const alertComponent = alert && createPortal(
        <div 
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '15px 25px',
                borderRadius: '8px',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'white',
                fontWeight: 'bold',
                transition: 'opacity 0.3s ease-in-out',
                opacity: 1,
                backgroundColor: 
                    alert.type === 'success' ? 'var(--success-color)' : 
                    alert.type === 'error' ? 'var(--error-color)' : 
                    'var(--primary-color)',
            }}
            onClick={hideAlert} // Hide on click
        >
            {alert.type === 'success' && '✅'}
            {alert.type === 'error' && '❌'}
            {alert.type === 'info' && 'ℹ️'}
            {alert.message}
        </div>,
        document.body // Render into document.body
    );

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alertComponent}
        </AlertContext.Provider>
    );
};
