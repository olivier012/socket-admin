import { api } from '../api.js';

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

            try {
                await api.addCode(productId, code);
                document.getElementById('codeInput').value = '';
                tg?.showAlert?.('Code ajouté avec succès.');
                tg?.HapticFeedback?.notificationOccurred('success');
                
                // Recharger les stats pour voir le stock augmenter
                import('./stats.js').then(({ statsView }) => statsView.load());
            } catch (error) {
                tg?.showAlert?.(error.message || 'Erreur de connexion.');
                tg?.HapticFeedback?.notificationOccurred('error');
            }
        });
    }
};