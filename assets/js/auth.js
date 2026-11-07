const AUTH_KEY = 'socket-admin-authenticated';
const ROLE_KEY = 'socket-admin-role';
const API_URL = 'https://socklet-api.duckdns.org';

export const auth = {
    async login(pin) {
        if (!/^\d{4}$/.test(pin)) {
            throw new Error('Saisissez exactement 4 chiffres.');
        }

        try {
            // On demande au serveur VPS si le code est bon
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Code PIN incorrect.');
            }

            // Si le serveur valide, on stocke la session localement
            sessionStorage.setItem(AUTH_KEY, 'true');
            sessionStorage.setItem(ROLE_KEY, data.role);
            return { role: data.role };

        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'Erreur de connexion au serveur.');
        }
    },

    logout() {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(ROLE_KEY);
        window.location.reload();
    },

    isLoggedIn() {
        return sessionStorage.getItem(AUTH_KEY) === 'true';
    },

    getRole() {
        return sessionStorage.getItem(ROLE_KEY);
    },

    isSuperAdmin() {
        return this.getRole() === 'superadmin';
    }
};