// config_html.js — Module HTML embarqué
// NE PAS MODIFIER — généré depuis config.html
const HTML = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ninja's Corp — Paramètres</title>
<style>
  :root{--orange:#ff7a1a;--cyan:#00f2ff;--bg:#020810;--dark:#0a1525;--border:rgba(255,122,26,.3);}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:#e8d8c0;font-family:'Share Tech Mono',monospace;height:100vh;display:flex;flex-direction:column;overflow:hidden;}

  .header{display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);background:rgba(0,0,0,.8);gap:12px;flex-shrink:0;}
  .back-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:6px 14px;font-family:inherit;font-size:14px;cursor:pointer;border-radius:2px;}
  .header-title{flex:1;font-size:16px;font-weight:900;letter-spacing:2px;color:var(--orange);}
  .save-badge{font-size:10px;color:var(--cyan);opacity:0;transition:.3s;}
  .save-badge.show{opacity:1;}

  .scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:12px 16px 40px;}
  .scroll::-webkit-scrollbar{width:4px;}
  .scroll::-webkit-scrollbar-thumb{background:var(--border);}

  /* Sections */
  .section{margin-bottom:10px;border:1px solid var(--border);border-radius:3px;background:var(--dark);overflow:hidden;}
  .section-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;cursor:pointer;border-bottom:1px solid transparent;transition:.2s;}
  .section-header:hover{background:rgba(255,122,26,.05);}
  .section-header.open{border-bottom-color:var(--border);}
  .section-title{font-size:13px;font-weight:900;letter-spacing:1px;color:var(--orange);}
  .section-arrow{color:var(--orange);font-size:18px;transition:transform .2s;}
  .section-arrow.open{transform:rotate(90deg);}
  .section-body{padding:14px 16px;display:none;}
  .section-body.open{display:block;}

  /* Champs */
  .field{margin-bottom:14px;}
  .field label{display:block;font-size:11px;color:#667788;margin-bottom:5px;letter-spacing:.5px;}
  .field input,.field textarea,.field select{width:100%;background:#050e1a;color:#e8d8c0;border:1px solid var(--border);border-radius:2px;padding:9px 10px;font-family:inherit;font-size:13px;outline:none;transition:.2s;}
  .field input:focus,.field textarea:focus{border-color:var(--orange);}
  .field textarea{height:70px;resize:none;}

  /* Boutons */
  .btn{display:block;width:100%;border:1px solid var(--orange);background:none;color:var(--orange);padding:10px;font-family:inherit;font-size:13px;font-weight:900;cursor:pointer;border-radius:2px;margin-top:10px;transition:.2s;letter-spacing:.5px;}
  .btn:hover{background:rgba(255,122,26,.1);}
  .btn.cyan{border-color:var(--cyan);color:var(--cyan);}
  .btn.cyan:hover{background:rgba(0,242,255,.08);}
  .btn.danger{border-color:rgba(255,50,0,.5);color:#ff5533;}
  .btn.sm{font-size:11px;padding:7px;margin-top:6px;}

  /* Liste enregistrements */
  .record-list{margin-top:10px;}
  .record-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--border);border-radius:2px;margin-bottom:5px;background:rgba(0,0,0,.3);}
  .record-name{font-size:12px;color:#e8d8c0;}
  .record-id{font-size:10px;color:#667788;}
  .record-del{background:none;border:none;color:rgba(255,50,0,.6);font-size:14px;cursor:pointer;padding:2px 8px;}
  .record-del:hover{color:#ff5533;}

  /* Toast */
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,242,255,.15);border:1px solid var(--cyan);color:var(--cyan);padding:8px 20px;font-family:inherit;font-size:12px;border-radius:2px;opacity:0;transition:.3s;pointer-events:none;z-index:999;}
  .toast.show{opacity:1;}

  .hint{font-size:10px;color:#667788;line-height:1.5;margin-bottom:10px;}
  .divider{border:none;border-top:1px solid var(--border);margin:10px 0;}
</style>
</head>
<body>

<div class="header">
  <button class="back-btn" onclick="goBack()">‹ Dashboard</button>
  <div class="header-title">⚙ PARAMÈTRES</div>
  <div class="save-badge" id="save-badge">✓ Sauvegardé</div>
</div>

<div class="scroll">

  <!-- ── OBJECTIFS FINANCIERS ── -->
  <div class="section">
    <div class="section-header open" onclick="toggle(this)">
      <span class="section-title">OBJECTIFS FINANCIERS</span>
      <span class="section-arrow open">›</span>
    </div>
    <div class="section-body open">
      <div class="field"><label>Objectif Financier Annuel — AFG (FCFA)</label>
        <input type="number" id="afg" placeholder="Ex: 18000000" oninput="autoSave()"></div>
      <div class="field"><label>Objectif Financier Mensuel — MFG (FCFA)</label>
        <input type="number" id="mfg" placeholder="Ex: 1500000" oninput="autoSave()"></div>
      <div class="field"><label>Objectif C.A. journalier par chariot (FCFA)</label>
        <input type="number" id="daily-ca" placeholder="Ex: 50000" oninput="autoSave()"></div>
      <div class="field"><label>Objectif commandes journalier par chariot</label>
        <input type="number" id="daily-cmd" placeholder="Ex: 30" oninput="autoSave()"></div>
      <div class="field"><label>Premier jour de l'année fiscale (référence calculs)</label>
        <input type="date" id="fiscal-start" oninput="autoSave()"></div>
      <button class="btn cyan" onclick="saveGoals()">💾 Sauvegarder les objectifs</button>
    </div>
  </div>

  <!-- ── AJOUTER UN CHARIOT ── -->
  <div class="section">
    <div class="section-header" onclick="toggle(this)">
      <span class="section-title">GESTION DES CHARIOTS</span>
      <span class="section-arrow">›</span>
    </div>
    <div class="section-body">
      <div class="field"><label>Nom du chariot (modèle)</label>
        <input type="text" id="cart-name" placeholder="Ex: CART MASTER 01"></div>
      <div class="field"><label>Identifiant unique (sans espaces)</label>
        <input type="text" id="cart-id" placeholder="Ex: cart_01"></div>
      <div class="field"><label>Objectif C.A. journalier spécifique (optionnel)</label>
        <input type="number" id="cart-ca-goal" placeholder="Laissez vide = objectif global"></div>
      <div class="field"><label>Objectif commandes journalier spécifique (optionnel)</label>
        <input type="number" id="cart-cmd-goal" placeholder="Laissez vide = objectif global"></div>
      <div class="hint">Le fichier vidéo 3D (GLB) et l'image du chariot se définissent dans son profil après création.</div>
      <button class="btn" onclick="addCart()">+ Ajouter le chariot</button>
      <hr class="divider">
      <div class="record-list" id="carts-list">
        <div style="font-size:11px;color:#667788;text-align:center">Chargement...</div>
      </div>
    </div>
  </div>

  <!-- ── FOURNISSEURS ── -->
  <div class="section">
    <div class="section-header" onclick="toggle(this)">
      <span class="section-title">AJOUTER UN FOURNISSEUR</span>
      <span class="section-arrow">›</span>
    </div>
    <div class="section-body">
      <div class="field"><label>Nom de l'entreprise fournisseuse</label>
        <input type="text" id="sup-name" placeholder="Ex: SARL Grossiste BF"></div>
      <div class="field"><label>Produit</label>
        <input type="text" id="sup-product" placeholder="Ex: Pommes de terre fraîches"></div>
      <div class="field"><label>Spécifications</label>
        <textarea id="sup-spec" placeholder="Taille, conditionnement, variété..."></textarea></div>
      <div class="field"><label>Délai commande → réception</label>
        <input type="text" id="sup-delay" placeholder="Ex: 2-3 jours"></div>
      <div class="field"><label>Qualité</label>
        <select id="sup-quality">
          <option value="">Sélectionner...</option>
          <option>Premium</option><option>Standard</option><option>Économique</option>
        </select></div>
      <div class="field"><label>Prix unitaire (FCFA)</label>
        <input type="number" id="sup-price" placeholder="Ex: 500"></div>
      <button class="btn" onclick="addSupplier()">+ Ajouter le fournisseur</button>
      <hr class="divider">
      <div class="record-list" id="suppliers-list">
        <div style="font-size:11px;color:#667788;text-align:center">Chargement...</div>
      </div>
    </div>
  </div>

  <!-- ── RÉCOMPENSES & BONUS ── -->
  <div class="section">
    <div class="section-header" onclick="toggle(this)">
      <span class="section-title">RÉCOMPENSES & BONUS</span>
      <span class="section-arrow">›</span>
    </div>
    <div class="section-body">
      <div class="field"><label>Seuil sold-out (ventes déclenchant "Record Destroyer" en %)</label>
        <input type="number" id="reward-soldout" placeholder="Ex: 100" oninput="autoSave()"></div>
      <div class="field"><label>Seuil "Game Changer" (ventes en %)</label>
        <input type="number" id="reward-game" placeholder="Ex: 85" oninput="autoSave()"></div>
      <div class="field"><label>Bonus sold-out (FCFA supplémentaires)</label>
        <input type="number" id="bonus-soldout" placeholder="Ex: 5000" oninput="autoSave()"></div>
      <div class="field"><label>Bonus "Best Cart" de la semaine (FCFA)</label>
        <input type="number" id="bonus-best" placeholder="Ex: 10000" oninput="autoSave()"></div>
      <button class="btn cyan sm" onclick="saveRewards()">💾 Sauvegarder</button>
    </div>
  </div>

  <!-- ── RAPPORTS ── -->
  <div class="section">
    <div class="section-header" onclick="toggle(this)">
      <span class="section-title">RAPPORTS PDF</span>
      <span class="section-arrow">›</span>
    </div>
    <div class="section-body">
      <div class="field"><label>Mois du rapport mensuel</label>
        <input type="month" id="report-month"></div>
      <button class="btn" onclick="generateReport('monthly')">📄 Générer rapport mensuel</button>
      <button class="btn sm" onclick="generateReport('annual')">📄 Générer rapport annuel</button>
    </div>
  </div>

  <!-- ── DOCUMENTS RH ── -->
  <div class="section">
    <div class="section-header" onclick="toggle(this)">
      <span class="section-title">DOCUMENTS RH</span>
      <span class="section-arrow">›</span>
    </div>
    <div class="section-body">
      <div class="field"><label>Nom de l'employé</label>
        <input type="text" id="rh-name" placeholder="Prénom Nom"></div>
      <div class="field"><label>Poste</label>
        <input type="text" id="rh-poste" placeholder="Ex: Vendeur Cart 01"></div>
      <div class="field"><label>Salaire de base (FCFA)</label>
        <input type="number" id="rh-salaire" placeholder="Ex: 75000"></div>
      <button class="btn sm" onclick="generateDoc('contrat')">📄 Contrat de travail</button>
      <button class="btn sm" onclick="generateDoc('fiche')">📄 Fiche de poste</button>
    </div>
  </div>

  <!-- ── ARRIÈRE-PLAN ── -->
  <div class="section">
    <div class="section-header" onclick="toggle(this)">
      <span class="section-title">APPARENCE</span>
      <span class="section-arrow">›</span>
    </div>
    <div class="section-body">
      <div class="hint">Définir un fond personnalisé pour le dashboard principal.</div>
      <input type="file" id="bg-input" accept="image/*" style="display:none" onchange="saveBg(event)">
      <button class="btn sm" onclick="document.getElementById('bg-input').click()">🖼 Choisir un arrière-plan</button>
      <button class="btn sm danger" onclick="clearBg()">✕ Supprimer l'arrière-plan</button>
    </div>
  </div>

</div><!-- /scroll -->

<div class="toast" id="toast"></div>

<script>
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  projectId:"ninja-s-fries",
  databaseURL:"https://ninja-s-fries-default-rtdb.firebaseio.com",
};
let db, addDoc, setDoc, doc, getDoc, getDocs, deleteDoc,
    collection, query, orderBy, serverTimestamp;

// ── Init Firebase ──
async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const fs = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app = initializeApp(FIREBASE_CONFIG);
    db = fs.getFirestore(app);
    ({ addDoc, setDoc, doc, getDoc, getDocs, deleteDoc, collection, query, orderBy, serverTimestamp } = fs);
    loadAll();
  } catch(e) { toast('Firebase non disponible — mode local'); }
}

// ── Chargement initial ──
async function loadAll() {
  const cfg = await loadConfig();
  if (cfg) {
    setValue('afg',          cfg.annualFinancialGoal  || '');
    setValue('mfg',          cfg.monthlyFinancialGoal || '');
    setValue('daily-ca',     cfg.dailyCAGoal          || '');
    setValue('daily-cmd',    cfg.dailyCmdGoal         || '');
    setValue('fiscal-start', cfg.fiscalStart          || '');
    setValue('reward-soldout',cfg.rewardSoldout       || '');
    setValue('reward-game',  cfg.rewardGame           || '');
    setValue('bonus-soldout',cfg.bonusSoldout         || '');
    setValue('bonus-best',   cfg.bonusBest            || '');
  }
  loadCarts();
  loadSuppliers();
}

async function loadConfig() {
  if (!db) return JSON.parse(localStorage.getItem('ninja_config') || '{}');
  try {
    const snap = await getDoc(doc(db, 'config', 'goals'));
    return snap.exists() ? snap.data() : {};
  } catch(_) { return {}; }
}

// ── Sauvegarder objectifs ──
async function saveGoals() {
  const data = {
    annualFinancialGoal:  num('afg'),
    monthlyFinancialGoal: num('mfg'),
    dailyCAGoal:          num('daily-ca'),
    dailyCmdGoal:         num('daily-cmd'),
    fiscalStart:          val('fiscal-start'),
    rewardSoldout:        num('reward-soldout'),
    rewardGame:           num('reward-game'),
    bonusSoldout:         num('bonus-soldout'),
    bonusBest:            num('bonus-best'),
  };
  // Local d'abord
  localStorage.setItem('ninja_config', JSON.stringify(data));
  // Firebase si dispo
  if (db) {
    try { await setDoc(doc(db,'config','goals'), data, {merge:true}); } catch(_) {}
  }
  toast('✓ Objectifs sauvegardés');
  showBadge();
}

function saveRewards() { saveGoals(); }

let saveTimer;
function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveGoals, 1500);
}

// ── Carts ──
async function addCart() {
  const name   = val('cart-name').trim();
  const cartId = val('cart-id').trim().replace(/\\s+/g,'_').toLowerCase();
  if (!name || !cartId) { toast('⚠ Nom et identifiant requis'); return; }
  const data = {
    cartName:    name,
    todayTotal:  0, todayOrders: 0, annualTotal: 0,
    dailyCAGoal:  num('cart-ca-goal')  || num('daily-ca')  || 50000,
    dailyGoalCmd: num('cart-cmd-goal') || num('daily-cmd') || 30,
    cartImageUrl: '', videoUrl: '',
  };
  if (db) {
    try {
      data.createdAt = serverTimestamp();
      data.updatedAt = serverTimestamp();
      await setDoc(doc(db,'carts',cartId), data);
    } catch(e) { toast('Erreur: '+e.message); return; }
  }
  clear('cart-name'); clear('cart-id'); clear('cart-ca-goal'); clear('cart-cmd-goal');
  toast('✓ Chariot "'+name+'" ajouté');
  loadCarts();
}

async function loadCarts() {
  const list = document.getElementById('carts-list');
  if (!list) return;
  if (!db) { list.innerHTML = '<div style="font-size:11px;color:#667788">Non connecté</div>'; return; }
  try {
    const snap = await getDocs(query(collection(db,'carts'), orderBy('createdAt','asc')));
    if (snap.empty) { list.innerHTML = '<div style="font-size:11px;color:#667788">Aucun chariot</div>'; return; }
    list.innerHTML = snap.docs.map(d => \`
      <div class="record-item">
        <div>
          <div class="record-name">\${d.data().cartName || d.id}</div>
          <div class="record-id">\${d.id}</div>
        </div>
        <button class="record-del" onclick="deleteCart('\${d.id}')">✕</button>
      </div>\`).join('');
  } catch(_) {}
}

async function deleteCart(id) {
  if (!db) return;
  try { await deleteDoc(doc(db,'carts',id)); loadCarts(); toast('Chariot supprimé'); } catch(e) {}
}

// ── Fournisseurs ──
async function addSupplier() {
  const name = val('sup-name').trim();
  if (!name) { toast('⚠ Nom du fournisseur requis'); return; }
  const data = {
    companyName:    name,
    product:        val('sup-product'),
    specifications: val('sup-spec'),
    deliveryDelay:  val('sup-delay'),
    quality:        val('sup-quality'),
    unitPrice:      num('sup-price'),
  };
  if (db) {
    try { data.createdAt = serverTimestamp(); await addDoc(collection(db,'suppliers'), data); }
    catch(e) { toast('Erreur: '+e.message); return; }
  }
  ['sup-name','sup-product','sup-spec','sup-delay','sup-quality','sup-price'].forEach(clear);
  toast('✓ Fournisseur ajouté'); loadSuppliers();
}

async function loadSuppliers() {
  const list = document.getElementById('suppliers-list');
  if (!list || !db) return;
  try {
    const snap = await getDocs(query(collection(db,'suppliers'), orderBy('createdAt','asc')));
    if (snap.empty) { list.innerHTML = '<div style="font-size:11px;color:#667788">Aucun fournisseur</div>'; return; }
    list.innerHTML = snap.docs.map(d => \`
      <div class="record-item">
        <div>
          <div class="record-name">\${d.data().companyName}</div>
          <div class="record-id">\${d.data().product || ''} — \${d.data().unitPrice||0} FCFA/u</div>
        </div>
        <button class="record-del" onclick="deleteSupplier('\${d.id}')">✕</button>
      </div>\`).join('');
  } catch(_) {}
}

async function deleteSupplier(id) {
  if (!db) return;
  try { await deleteDoc(doc(db,'suppliers',id)); loadSuppliers(); toast('Fournisseur supprimé'); } catch(_) {}
}

// ── Arrière-plan ──
function saveBg(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { localStorage.setItem('ninja_bg', e.target.result); toast('✓ Fond sauvegardé'); };
  reader.readAsDataURL(file);
}
function clearBg() { localStorage.removeItem('ninja_bg'); toast('Fond supprimé'); }

// ── Rapports (TODO: jsPDF) ──
function generateReport(type) { toast('📄 Export '+type+' — bientôt disponible'); }
function generateDoc(type)    { toast('📄 '+type+' — bientôt disponible'); }

// ── Sections toggle ──
function toggle(header) {
  const body  = header.nextElementSibling;
  const arrow = header.querySelector('.section-arrow');
  const open  = body.classList.toggle('open');
  header.classList.toggle('open', open);
  arrow.classList.toggle('open', open);
}

// ── Navigation ──
function goBack() { window._navigateTo('dashboard.html'); }

// ── Helpers ──
function val(id) { return (document.getElementById(id)||{}).value || ''; }
function num(id) { return parseFloat(val(id)) || 0; }
function setValue(id, v) { const el=document.getElementById(id); if(el) el.value=v; }
function clear(id) { const el=document.getElementById(id); if(el) el.value=''; }

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}
function showBadge() {
  const b = document.getElementById('save-badge');
  b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), 2000);
}

initFirebase();
</script>

<script id="nav-bridge">
// Navigation bridge — injecté automatiquement
(function() {
  // Intercepter les liens <a href>
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (a) {
      var href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript')) {
        e.preventDefault();
        navigateTo(href);
      }
    }
  }, true);

  // Intercepter window.location.href
  var _origHref = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href') ||
                  Object.getOwnPropertyDescriptor(Location.prototype, 'href');
  var _realAssign = window.location.assign.bind(window.location);

  window._navigateTo = navigateTo;

  function navigateTo(url) {
    // Extraire la page et les params
    var parts = url.split('?');
    var page  = parts[0].replace('.html','').replace('/','');
    var search = parts[1] || '';
    var param = '';
    var m = search.match(/id=([^&]+)/);
    if (m) param = decodeURIComponent(m[1]);
    
    var msg = JSON.stringify({ action: 'NAVIGATE', screen: page, param: param });
    try {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
      else if (window.webkit && window.webkit.messageHandlers)
        window.webkit.messageHandlers.rn.postMessage(msg);
      else console.log('[NAV]', msg);
    } catch(err) { console.log('[NAV]', msg); }
  }
})();
</script>

</body>
</html>
\`;
module.exports = HTML;
