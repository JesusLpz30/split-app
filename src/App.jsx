import React, { useEffect } from 'react';
import { useTheme } from './context/themeUtils';
import AppRouter from './router';
import { startMatrixRain, stopMatrixRain } from './animations/matrixRain';
import './App.css';

function App() {
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

export default App;