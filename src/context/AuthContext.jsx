import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
import { auth, db } from '../firebase/config'; // Import db
import Loader from '../components/Layout/Loader';
import { AuthContext, useAuth } from './authUtils';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => { // Make async
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // Prioritize user.photoURL from Firebase Auth, then userData.photoURL from Firestore
                    const finalPhotoURL = user.photoURL || userData.photoURL;
                    setCurrentUser({ ...user, ...userData, photoURL: finalPhotoURL }); // Merge auth and firestore data
                } else {
                    setCurrentUser(user); // User exists in auth but not firestore (shouldn't happen with current flow)
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        setCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};