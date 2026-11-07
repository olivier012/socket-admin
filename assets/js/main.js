import { auth } from './auth.js?v=20261107-0400';
import { router } from './routes.js?v=20261107-0400';
import { statsView } from './views/stats.js?v=20261107-0400';
import { codesView } from './views/codes.js?v=20261107-0400';

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.expand();
    
    // 1. On force le fond de l'app en blanc
    tg.setBackgroundColor('#ffffff');
    
    // 2. On force la barre du haut en blanc
    // On utilise la syntaxe simple qui marche sur toutes les versions
    if (tg.setHeaderColor) {
        tg.setHeaderColor('#ffffff');
    }
    
    // 3. (Optionnel) On force aussi la couleur du texte de la barre en noir
    // pour qu'il soit lisible sur fond blanc, même si le tel est en mode sombre
    if (tg.setHeaderColor) {
        try {
            tg.setHeaderColor({ backgroundColor: '#ffffff', textColor: '#000000' });
        } catch (e) {
            // Si la version ne supporte pas l'objet, on garde juste le blanc
        }
    }
}

// --- INITIALISATION TELEGRAM (Couleurs & Header) ---
function initTelegramUI() {
    if (!tg) return;
    tg.expand();
    tg.setBackgroundColor('#f3f5f1');
    
    // On attend 150ms pour que la WebApp soit prête avant de changer le header
    setTimeout(() => {
        if (tg.setHeaderColor) {
            tg.setHeaderColor({ backgroundColor: '#f3f5f1', textColor: '#171918' });
        }
    }, 150);
}
initTelegramUI();

// --- ÉLÉMENTS DU DOM ---
const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginStatus = document.getElementById('loginStatus');
const pinDots = document.getElementById('pinDots');
const dots = pinDots.querySelectorAll('.dot');
const numpad = document.getElementById('numpad');
const loginLoader = document.getElementById('loginLoader');

let currentPin = '';
let isVerifying = false;

// --- LOGIQUE DU CLAVIER NUMÉRIQUE ---
if (numpad) {
    numpad.addEventListener('click', async (e) => {
        if (isVerifying) return; 
        
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

        // Vérification automatique dès 4 chiffres
        if (currentPin.length === 4) {
            await handleLogin(currentPin);
        }
    });
}

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

// --- GESTION DU LOGIN ---
async function handleLogin(pin) {
    isVerifying = true;
    numpad.style.display = 'none';
    loginLoader.classList.add('active');
    pinDots.classList.add('loading');
    loginStatus.textContent = '';

    try {
        await auth.login(pin);
        
        // Délai pour laisser le temps de voir le loader
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

// --- LOGIQUE DES VUES (App & Login) ---
function showApp() {
    loginPage.classList.add('hidden');
    app.classList.remove('hidden');
    
    // Affichage du rôle
    document.querySelector('.topbar p').textContent = auth.isSuperAdmin() ? 'Superadmin' : 'Utilisateur';
    
    // Le bouton Admin est TOUJOURS visible, mais on intercepte le clic si on n'est pas superadmin
    const adminButton = document.querySelector('.nav-button[data-view="admin"]');
    if (adminButton) {
        adminButton.onclick = (e) => {
            if (!auth.isSuperAdmin()) {
                e.preventDefault();
                e.stopPropagation();
                showToast("Désolé, accès refusé");
                return;
            }
            // Si superadmin, le routeur fait son travail (le bouton est déjà lié dans routes.js)
        };
    }

    statsView.load();
}

function showLogin(message = '') {
    app.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginStatus.textContent = message;
    resetPin();
}

// --- TOAST (Message flottant) ---
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

// --- ÉVÉNEMENTS GLOBAUX ---
document.getElementById('logoutButton').addEventListener('click', () => {
    auth.logout();
});

// --- INITIALISATION ---
function init() {
    // Nettoyage du cache (optionnel)
    if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => {});
    }

    router.init();
    codesView.init();

    if (auth.isLoggedIn()) {
        showApp();
    } else {
        showLogin('');
    }
}

init();