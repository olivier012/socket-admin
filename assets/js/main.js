import { auth } from './auth.js';
import { router } from './router.js';
import { statsView } from './views/stats.js';
import { codesView } from './views/codes.js';

const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.setHeaderColor('#f3f5f1'); // Fond clair
    tg.setBackgroundColor('#f3f5f1'); // Fond de l'app
    // Force le texte de la barre en noir (0 = noir, 1 = blanc)
    if (tg.setHeaderColor) {
        tg.setHeaderColor({ backgroundColor: '#f3f5f1', textColor: '#171918' });
    }
}

// Éléments du DOM
const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginButton = document.getElementById('loginButton');
const loginStatus = document.getElementById('loginStatus');

function showApp() {
    loginPage.classList.add('hidden');
    app.classList.remove('hidden');
    statsView.load(); // Charger les stats au démarrage
}

function showLogin(message = '') {
    app.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginStatus.textContent = message;
}

// Gestion du bouton de connexion
loginButton.addEventListener('click', async () => {
    loginButton.disabled = true;
    loginStatus.textContent = 'Vérification en cours...';

    try {
        await auth.login();
        tg?.HapticFeedback?.notificationOccurred('success');
        showApp();
    } catch (error) {
        loginStatus.textContent = error.message;
        tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
        loginButton.disabled = false;
    }
});

// Gestion du bouton de déconnexion
document.getElementById('logoutButton').addEventListener('click', () => {
    auth.logout();
});

// Initialisation au chargement
function init() {
    router.init();
    codesView.init();

    // Si déjà connecté, on affiche direct l'app
    if (auth.isLoggedIn() && tg?.initData) {
        showApp();
    } else {
        showLogin(tg?.initData ? '' : 'Ouvrez cette page depuis Telegram pour continuer.');
    }
}

init();