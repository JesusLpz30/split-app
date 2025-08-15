import React, { useState, useCallback } from 'react';
import { GroupContext, useGroup } from './groupUtils';

export const GroupProvider = ({ children }) => {
    const [currentGroup, setCurrentGroup] = useState(null);

    const selectGroup = useCallback((group) => {
        setCurrentGroup(group);
    }, []); // Dependencia vacía para que la función no cambie

    const clearGroup = useCallback(() => {
        setCurrentGroup(null);
    }, []); // Dependencia vacía para que la función no cambie

    const value = {
        currentGroup,
        selectGroup,
        clearGroup
    };

    return (
        <GroupContext.Provider value={value}>
            {children}
        </GroupContext.Provider>
    );
};