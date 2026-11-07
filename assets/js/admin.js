const API_URL = 'https://socklet-api.duckdns.org';
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.expand();
    tg.setHeaderColor('#f3f5f1');
    tg.setBackgroundColor('#f3f5f1');
}

const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginButton = document.getElementById('loginButton');
const loginStatus = document.getElementById('loginStatus');
const AUTH_KEY = 'socket-admin-authenticated';

function showApp() {
    loginPage.classList.add('hidden');
    app.classList.remove('hidden');
    loadStats();
}

function showLogin(message = '') {
    app.classList.add('hidden');
    loginPage.classList.remove('hidden');
    sessionStorage.removeItem(AUTH_KEY);
    loginStatus.textContent = message;
}

async function authenticate() {
    if (!tg?.initData) {
        loginStatus.textContent = 'Ouvrez Socket Admin depuis Telegram pour vous connecter.';
        tg?.HapticFeedback?.notificationOccurred('error');
        return;
    }

    loginButton.disabled = true;
    loginStatus.textContent = 'Vérification en cours...';

    try {
        const response = await fetch(`${API_URL}/api/verify-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Connexion refusée.');
        }

        sessionStorage.setItem(AUTH_KEY, 'true');
        tg.HapticFeedback?.notificationOccurred('success');
        showApp();
    } catch (error) {
        loginStatus.textContent = error.message || 'Impossible de vérifier votre compte.';
        tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
        loginButton.disabled = false;
    }
}

loginButton.addEventListener('click', authenticate);

document.getElementById('logoutButton').addEventListener('click', () => showLogin());

const titles = {
    sales: 'Ventes',
    cards: 'Cartes',
    reservations: 'Réservations',
    support: 'Support',
    admin: 'Admin'
};

document.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', () => {
        const viewName = button.dataset.view;
        document.querySelectorAll('.nav-button').forEach((item) => item.classList.toggle('active', item === button));
        document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.dataset.view === viewName));
        document.getElementById('pageTitle').textContent = titles[viewName];
        tg?.HapticFeedback?.selectionChanged();
    });
});

document.getElementById('addCodeForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productId = document.getElementById('productSelect').value;
    const code = document.getElementById('codeInput').value.trim();
    if (!code) return;
    if (!tg?.initData) {
        tg?.showAlert?.('Vous devez ouvrir l’application depuis Telegram.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/admin/addcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData, productId, code })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Impossible d’ajouter le code.');
        }

        document.getElementById('codeInput').value = '';
        tg?.showAlert?.('Code ajouté avec succès.');
        tg?.HapticFeedback?.notificationOccurred('success');
        loadStats();
    } catch (error) {
        const message = error.message || 'Erreur de connexion au serveur.';
        tg?.showAlert?.(message);
        tg?.HapticFeedback?.notificationOccurred('error');
    }
});

async function loadStats() {
    if (!tg?.initData) return;
    try {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            document.getElementById('stat-users').textContent = data.stats.users ?? 0;
            document.getElementById('stat-revenue').textContent = `${data.stats.revenue ?? 0} €`;
            document.getElementById('stat-orders').textContent = data.stats.orders ?? 0;
            document.getElementById('stat-codes').textContent = data.stats.codes ?? 0;
        }
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

if (sessionStorage.getItem(AUTH_KEY) === 'true' && tg?.initData) {
    authenticate();
} else {
    showLogin(tg?.initData ? '' : 'Ouvrez cette page depuis Telegram pour continuer.');
}
