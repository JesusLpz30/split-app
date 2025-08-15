import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/themeUtils';
import { AlertProvider } from './context/AlertContext';
import AppRouter from './router';
import { startMatrixRain, stopMatrixRain } from './animations/matrixRain';
import './App.css';

function AppContent() {
    const { theme } = useTheme();

    useEffect(() => {
        if (theme === 'matrix') {
            startMatrixRain();
        } else {
            stopMatrixRain();
        }

        // Cleanup function to stop animation when component unmounts or theme changes
        return () => {
            stopMatrixRain();
        };
    }, [theme]);

    return (
        <>
            <AppRouter />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <GroupProvider>
                <ThemeProvider>
                    <AlertProvider>
                        <AppContent />
                    </AlertProvider>
                </ThemeProvider>
            </GroupProvider>
        </AuthProvider>
    );
}

export default App;