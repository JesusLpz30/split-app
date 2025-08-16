import { db } from './config';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    query,
    where,
    getDocs,
    writeBatch, getDoc, onSnapshot, orderBy
} from 'firebase/firestore';

// --- GROUP FUNCTIONS ---

export const createGroup = async (groupName, user, type = 'shared') => {
    const initialMembers = type === 'personal' ? [user.uid] : [user.uid];
    const initialMemberDetails = type === 'personal' ? 
        [{ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }] :
        [{ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }];

    const groupRef = await addDoc(collection(db, 'groups'), {
        name: groupName,
        type: type, // Añadir el tipo de grupo
        members: initialMembers,
        memberDetails: initialMemberDetails,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
    });

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        groups: arrayUnion(groupRef.id)
    });

    return { id: groupRef.id, name: groupName, members: initialMembers, memberDetails: initialMemberDetails };
};

export const updateGroup = async (groupId, newName) => {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
        name: newName
    });
};

export const deleteGroup = async (groupId, members) => {
    const batch = writeBatch(db);

    // 1. Remove the group ID from each member's user document
    members.forEach(userId => {
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { groups: arrayRemove(groupId) });
    });

    // 2. Delete all transactions in the subcollection
    const transactionsRef = collection(db, `groups/${groupId}/transactions`);
    const transactionsSnapshot = await getDocs(transactionsRef);
    transactionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 3. Delete the group document itself
    const groupRef = doc(db, 'groups', groupId);
    batch.delete(groupRef);

    // Commit all operations atomically
    await batch.commit();
};


export const addUserToGroup = async (email, groupId, currentGroup) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Usuario no encontrado con ese correo electrónico.");
    }

    const userToAdd = querySnapshot.docs[0].data();
    const userToAddId = querySnapshot.docs[0].id;

    if (currentGroup.members.includes(userToAddId)) {
        throw new Error("Este usuario ya es miembro del grupo.");
    }

    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
        members: arrayUnion(userToAddId),
        memberDetails: arrayUnion({
            uid: userToAddId,
            displayName: userToAdd.displayName || 'Sin Nombre',
            email: userToAdd.email,
            photoURL: userToAdd.photoURL || null
        })
    });

    const userRef = doc(db, 'users', userToAddId);
    await updateDoc(userRef, {
        groups: arrayUnion(groupId)
    });

    return userToAdd;
};

export const removeMemberFromGroup = async (memberToRemoveUid, groupId, currentGroup, currentUserUid) => {
    // 1. Permission Check: Only the group creator can remove members
    if (currentUserUid !== currentGroup.createdBy) {
        throw new Error("Solo el creador del grupo puede eliminar miembros.");
    }

    // 2. Prevent Creator Removal: The group creator cannot be removed from the group
    if (memberToRemoveUid === currentGroup.createdBy) {
        throw new Error("No puedes eliminar al creador del grupo.");
    }

    const groupRef = doc(db, 'groups', groupId);
    
    // Fetch the current group document to get the latest memberDetails
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) {
        throw new Error("Grupo no encontrado.");
    }
    const currentMemberDetails = groupDoc.data().memberDetails || [];

    // Find the member details object to remove
    const memberDetailsToRemove = currentMemberDetails.find(member => member.uid === memberToRemoveUid);

    if (!memberDetailsToRemove) {
        throw new Error("Miembro no encontrado en el grupo.");
    }

    // Use writeBatch for atomic updates
    const batch = writeBatch(db);

    // Remove the member UID from the 'members' array
    batch.update(groupRef, {
        members: arrayRemove(memberToRemoveUid)
    });

    // Remove the specific memberDetails object from the 'memberDetails' array
    batch.update(groupRef, {
        memberDetails: arrayRemove(memberDetailsToRemove)
    });

    // Remove the group ID from the user's groups array
    const userRef = doc(db, 'users', memberToRemoveUid);
    batch.update(userRef, {
        groups: arrayRemove(groupId)
    });

    await batch.commit();
};


// --- TRANSACTION FUNCTIONS ---

export const addTransaction = async (groupId, transactionData) => {
    const collectionRef = collection(db, `groups/${groupId}/transactions`);
    await addDoc(collectionRef, {
        ...transactionData,
        createdAt: serverTimestamp(),
    });
};

export const updateTransaction = async (groupId, transactionId, updatedData) => {
    const transactionRef = doc(db, `groups/${groupId}/transactions`, transactionId);
    await updateDoc(transactionRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
    });
};

export const deleteTransaction = async (groupId, transactionId) => {
    const transactionRef = doc(db, `groups/${groupId}/transactions`, transactionId);
    await deleteDoc(transactionRef);
};

export const acceptTransaction = async (groupId, transactionId) => {
    const transactionRef = doc(db, `groups/${groupId}/transactions`, transactionId);
    await updateDoc(transactionRef, {
        status: 'completed',
        acceptedAt: serverTimestamp()
    });
};

export const rejectTransaction = async (groupId, transactionId) => {
    const transactionRef = doc(db, `groups/${groupId}/transactions`, transactionId);
    await updateDoc(transactionRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp()
    });
};

export const archiveTransaction = async (groupId, transactionId) => {
    const transactionRef = doc(db, `groups/${groupId}/transactions`, transactionId);
    await updateDoc(transactionRef, {
        isArchived: true,
        archivedAt: serverTimestamp()
    });
};

export const unarchiveTransaction = async (groupId, transactionId) => {
    const transactionRef = doc(db, `groups/${groupId}/transactions`, transactionId);
    await updateDoc(transactionRef, {
        isArchived: false,
        archivedAt: null // Remove archivedAt when unarchiving
    });
};

// --- PERSONAL TRANSACTION FUNCTIONS ---

export const addPersonalTransaction = async (userId, transactionData) => {
    const collectionRef = collection(db, `users/${userId}/personalTransactions`);
    await addDoc(collectionRef, {
        ...transactionData,
        createdAt: serverTimestamp(),
    });
};

export const updatePersonalTransaction = async (userId, transactionId, updatedData) => {
    const transactionRef = doc(db, `users/${userId}/personalTransactions`, transactionId);
    await updateDoc(transactionRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
    });
};

export const deletePersonalTransaction = async (userId, transactionId) => {
    const transactionRef = doc(db, `users/${userId}/personalTransactions`, transactionId);
    await deleteDoc(transactionRef);
};

// --- FRIEND MANAGEMENT FUNCTIONS ---

/**
 * Envía una solicitud de amistad a otro usuario.
 * @param {string} senderId - UID del usuario que envía la solicitud.
 * @param {string} receiverEmail - Correo electrónico del usuario que recibe la solicitud.
 * @returns {Promise<object>} Objeto con éxito o error.
 */
export const sendFriendRequest = async (senderId, receiverEmail) => {
    try {
        // 1. Encontrar al receptor por email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', receiverEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Usuario no encontrado con ese correo electrónico.");
        }

        const receiverDoc = querySnapshot.docs[0];
        const receiverId = receiverDoc.id;

        if (senderId === receiverId) {
            throw new Error("No puedes enviarte una solicitud de amistad a ti mismo.");
        }

        // 2. Verificar si ya son amigos
        const senderDoc = await getDoc(doc(db, 'users', senderId));
        if (senderDoc.exists() && senderDoc.data().friends.includes(receiverId)) {
            throw new Error("Ya eres amigo de este usuario.");
        }

        // 3. Verificar si ya existe una solicitud pendiente o aceptada
        const existingRequestsQuery = query(
            collection(db, 'friendRequests'),
            where('senderId', 'in', [senderId, receiverId]),
            where('receiverId', 'in', [senderId, receiverId]),
            where('status', 'in', ['pending', 'accepted'])
        );
        const existingRequestsSnapshot = await getDocs(existingRequestsQuery);

        if (!existingRequestsSnapshot.empty) {
            throw new Error("Ya existe una solicitud de amistad pendiente o ya son amigos.");
        }

        // 4. Crear la solicitud de amistad
        await addDoc(collection(db, 'friendRequests'), {
            senderId,
            receiverId,
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        return { success: true, message: "Solicitud de amistad enviada." };
    } catch (error) {
        console.error("Error al enviar solicitud de amistad:", error);
        throw error;
    }
};

/**
 * Acepta una solicitud de amistad.
 * @param {string} requestId - ID del documento de la solicitud de amistad.
 * @param {string} userId - UID del usuario que acepta la solicitud (receiver).
 * @returns {Promise<object>} Objeto con éxito o error.
 */
export const acceptFriendRequest = async (requestId, userId) => {
    const batch = writeBatch(db);
    try {
        const requestRef = doc(db, 'friendRequests', requestId);
        const requestDoc = await getDoc(requestRef);

        if (!requestDoc.exists() || requestDoc.data().status !== 'pending') {
            throw new Error("Solicitud de amistad no encontrada o no está pendiente.");
        }

        const { senderId, receiverId } = requestDoc.data();

        if (userId !== receiverId) {
            throw new Error("No tienes permiso para aceptar esta solicitud.");
        }

        // 1. Actualizar el estado de la solicitud
        batch.update(requestRef, { status: 'accepted', acceptedAt: serverTimestamp() });

        // 2. Añadir amigos mutuamente
        const senderUserRef = doc(db, 'users', senderId);
        const receiverUserRef = doc(db, 'users', receiverId);

        batch.update(senderUserRef, { friends: arrayUnion(receiverId) });
        batch.update(receiverUserRef, { friends: arrayUnion(senderId) });

        await batch.commit();
        return { success: true, message: "Solicitud de amistad aceptada." };
    } catch (error) {
        console.error("Error al aceptar solicitud de amistad:", error);
        throw error;
    }
};

/**
 * Rechaza una solicitud de amistad.
 * @param {string} requestId - ID del documento de la solicitud de amistad.
 * @param {string} userId - UID del usuario que rechaza la solicitud (receiver).
 * @returns {Promise<object>} Objeto con éxito o error.
 */
export const rejectFriendRequest = async (requestId, userId) => {
    try {
        const requestRef = doc(db, 'friendRequests', requestId);
        const requestDoc = await getDoc(requestRef);

        if (!requestDoc.exists() || requestDoc.data().status !== 'pending') {
            throw new Error("Solicitud de amistad no encontrada o no está pendiente.");
        }

        if (userId !== requestDoc.data().receiverId) {
            throw new Error("No tienes permiso para rechazar esta solicitud.");
        }

        await updateDoc(requestRef, { status: 'rejected', rejectedAt: serverTimestamp() });
        return { success: true, message: "Solicitud de amistad rechazada." };
    } catch (error) {
        console.error("Error al rechazar solicitud de amistad:", error);
        throw error;
    }
};

/**
 * Obtiene las solicitudes de amistad pendientes para un usuario.
 * @param {string} userId - UID del usuario.
 * @returns {Promise<Array<object>>} Array de solicitudes de amistad.
 */
export const getPendingFriendRequests = async (userId) => {
    try {
        const q = query(
            collection(db, 'friendRequests'),
            where('receiverId', '==', userId),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener solicitudes de amistad pendientes:", error);
        throw error;
    }
};

/**
 * Obtiene la lista de amigos de un usuario con sus detalles.
 * @param {string} userId - UID del usuario.
 * @returns {Promise<Array<object>>} Array de objetos de amigos.
 */
export const getFriends = async (userId) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return [];
        }

        const friendUids = userDoc.data().friends || [];
        if (friendUids.length === 0) {
            return [];
        }

        // Obtener detalles de los amigos
        const friendDetailsPromises = friendUids.map(friendUid => getDoc(doc(db, 'users', friendUid)));
        const friendDocs = await Promise.all(friendDetailsPromises);

        return friendDocs.map(doc => ({
            uid: doc.id,
            displayName: doc.data().displayName,
            photoURL: doc.data().photoURL,
            email: doc.data().email,
        }));
    } catch (error) {
        console.error("Error al obtener amigos:", error);
        throw error;
    }
};

/**
 * Elimina a un amigo de la lista de amigos de ambos usuarios.
 * @param {string} userId - UID del usuario que inicia la eliminación.
 * @param {string} friendId - UID del amigo a eliminar.
 * @returns {Promise<object>} Objeto con éxito o error.
 */
export const removeFriend = async (userId, friendId) => {
    const batch = writeBatch(db);
    try {
        const userRef = doc(db, 'users', userId);
        const friendRef = doc(db, 'users', friendId);

        batch.update(userRef, { friends: arrayRemove(friendId) });
        batch.update(friendRef, { friends: arrayRemove(userId) });

        await batch.commit();
        return { success: true, message: "Amigo eliminado." };
    } catch (error) {
        console.error("Error al eliminar amigo:", error);
        throw error;
    }
};

// --- CATEGORY MANAGEMENT FUNCTIONS ---

/**
 * Añade una nueva categoría para un usuario.
 * @param {string} userId - UID del usuario.
 * @param {object} categoryData - Datos de la categoría (name, type).
 * @returns {Promise<void>}
 */
export const addCategory = async (userId, categoryData) => {
    try {
        await addDoc(collection(db, `users/${userId}/categories`), {
            ...categoryData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error al añadir categoría:", error);
        throw error;
    }
};

/**
 * Obtiene las categorías de un usuario en tiempo real.
 * @param {string} userId - UID del usuario.
 * @param {function} callback - Función a llamar con las categorías.
 * @returns {function} Función para desuscribirse del listener.
 */
export const getCategories = (userId, callback) => {
    const q = query(collection(db, `users/${userId}/categories`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(categories);
    }, (error) => {
        console.error("Error al obtener categorías:", error);
    });
    return unsubscribe;
};

/**
 * Actualiza una categoría existente.
 * @param {string} userId - UID del usuario.
 * @param {string} categoryId - ID de la categoría a actualizar.
 * @param {object} updatedData - Datos a actualizar.
 * @returns {Promise<void>}
 */
export const updateCategory = async (userId, categoryId, updatedData) => {
    try {
        const categoryRef = doc(db, `users/${userId}/categories`, categoryId);
        await updateDoc(categoryRef, updatedData);
    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        throw error;
    }
};

/**
 * Elimina una categoría.
 * @param {string} userId - UID del usuario.
 * @param {string} categoryId - ID de la categoría a eliminar.
 * @returns {Promise<void>}
 */
export const deleteCategory = async (userId, categoryId) => {
    try {
        const categoryRef = doc(db, `users/${userId}/categories`, categoryId);
        await deleteDoc(categoryRef);
    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        throw error;
    }
};

// --- USER DATA FUNCTIONS ---

/**
 * Obtiene los datos de un usuario por su UID.
 * @param {string} uid - UID del usuario.
 * @returns {Promise<object|null>} Datos del usuario o null si no se encuentra.
 */
export const getUserByUid = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener usuario por UID:", error);
        throw error;
    }
};



// --- USER DATA DELETION ---

/**
 * Elimina todos los datos de un usuario de Firestore.
 * Esto incluye removerlo de grupos, borrar su documento de usuario y limpiar transacciones relacionadas.
 * @param {string} uid - El ID del usuario a eliminar.
 */
export const deleteUserData = async (uid) => {
    const batch = writeBatch(db);

    // 1. Encontrar todos los grupos donde el usuario es miembro
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('members', 'array-contains', uid));
    const groupsSnapshot = await getDocs(q);

    for (const groupDoc of groupsSnapshot.docs) {
        const groupData = groupDoc.data();
        // Filtrar los detalles del miembro para remover al usuario actual
        const newMemberDetails = groupData.memberDetails.filter(member => member.uid !== uid);
        
        batch.update(groupDoc.ref, {
            members: arrayRemove(uid),
            memberDetails: newMemberDetails
        });

        // 2. Eliminar transacciones donde el usuario es el iniciador, prestamista, prestatario, pagador o receptor
        const transactionsRef = collection(db, `groups/${groupDoc.id}/transactions`);
        const userInitiatedTransactionsQuery = query(transactionsRef, where('initiatedBy.uid', '==', uid));
        const userLenderTransactionsQuery = query(transactionsRef, where('lender.uid', '==', uid));
        const userBorrowerTransactionsQuery = query(transactionsRef, where('borrower.uid', '==', uid));
        const userPayerTransactionsQuery = query(transactionsRef, where('payer.uid', '==', uid));
        const userReceiverTransactionsQuery = query(transactionsRef, where('receiver.uid', '==', uid));

        const [initiatedSnap, lenderSnap, borrowerSnap, payerSnap, receiverSnap] = await Promise.all([
            getDocs(userInitiatedTransactionsQuery),
            getDocs(userLenderTransactionsQuery),
            getDocs(userBorrowerTransactionsQuery),
            getDocs(userPayerTransactionsQuery),
            getDocs(userReceiverTransactionsQuery)
        ]);

        const transactionsToDelete = new Set();
        initiatedSnap.forEach(doc => transactionsToDelete.add(doc.id));
        lenderSnap.forEach(doc => transactionsToDelete.add(doc.id));
        borrowerSnap.forEach(doc => transactionsToDelete.add(doc.id));
        payerSnap.forEach(doc => transactionsToDelete.add(doc.id));
        receiverSnap.forEach(doc => transactionsToDelete.add(doc.id));

        transactionsToDelete.forEach(transactionId => {
            batch.delete(doc(db, `groups/${groupDoc.id}/transactions`, transactionId));
        });
    }

    // 3. Borrar el documento del usuario
    const userRef = doc(db, 'users', uid);
    batch.delete(userRef);

    // 4. Eliminar transacciones personales del usuario
    const personalTransactionsRef = collection(db, `users/${uid}/personalTransactions`);
    const personalTransactionsSnapshot = await getDocs(personalTransactionsRef);
    personalTransactionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 5. Eliminar solicitudes de amistad donde el usuario es emisor o receptor
    const friendRequestsRef = collection(db, 'friendRequests');
    const sentRequestsQuery = query(friendRequestsRef, where('senderId', '==', uid));
    const receivedRequestsQuery = query(friendRequestsRef, where('receiverId', '==', uid));

    const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentRequestsQuery),
        getDocs(receivedRequestsQuery)
    ]);

    sentSnap.forEach(doc => batch.delete(doc.ref));
    receivedSnap.forEach(doc => batch.delete(doc.ref));

    // 6. Eliminar al usuario de las listas de amigos de sus amigos
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        const friends = userDoc.data().friends || [];
        for (const friendId of friends) {
            const friendRef = doc(db, 'users', friendId);
            batch.update(friendRef, { friends: arrayRemove(uid) });
        }
    }

    // 7. Eliminar categorías del usuario
    const categoriesRef = collection(db, `users/${uid}/categories`);
    const categoriesSnapshot = await getDocs(categoriesRef);
    categoriesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 8. Ejecutar todas las operaciones en un lote
    await batch.commit();
};

// --- SAVINGS GOAL FUNCTIONS ---

export const addSavingsGoal = async (goalData) => {
    try {
        const docRef = await addDoc(collection(db, 'savingsGoals'), {
            ...goalData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding savings goal:", error);
        throw error;
    }
};

export const getSavingsGoals = async (userId) => {
    try {
        const q = query(
            collection(db, 'savingsGoals'),
            where('userId', '==', userId),
            orderBy('createdAt', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting savings goals:", error);
        throw error;
    }
};

export const updateSavingsGoal = async (goalId, newData) => {
    try {
        const goalRef = doc(db, 'savingsGoals', goalId);
        await updateDoc(goalRef, {
            ...newData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating savings goal:", error);
        throw error;
    }
};

export const deleteSavingsGoal = async (goalId) => {
    try {
        const goalRef = doc(db, 'savingsGoals', goalId);
        await deleteDoc(goalRef);
    } catch (error) {
        console.error("Error deleting savings goal:", error);
        throw error;
    }
};