import { showNotification } from './ui.js';

/**
 * Database module for Firestore operations
 */
export const db = {
    /**
     * Get restaurant data
     * @param {string} userId 
     * @returns {Promise<Object|null>} Restaurant data or null
     */
    async getRestaurant(userId) {
        try {
            const doc = await firebase.firestore().collection('restaurants').doc(userId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error("Error getting restaurant:", error);
            showNotification('❌ Ma\'lumotlarni yuklashda xatolik!', 'error');
            throw error;
        }
    },

    /**
     * Save restaurant data
     * @param {string} userId 
     * @param {Object} data Data to save
     */
    async saveRestaurant(userId, data) {
        try {
            await firebase.firestore().collection('restaurants').doc(userId).set({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('✅ Saqlandi!');
        } catch (error) {
            console.error("Error saving restaurant:", error);
            showNotification('❌ Saqlashda xatolik!', 'error');
            throw error;
        }
    },

    /**
     * Get orders for a restaurant
     * @param {string} userId 
     * @returns {Promise<Array>} List of orders
     */
    async getOrders(userId) {
        try {
            const snapshot = await firebase.firestore().collection('orders')
                .where('restaurantId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting orders:", error);
            return [];
        }
    },

    /**
     * Update order status
     * @param {string} orderId 
     * @param {string} status 
     */
    async updateOrderStatus(orderId, status) {
        try {
            await firebase.firestore().collection('orders').doc(orderId).update({ status });
            showNotification('Status yangilandi');
        } catch (error) {
            console.error("Error updating status:", error);
            showNotification('❌ Xatolik', 'error');
            throw error;
        }
    }
};
