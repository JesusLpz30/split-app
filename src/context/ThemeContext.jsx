import React, { useState, useEffect } from 'react';
import { ThemeContext, useTheme, themes } from './themeUtils';

export const ThemeProvider = ({ children }) => {
    // El tema por defecto ahora es 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return themes.includes(savedTheme) ? savedTheme : 'dark';
    });

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // La función ahora cicla a través de los temas
    const cycleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const value = {
        theme,
        cycleTheme, // Exponer la nueva función
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};