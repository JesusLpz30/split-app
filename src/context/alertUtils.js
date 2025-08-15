import { createContext, useContext } from 'react';

export const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);
