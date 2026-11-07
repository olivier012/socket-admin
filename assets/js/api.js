import { CONFIG } from './config.js?v=20261107-0212';

export const api = {
    async post(endpoint, data) {
        const tg = window.Telegram?.WebApp;
        const bodyData = { ...data };
        
        if (tg?.initData) {
            bodyData.initData = tg.initData;
        }

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        const dataResponse = await response.json();
        
        if (!response.ok) {
            throw new Error(dataResponse.error || 'Erreur serveur');
        }
        
        return dataResponse;
    },

    async getStats() {
        return this.post(CONFIG.ENDPOINTS.ADMIN_STATS, {});
    },

    async addCode(productId, code) {
        return this.post(CONFIG.ENDPOINTS.ADMIN_ADD_CODE, { productId, code });
    },
    
    async verifyUser() {
        return this.post(CONFIG.ENDPOINTS.VERIFY_USER, {});
    }
};