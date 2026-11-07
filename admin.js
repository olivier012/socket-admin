const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.setHeaderColor('#0D0E11');
}

const API_URL = 'https://socklet-api.duckdns.org';

// --- GESTION DES ONGLETS ---
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Ici tu pourras afficher/masquer des sections selon l'onglet
        tg?.HapticFeedback?.selectionChanged();
    });
});

// --- AJOUT DE CODE ---
document.getElementById('addCodeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('productSelect').value;
    const code = document.getElementById('codeInput').value.trim();
    
    if (!code) return tg?.showAlert("Veuillez entrer un code.");
    if (!tg || !tg.initData) return alert("Vous devez ouvrir depuis Telegram.");

    try {
        const response = await fetch(`${API_URL}/api/admin/addcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: tg.initData,
                productId: productId,
                code: code
            })
        });

        const data = await response.json();
        
        if (data.success) {
            tg.showAlert("✅ Code ajouté avec succès !");
            document.getElementById('codeInput').value = '';
        } else {
            tg.showAlert("❌ Erreur : " + (data.error || "Inconnue"));
        }
    } catch (err) {
        console.error(err);
        tg.showAlert("⚠️ Erreur de connexion au serveur.");
    }
});

// --- CHARGEMENT DES STATS ---
async function loadStats() {
    if (!tg || !tg.initData) return;
    try {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('stat-users').textContent = data.stats.users;
            document.getElementById('stat-revenue').textContent = data.stats.revenue + ' €';
            document.getElementById('stat-orders').textContent = data.stats.orders;
            document.getElementById('stat-codes').textContent = data.stats.codes;
        }
    } catch (err) {
        console.error("Erreur stats:", err);
    }
}

loadStats();