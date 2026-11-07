import { api } from '../api.js?v=20261107-0212';

export const statsView = {
    async load() {
        const tg = window.Telegram?.WebApp;
        if (!tg?.initData) return;

        try {
            const data = await api.getStats();
            if (data.success) {
                document.getElementById('stat-users').textContent = data.stats.users ?? 0;
                document.getElementById('stat-revenue').textContent = `${data.stats.revenue ?? 0} €`;
                document.getElementById('stat-orders').textContent = data.stats.orders ?? 0;
                document.getElementById('stat-codes').textContent = data.stats.codes ?? 0;
            }
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    }
};