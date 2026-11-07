import { api } from './api.js';

const AUTH_KEY = 'socket-admin-authenticated';

export const auth = {
    async login() {
        const tg = window.Telegram?.WebApp;
        if (!tg?.initData) {
            throw new Error('Ouvrez cette page depuis Telegram pour vous connecter.');
        }
        
        // On vérifie auprès du serveur si l'utilisateur est admin
        await api.verifyUser(); 
        
        sessionStorage.setItem(AUTH_KEY, 'true');
        return true;
    },

    logout() {
        sessionStorage.removeItem(AUTH_KEY);
        window.location.reload(); // Recharge la page pour revenir au login
    },

    isLoggedIn() {
        return sessionStorage.getItem(AUTH_KEY) === 'true';
    }
};