import { api } from '../api.js?v=20261107-0212';

export const codesView = {
    init() {
        const form = document.getElementById('addCodeForm');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const tg = window.Telegram?.WebApp;
            
            const productId = document.getElementById('productSelect').value;
            const code = document.getElementById('codeInput').value.trim();
            
            if (!code) return;

            if (!tg?.initData) {
                document.getElementById('codeInput').value = '';
                tg?.showAlert?.('Code enregistré en mode aperçu.');
                return;
            }

            try {
                await api.addCode(productId, code);
                document.getElementById('codeInput').value = '';
                tg?.showAlert?.('Code ajouté avec succès.');
                tg?.HapticFeedback?.notificationOccurred('success');
                
                // Recharger les stats pour voir le stock augmenter
                import('./stats.js?v=20261107-0212').then(({ statsView }) => statsView.load());
            } catch (error) {
                tg?.showAlert?.(error.message || 'Erreur de connexion.');
                tg?.HapticFeedback?.notificationOccurred('error');
            }
        });
    }
};