import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

// Función para traducir errores de Firebase a mensajes amigables
const translateAuthError = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/user-not-found': 'Este correo electrónico no está registrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/operation-not-allowed': 'Operación no permitida. Contacta con soporte',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/invalid-credential': 'Correo o contraseña incorrectos',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/invalid-password': 'Contraseña inválida',
    'auth/missing-password': 'Por favor ingresa una contraseña',
    'auth/missing-email': 'Por favor ingresa un correo electrónico',
  };

  return errorMessages[errorCode] || 'Ocurrió un error. Intenta de nuevo';
};

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        // Lanzar un error con mensaje amigable
        throw new Error(translateAuthError(error.code));
    }
};

export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        // Lanzar un error con mensaje amigable
        throw new Error(translateAuthError(error.code));
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error('Error al cerrar sesión. Intenta de nuevo');
    }
};

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};
