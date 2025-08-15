import { createContext, useContext } from 'react';

export const GroupContext = createContext();

export const useGroup = () => {
    return useContext(GroupContext);
};
