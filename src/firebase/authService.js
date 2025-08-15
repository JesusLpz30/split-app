import { signInWithPopup, GoogleAuthProvider, signOut, updateProfile, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { deleteUserData, addCategory } from './firestoreService'; // Importar addCategory
import { deleteProfileImage } from './storageService';

const provider = new GoogleAuthProvider();

const defaultCategories = [
    // Gastos
    { name: 'Vivienda', type: 'expense' },
    { name: 'Servicios (Luz, Agua, Gas)', type: 'expense' },
    { name: 'Alimentos (Supermercado)', type: 'expense' },
    { name: 'Comida Fuera', type: 'expense' },
    { name: 'Transporte', type: 'expense' },
    { name: 'Salud', type: 'expense' },
    { name: 'Educación', type: 'expense' },
    { name: 'Entretenimiento', type: 'expense' },
    { name: 'Vestimenta', type: 'expense' },
    { name: 'Cuidado Personal', type: 'expense' },
    { name: 'Deudas', type: 'expense' },
    { name: 'Ahorro/Inversión', type: 'expense' },
    { name: 'Otros Gastos', type: 'expense' },

    // Ingresos
    { name: 'Nómina/Salario', type: 'income' },
    { name: 'Trabajo Freelance', type: 'income' },
    { name: 'Inversiones', type: 'income' },
    { name: 'Regalos', type: 'income' },
    { name: 'Otros Ingresos', type: 'income' },
];

export const handleGoogleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL, // Guardar photoURL inicial
                groups: [],
                friends: [], // Inicializar el array de amigos
                
            });

            // Añadir categorías por defecto para el nuevo usuario
            for (const category of defaultCategories) {
                await addCategory(user.uid, category);
            }
        }
        return { success: true, user };
    } catch (error) {
        console.error('Error durante el inicio de sesión con Google:', error);
        return { success: false, error };
    }
};

export const handleSignOut = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Error durante el cierre de sesión:', error);
        return { success: false, error };
    }
};

/**
 * Actualiza la foto de perfil del usuario en Auth y Firestore.
 * @param {string} photoURL - La nueva URL de la foto de perfil.
 */
export const updateUserProfilePhoto = async (photoURL) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay un usuario autenticado.");

    try {
        // 1. Actualizar el perfil de Firebase Auth
        await updateProfile(user, { photoURL });

        // 2. Actualizar el documento del usuario en Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { photoURL });

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar la foto de perfil:", error);
        return { success: false, error };
    }
};

/**
 * Actualiza el nombre de visualización del usuario en Auth y Firestore.
 * @param {string} newDisplayName - El nuevo nombre de visualización.
 */
export const updateUserProfileDisplayName = async (newDisplayName) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay un usuario autenticado.");

    try {
        // 1. Actualizar el perfil de Firebase Auth
        await updateProfile(user, { displayName: newDisplayName });

        // 2. Actualizar el documento del usuario en Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { displayName: newDisplayName });

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar el nombre de visualización:", error);
        return { success: false, error };
    }
};

/**
 * Elimina la cuenta de un usuario y todos sus datos asociados.
 * Este es un proceso destructivo e irreversible.
 */
export const deleteUserAccount = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay un usuario autenticado para eliminar.");

    try {
        // El orden es importante: primero los datos, luego el usuario de Auth.
        
        // 1. Eliminar imagen de perfil de Storage (si existe)
        await deleteProfileImage(user.uid);

        // 2. Eliminar datos de Firestore (documento de usuario y membresías de grupos)
        await deleteUserData(user.uid);

        // 3. Eliminar el usuario de Firebase Authentication
        // Esta acción puede requerir re-autenticación reciente y fallará si no se cumple.
        await deleteUser(user);

        return { success: true };

    } catch (error) {
        console.error("Error al eliminar la cuenta del usuario:", error);
        // Si el error es por requerir re-autenticación, se puede manejar específicamente.
        if (error.code === 'auth/requires-recent-login') {
            console.error("La eliminación del usuario requiere una autenticación reciente. Se debe solicitar al usuario que vuelva a iniciar sesión.");
        }
        return { success: false, error };
    }
};