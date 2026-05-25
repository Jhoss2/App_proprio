// stocks_html.js — Module HTML embarqué
// NE PAS MODIFIER — généré depuis stocks.html
const HTML = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ninja's Corp — Stocks</title>
<style>
  :root{--orange:#ff7a1a;--cyan:#00f2ff;--bg:#020810;--dark:#0a1525;--border:rgba(255,122,26,.3);}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:#e8d8c0;font-family:'Share Tech Mono',monospace;height:100vh;display:flex;flex-direction:column;overflow:hidden;}
  .header{display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);background:rgba(0,0,0,.8);gap:10px;flex-shrink:0;}
  .back-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:6px 14px;font-family:inherit;font-size:14px;cursor:pointer;border-radius:2px;}
  .header-title{flex:1;font-size:16px;font-weight:900;letter-spacing:2px;color:var(--orange);}
  .add-btn{background:none;border:1px solid var(--cyan);color:var(--cyan);padding:6px 14px;font-family:inherit;font-size:16px;cursor:pointer;border-radius:2px;font-weight:900;}

  /* Tabs */
  .tabs{display:flex;border-bottom:1px solid var(--border);flex-shrink:0;background:rgba(0,0,0,.5);}
  .tab{flex:1;padding:9px;text-align:center;font-family:inherit;font-size:11px;font-weight:900;letter-spacing:.5px;background:none;border:none;color:#667788;cursor:pointer;border-bottom:2px solid transparent;transition:.2s;}
  .tab.active{color:var(--orange);border-bottom-color:var(--orange);}

  /* Contenu */
  .tab-content{display:none;flex:1;overflow-y:auto;padding:12px;}
  .tab-content.active{display:block;}
  .tab-content::-webkit-scrollbar{width:3px;}
  .tab-content::-webkit-scrollbar-thumb{background:var(--border);}

  /* Carte stock */
  .stock-card{background:var(--dark);border:1px solid var(--border);border-radius:3px;padding:12px;margin-bottom:8px;display:flex;gap:12px;align-items:center;}
  .stock-card.alert{border-color:rgba(255,50,0,.4);}
  .stock-card.ok   {border-color:rgba(0,255,100,.2);}
  .stock-icon{font-size:24px;flex-shrink:0;}
  .stock-body{flex:1;}
  .stock-name{font-size:13px;font-weight:900;margin-bottom:4px;}
  .stock-meta{font-size:10px;color:#667788;margin-bottom:6px;}
  .stock-bar-row{display:flex;align-items:center;gap:8px;}
  .stock-bar{flex:1;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;}
  .stock-fill{height:100%;border-radius:3px;transition:width .5s ease;}
  .stock-fill.good{background:linear-gradient(90deg,#00bb44,#00ff88);}
  .stock-fill.mid {background:linear-gradient(90deg,#ff8800,#ffcc00);}
  .stock-fill.low {background:linear-gradient(90deg,#cc2200,#ff3300);}
  .stock-pct{font-size:10px;font-weight:900;min-width:35px;text-align:right;}
  .stock-pct.good{color:#00ff88;}
  .stock-pct.mid {color:#ffcc00;}
  .stock-pct.low {color:#ff3300;}
  .stock-actions{display:flex;flex-direction:column;gap:4px;flex-shrink:0;}
  .stock-btn{background:none;border:1px solid var(--border);color:var(--orange);padding:4px 8px;font-family:inherit;font-size:10px;cursor:pointer;border-radius:2px;}
  .stock-btn:hover{border-color:var(--orange);}
  .stock-btn.del{color:rgba(255,50,0,.6);border-color:rgba(255,50,0,.2);}
  .stock-btn.del:hover{color:#ff5533;border-color:rgba(255,50,0,.5);}

  /* Modal ajout */
  .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:100;align-items:center;justify-content:center;padding:20px;}
  .modal-overlay.show{display:flex;}
  .modal{background:#0a1525;border:1px solid var(--border);border-radius:3px;padding:20px;width:100%;max-width:480px;max-height:80vh;overflow-y:auto;}
  .modal-title{font-size:14px;font-weight:900;color:var(--orange);letter-spacing:1px;margin-bottom:16px;}
  .field{margin-bottom:12px;}
  .field label{display:block;font-size:10px;color:#667788;margin-bottom:4px;}
  .field input,.field select{width:100%;background:#050e1a;color:#e8d8c0;border:1px solid var(--border);border-radius:2px;padding:8px 10px;font-family:inherit;font-size:12px;outline:none;}
  .field input:focus{border-color:var(--orange);}
  .modal-btns{display:flex;gap:8px;margin-top:14px;}
  .modal-btn{flex:1;padding:9px;font-family:inherit;font-size:12px;font-weight:900;cursor:pointer;border-radius:2px;border:1px solid;}
  .modal-btn.confirm{background:rgba(255,122,26,.15);border-color:var(--orange);color:var(--orange);}
  .modal-btn.cancel {background:none;border-color:var(--border);color:#667788;}

  /* Stats résumé */
  .summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;}
  .sum-card{background:var(--dark);border:1px solid var(--border);border-radius:3px;padding:10px;text-align:center;}
  .sum-val{font-size:20px;font-weight:900;margin-bottom:3px;}
  .sum-val.red   {color:#ff5533;}
  .sum-val.yellow{color:#ffcc00;}
  .sum-val.green {color:#00ff88;}
  .sum-label{font-size:9px;color:#667788;letter-spacing:.5px;}

  .empty{text-align:center;padding:30px;color:#667788;font-size:12px;}
  .toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,242,255,.15);border:1px solid var(--cyan);color:var(--cyan);padding:6px 16px;font-size:11px;border-radius:2px;opacity:0;transition:.3s;pointer-events:none;z-index:200;}
  .toast.show{opacity:1;}
</style>
</head>
<body>

<div class="header">
  <button class="back-btn" onclick="window._navigateTo('dashboard.html')">‹ Retour</button>
  <div class="header-title">📦 GESTION DES STOCKS</div>
  <button class="add-btn" onclick="openModal()">+</button>
</div>

<div class="tabs">
  <button class="tab active" onclick="switchTab('all')">TOUS</button>
  <button class="tab" onclick="switchTab('alert')">⚠ ALERTES</button>
  <button class="tab" onclick="switchTab('ok')">✓ OK</button>
  <button class="tab" onclick="switchTab('fournisseurs')">FOURNISSEURS</button>
</div>

<div class="tab-content active" id="tab-all">
  <div class="summary" id="summary-bar">
    <div class="sum-card"><div class="sum-val red" id="s-alert">—</div><div class="sum-label">EN ALERTE</div></div>
    <div class="sum-card"><div class="sum-val yellow" id="s-mid">—</div><div class="sum-label">MOYEN</div></div>
    <div class="sum-card"><div class="sum-val green" id="s-ok">—</div><div class="sum-label">OK</div></div>
  </div>
  <div id="stocks-list"></div>
</div>
<div class="tab-content" id="tab-alert"><div id="alert-list"></div></div>
<div class="tab-content" id="tab-ok"><div id="ok-list"></div></div>
<div class="tab-content" id="tab-fournisseurs"><div id="fournisseurs-list"></div></div>

<!-- Modal ajout/modif stock -->
<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-title" id="modal-title">AJOUTER UN ARTICLE</div>
    <div class="field"><label>Nom de l'article</label><input id="f-name" placeholder="Ex: Pommes de terre (sac 25kg)"></div>
    <div class="field"><label>Quantité actuelle</label><input id="f-qty" type="number" placeholder="Ex: 8"></div>
    <div class="field"><label>Quantité minimale (seuil alerte)</label><input id="f-min" type="number" placeholder="Ex: 3"></div>
    <div class="field"><label>Quantité maximale (stock idéal)</label><input id="f-max" type="number" placeholder="Ex: 20"></div>
    <div class="field"><label>Unité</label>
      <select id="f-unit">
        <option value="unité">Unité</option><option value="kg">Kg</option><option value="L">Litre</option>
        <option value="sac">Sac</option><option value="carton">Carton</option><option value="paquet">Paquet</option>
      </select>
    </div>
    <div class="field"><label>Fournisseur habituel (optionnel)</label><input id="f-supplier" placeholder="Ex: SARL Grossiste BF"></div>
    <div class="field"><label>Prix unitaire (FCFA)</label><input id="f-price" type="number" placeholder="Ex: 500"></div>
    <input type="hidden" id="f-id">
    <div class="modal-btns">
      <button class="modal-btn cancel" onclick="closeModal()">Annuler</button>
      <button class="modal-btn confirm" onclick="saveStock()">Sauvegarder</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  projectId:"ninja-s-fries",
};
let db, stocks=[], suppliers=[], currentTab='all';
let fbMod = null;

async function init() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    fbMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app = initializeApp(FIREBASE_CONFIG);
    db = fbMod.getFirestore(app);

    // Écoute temps réel stocks
    fbMod.onSnapshot(
      fbMod.query(fbMod.collection(db,'stocks'), fbMod.orderBy('createdAt','asc')),
      snap => { stocks = snap.docs.map(d=>({id:d.id,...d.data()})); render(); },
      () => loadDemo()
    );

    // Fournisseurs
    const fsSnap = await fbMod.getDocs(fbMod.collection(db,'suppliers'));
    suppliers = fsSnap.docs.map(d=>({id:d.id,...d.data()}));
    renderFournisseurs();
  } catch(_) { loadDemo(); }
}

function loadDemo() {
  stocks = [
    {id:'1',name:'Pommes de terre (25kg)',qty:5,min:4,max:20,unit:'sac',supplier:'SARL Grossiste BF',price:3500},
    {id:'2',name:'Huile friture (5L)',qty:12,min:5,max:30,unit:'bidon',supplier:'',price:5000},
    {id:'3',name:'Sel fin',qty:2,min:3,max:10,unit:'kg',supplier:'',price:200},
    {id:'4',name:'Sachets emballage',qty:800,min:200,max:2000,unit:'unité',supplier:'',price:5},
    {id:'5',name:'Gaz butane (6kg)',qty:3,min:2,max:8,unit:'bouteille',supplier:'Total BF',price:4500},
  ];
  render();
}

function render() {
  const low  = stocks.filter(s => s.qty <= s.min);
  const mid  = stocks.filter(s => s.qty > s.min  && s.qty < s.max * 0.5);
  const ok   = stocks.filter(s => s.qty >= s.max * 0.5);

  document.getElementById('s-alert').textContent = low.length;
  document.getElementById('s-mid').textContent   = mid.length;
  document.getElementById('s-ok').textContent    = ok.length;

  const renderCards = (list) => list.length
    ? list.map(stockCard).join('')
    : '<div class="empty">Aucun article dans cette catégorie</div>';

  document.getElementById('stocks-list').innerHTML = renderCards(stocks);
  document.getElementById('alert-list').innerHTML  = renderCards(low);
  document.getElementById('ok-list').innerHTML     = renderCards(ok);
}

function stockCard(s) {
  const pct   = Math.min(Math.round((s.qty / (s.max||1)) * 100), 100);
  const level = s.qty <= s.min ? 'low' : pct < 50 ? 'mid' : 'good';
  const emoji = level === 'low' ? '⚠️' : level === 'mid' ? '📉' : '✅';
  const cardClass = level === 'low' ? 'alert' : 'ok';
  return \`
    <div class="stock-card \${cardClass}">
      <div class="stock-icon">\${emoji}</div>
      <div class="stock-body">
        <div class="stock-name">\${s.name}</div>
        <div class="stock-meta">\${s.qty} \${s.unit} · min:\${s.min} · max:\${s.max}\${s.supplier?' · '+s.supplier:''}</div>
        <div class="stock-bar-row">
          <div class="stock-bar"><div class="stock-fill \${level}" style="width:\${pct}%"></div></div>
          <div class="stock-pct \${level}">\${pct}%</div>
        </div>
      </div>
      <div class="stock-actions">
        <button class="stock-btn" onclick="adjustQty('\${s.id}',1)">+1</button>
        <button class="stock-btn" onclick="adjustQty('\${s.id}',-1)">-1</button>
        <button class="stock-btn" onclick="editStock('\${s.id}')">✏</button>
        <button class="stock-btn del" onclick="deleteStock('\${s.id}')">✕</button>
      </div>
    </div>\`;
}

function renderFournisseurs() {
  const list = document.getElementById('fournisseurs-list');
  if (!suppliers.length) { list.innerHTML = '<div class="empty">Aucun fournisseur — Ajoutez-en dans les paramètres</div>'; return; }
  list.innerHTML = suppliers.map(s => \`
    <div class="stock-card">
      <div class="stock-icon">🏭</div>
      <div class="stock-body">
        <div class="stock-name">\${s.companyName}</div>
        <div class="stock-meta">\${s.product||''} · \${s.quality||''} · \${(s.unitPrice||0).toLocaleString('fr-FR')} FCFA/u</div>
        <div class="stock-meta" style="margin-top:2px">Délai: \${s.deliveryDelay||'?'}</div>
      </div>
    </div>\`).join('');
}

// ── Actions ──
async function adjustQty(id, delta) {
  const s = stocks.find(x=>x.id===id);
  if (!s) return;
  const newQty = Math.max(0, (s.qty||0) + delta);
  if (db && fbMod) {
    try { await fbMod.updateDoc(fbMod.doc(db,'stocks',id), {qty:newQty}); }
    catch(_) { s.qty = newQty; render(); }
  } else { s.qty = newQty; render(); }
}

async function deleteStock(id) {
  if (db && fbMod) {
    try { await fbMod.deleteDoc(fbMod.doc(db,'stocks',id)); }
    catch(_) { stocks = stocks.filter(s=>s.id!==id); render(); }
  } else { stocks = stocks.filter(s=>s.id!==id); render(); }
  toast('Article supprimé');
}

function editStock(id) {
  const s = stocks.find(x=>x.id===id);
  if (!s) return;
  document.getElementById('modal-title').textContent = 'MODIFIER L\\'ARTICLE';
  document.getElementById('f-id').value       = id;
  document.getElementById('f-name').value     = s.name||'';
  document.getElementById('f-qty').value      = s.qty||0;
  document.getElementById('f-min').value      = s.min||0;
  document.getElementById('f-max').value      = s.max||0;
  document.getElementById('f-unit').value     = s.unit||'unité';
  document.getElementById('f-supplier').value = s.supplier||'';
  document.getElementById('f-price').value    = s.price||0;
  openModal();
}

async function saveStock() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { toast('⚠ Nom requis'); return; }
  const data = {
    name, qty:num('f-qty'), min:num('f-min'), max:num('f-max'),
    unit:document.getElementById('f-unit').value,
    supplier:document.getElementById('f-supplier').value.trim(),
    price:num('f-price'),
  };
  const editId = document.getElementById('f-id').value;
  if (db && fbMod) {
    try {
      if (editId) await fbMod.updateDoc(fbMod.doc(db,'stocks',editId), data);
      else { data.createdAt = fbMod.serverTimestamp(); await fbMod.addDoc(fbMod.collection(db,'stocks'), data); }
    } catch(e) { toast('Erreur: '+e.message); return; }
  } else {
    if (editId) { const s=stocks.find(x=>x.id===editId); if(s) Object.assign(s,data); }
    else stocks.push({id:Date.now().toString(),...data});
    render();
  }
  closeModal(); toast('✓ Sauvegardé');
}

// ── Tabs ──
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active', ['all','alert','ok','fournisseurs'][i]===tab));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  currentTab = tab;
  if (tab==='fournisseurs') renderFournisseurs();
}

// ── Modal ──
function openModal() {
  if (!document.getElementById('f-id').value) {
    document.getElementById('modal-title').textContent='AJOUTER UN ARTICLE';
    ['f-id','f-name','f-qty','f-min','f-max','f-supplier','f-price'].forEach(id=>{document.getElementById(id).value='';});
    document.getElementById('f-unit').value='unité';
  }
  document.getElementById('modal').classList.add('show');
}
function closeModal() { document.getElementById('modal').classList.remove('show'); document.getElementById('f-id').value=''; }

function num(id) { return parseFloat(document.getElementById(id).value)||0; }
function toast(msg) {
  const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2400);
}

init();
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
