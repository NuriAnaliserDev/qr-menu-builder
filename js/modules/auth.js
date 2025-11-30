import { showNotification } from './ui.js';

/**
 * Authentication module
 */
export const auth = {
    /**
     * Initialize auth listener
     * @param {Function} onLogin Callback when user logs in
     * @param {Function} onLogout Callback when user logs out
     */
    init(onLogin, onLogout) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                onLogin(user);
            } else {
                onLogout();
            }
        });
    },

    /**
     * Login with Google
     */
    async loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await firebase.auth().signInWithPopup(provider);
            showNotification('Xush kelibsiz!');
        } catch (error) {
            console.error("Login error:", error);
            showNotification('❌ Kirishda xatolik!', 'error');
        }
    },

    /**
     * Logout
     */
    async logout() {
        try {
            await firebase.auth().signOut();
            showNotification('Tizimdan chiqildi');
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    /**
     * Get current user
     * @returns {Object|null} Current user
     */
    getCurrentUser() {
        return firebase.auth().currentUser;
    }
};
