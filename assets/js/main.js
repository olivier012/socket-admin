import { auth } from './auth.js?v=20261107-0300';
import { router } from './routes.js?v=20261107-0300';
import { statsView } from './views/stats.js?v=20261107-0300';
import { codesView } from './views/codes.js?v=20261107-0300';

const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor({ backgroundColor: '#f3f5f1', textColor: '#171918' });
    tg.setBackgroundColor('#f3f5f1');
}

// Éléments du DOM
const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginStatus = document.getElementById('loginStatus');
const pinDots = document.getElementById('pinDots');
const dots = pinDots.querySelectorAll('.dot');
const numpad = document.getElementById('numpad');
const loginLoader = document.getElementById('loginLoader');

let currentPin = '';
let isVerifying = false;

// --- LOGIQUE DU CLAVIER ---
numpad.addEventListener('click', async (e) => {
    if (isVerifying) return; // On bloque le clavier pendant le chargement
    
    const btn = e.target.closest('.numpad-btn');
    if (!btn || btn.disabled) return;

    const key = btn.dataset.key;
    tg?.HapticFeedback?.impactOccurred('light');

    if (key === 'backspace') {
        currentPin = currentPin.slice(0, -1);
    } else if (currentPin.length < 4) {
        currentPin += key;
    }

    updateDots();

    if (currentPin.length === 4) {
        await handleLogin(currentPin);
    }
});

function updateDots() {
    dots.forEach((dot, index) => dot.classList.toggle('filled', index < currentPin.length));
}

function resetPin() {
    currentPin = '';
    updateDots();
    pinDots.classList.remove('error', 'loading');
    numpad.style.display = 'grid';
    loginLoader.classList.remove('active');
    isVerifying = false;
}

async function handleLogin(pin) {
    isVerifying = true;
    numpad.style.display = 'none';
    loginLoader.classList.add('active');
    pinDots.classList.add('loading');
    loginStatus.textContent = '';

    try {
        await auth.login(pin);
        
        // Petit délai pour que le loader soit visible
        setTimeout(() => {
            tg?.HapticFeedback?.notificationOccurred('success');
            showApp();
            resetPin();
        }, 500);
        
    } catch (error) {
        isVerifying = false;
        pinDots.classList.remove('loading');
        pinDots.classList.add('error');
        loginLoader.classList.remove('active');
        numpad.style.display = 'grid';
        loginStatus.textContent = error.message;
        tg?.HapticFeedback?.notificationOccurred('error');
        
        setTimeout(() => resetPin(), 800);
    }
}

// --- LOGIQUE DES VUES & TOAST ---
function showApp() {
    loginPage.classList.add('hidden');
    app.classList.remove('hidden');
    
    // On affiche TOUJOURS le bouton admin, mais il agira différemment selon le rôle
    document.querySelector('.topbar p').textContent = auth.isSuperAdmin() ? 'Superadmin' : 'Utilisateur';
    
    // Interception du clic sur le bouton Admin
    const adminButton = document.querySelector('.nav-button[data-view="admin"]');
    adminButton.onclick = (e) => {
        if (!auth.isSuperAdmin()) {
            e.preventDefault();
            e.stopPropagation();
            showToast("Désolé, accès refusé");
            return;
        }
        // Si superadmin, on laisse le router faire son travail
        router.navigateTo('admin');
    };

    statsView.load();
}

function showLogin(message = '') {
    app.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginStatus.textContent = message;
    resetPin();
}

// Fonction Toast
function showToast(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    tg?.HapticFeedback?.notificationOccurred('error');
    
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Gestion de la déconnexion
document.getElementById('logoutButton').addEventListener('click', () => auth.logout());

// Initialisation
function init() {
    if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => {});
    }
    router.init();
    codesView.init();

    if (auth.isLoggedIn()) showApp();
    else showLogin('');
}

init();