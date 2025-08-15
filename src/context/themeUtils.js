import { createContext, useContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themes = ['dark', 'light', 'matrix']; // Definir los temas disponibles
