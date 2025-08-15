import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Sube la imagen de perfil de un usuario a Firebase Storage.
 * @param {string} uid - El ID del usuario.
 * @param {File} file - El archivo de imagen a subir.
 * @returns {Promise<string>} La URL de descarga de la imagen subida.
 */
export const uploadProfileImage = async (uid, file) => {
    const filePath = `profile_images/${uid}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};

/**
 * Elimina la imagen de perfil de un usuario de Firebase Storage.
 * @param {string} uid - El ID del usuario.
 */
export const deleteProfileImage = async (uid) => {
    const filePath = `profile_images/${uid}`;
    const storageRef = ref(storage, filePath);

    try {
        // Intenta eliminar el objeto
        await deleteObject(storageRef);
    } catch (error) {
        // Si el archivo no existe, Firebase lanza un error 'storage/object-not-found'.
        // Podemos ignorar este error de forma segura si no nos importa que el archivo no existiera.
        if (error.code === 'storage/object-not-found') {
            console.log("La imagen de perfil no existía, no se necesita eliminar.");
        } else {
            // Si es otro error, sí lo lanzamos
            throw error;
        }
    }
};
