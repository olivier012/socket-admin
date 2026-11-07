export const router = {
    titles: {
        sales: 'Ventes',
        cards: 'Cartes',
        reservations: 'Réservations',
        support: 'Support',
        admin: 'Admin'
    },

    init() {
        document.querySelectorAll('.nav-button').forEach((button) => {
            button.addEventListener('click', () => {
                const viewName = button.dataset.view;
                
                // Mettre à jour les boutons
                document.querySelectorAll('.nav-button').forEach((item) => 
                    item.classList.toggle('active', item === button)
                );
                
                // Afficher la bonne vue
                document.querySelectorAll('.view').forEach((view) => 
                    view.classList.toggle('active', view.dataset.view === viewName)
                );
                
                // Mettre à jour le titre
                document.getElementById('pageTitle').textContent = this.titles[viewName];
                
                window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
            });
        });
    },

    navigateTo(viewName) {
        const button = document.querySelector(`.nav-button[data-view="${viewName}"]`);
        if (button) button.click();
    }
};