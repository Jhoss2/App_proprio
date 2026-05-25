// recompenses_html.js — Module HTML embarqué
// NE PAS MODIFIER — généré depuis recompenses.html
const HTML = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ninja's Corp — Récompenses</title>
<style>
  :root{--orange:#ff7a1a;--cyan:#00f2ff;--bg:#020810;--dark:#0a1525;--border:rgba(255,122,26,.3);}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:#e8d8c0;font-family:'Share Tech Mono',monospace;height:100vh;display:flex;flex-direction:column;overflow:hidden;}
  .header{display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);background:rgba(0,0,0,.8);gap:12px;flex-shrink:0;}
  .back-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:6px 14px;font-family:inherit;font-size:14px;cursor:pointer;border-radius:2px;}
  .header-title{flex:1;font-size:16px;font-weight:900;letter-spacing:2px;color:var(--orange);}
  .scroll{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;}
  .scroll::-webkit-scrollbar{width:3px;}
  .scroll::-webkit-scrollbar-thumb{background:var(--border);}

  /* Podium */
  .podium{display:flex;align-items:flex-end;justify-content:center;gap:8px;padding:16px 0;height:160px;}
  .podium-place{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;max-width:120px;}
  .podium-block{width:100%;border-radius:3px 3px 0 0;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid;}
  .podium-place:nth-child(1) .podium-block{height:110px;background:rgba(255,200,0,.15);border-color:#ffd700;box-shadow:0 0 20px rgba(255,200,0,.3);}
  .podium-place:nth-child(2) .podium-block{height:80px;background:rgba(255,122,26,.12);border-color:var(--orange);}
  .podium-place:nth-child(3) .podium-block{height:55px;background:rgba(0,242,255,.08);border-color:var(--cyan);}
  .podium-name{font-size:10px;font-weight:900;letter-spacing:1px;text-align:center;}
  .podium-val{font-size:9px;color:#667788;text-align:center;}
  .podium-place:nth-child(1) .podium-name{color:#ffd700;}
  .podium-place:nth-child(2) .podium-name{color:var(--orange);}
  .podium-place:nth-child(3) .podium-name{color:var(--cyan);}

  /* Médailles */
  .medals-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .medal-card{background:var(--dark);border:1px solid var(--border);border-radius:3px;padding:12px;display:flex;gap:10px;align-items:center;}
  .medal-card.gold  {border-color:rgba(255,200,0,.4);}
  .medal-card.silver{border-color:rgba(200,200,220,.3);}
  .medal-card.bronze{border-color:rgba(200,120,60,.3);}
  .medal-card.special{border-color:rgba(0,242,255,.3);}
  .medal-icon{font-size:26px;flex-shrink:0;}
  .medal-body{}
  .medal-title{font-size:11px;font-weight:900;letter-spacing:.5px;margin-bottom:3px;}
  .medal-card.gold   .medal-title{color:#ffd700;}
  .medal-card.silver .medal-title{color:#c8c8dc;}
  .medal-card.bronze .medal-title{color:#c87840;}
  .medal-card.special .medal-title{color:var(--cyan);}
  .medal-holder{font-size:12px;font-weight:900;color:#e8d8c0;}
  .medal-val{font-size:10px;color:#667788;margin-top:2px;}

  /* Classement table */
  .rank-table{background:var(--dark);border:1px solid var(--border);border-radius:3px;overflow:hidden;}
  .rank-header{display:grid;grid-template-columns:30px 1fr 80px 70px 60px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:10px;color:#667788;font-weight:900;letter-spacing:.5px;}
  .rank-row{display:grid;grid-template-columns:30px 1fr 80px 70px 60px;padding:9px 12px;border-bottom:1px solid rgba(255,122,26,.06);align-items:center;transition:.15s;}
  .rank-row:last-child{border-bottom:none;}
  .rank-row:hover{background:rgba(255,122,26,.04);}
  .rank-row.rank-1{background:rgba(255,200,0,.04);}
  .rank-num{font-size:12px;font-weight:900;}
  .rank-row.rank-1 .rank-num{color:#ffd700;}
  .rank-row.rank-2 .rank-num{color:#c8c8dc;}
  .rank-row.rank-3 .rank-num{color:#c87840;}
  .rank-name{font-size:12px;font-weight:900;}
  .rank-ca{font-size:11px;color:var(--orange);}
  .rank-cmd{font-size:11px;color:var(--cyan);}
  .rank-badge{font-size:9px;padding:2px 6px;border-radius:2px;text-align:center;}
  .rank-badge.sold{background:rgba(255,50,50,.2);color:#ff5555;border:1px solid rgba(255,50,50,.3);}
  .rank-badge.top{background:rgba(0,242,255,.1);color:var(--cyan);border:1px solid rgba(0,242,255,.2);}
  .rank-badge.ok{background:rgba(255,122,26,.1);color:var(--orange);border:1px solid rgba(255,122,26,.2);}

  /* Objectifs progress */
  .obj-card{background:var(--dark);border:1px solid var(--border);border-radius:3px;padding:12px;}
  .obj-card-title{font-size:10px;color:rgba(255,122,26,.7);letter-spacing:1px;font-weight:900;margin-bottom:10px;}
  .obj-row{margin-bottom:10px;}
  .obj-label{display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;}
  .obj-label span:first-child{color:#667788;}
  .obj-label span:last-child{font-weight:900;}
  .obj-bar{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;}
  .obj-fill{height:100%;border-radius:3px;}
  .obj-fill.gold  {background:linear-gradient(90deg,#cc8800,#ffd700);}
  .obj-fill.orange{background:linear-gradient(90deg,#ff4400,#ff8800);}
  .obj-fill.cyan  {background:linear-gradient(90deg,#0077ff,#00d4ff);}

  .section-title-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .section-title{font-size:11px;font-weight:900;color:var(--orange);letter-spacing:1px;}
  .period-badge{font-size:9px;color:#667788;border:1px solid var(--border);padding:2px 8px;border-radius:2px;}
</style>
</head>
<body>

<div class="header">
  <button class="back-btn" onclick="window._navigateTo('dashboard.html')">‹ Retour</button>
  <div class="header-title">🏆 TABLEAU DE RÉCOMPENSES</div>
</div>

<div class="scroll" id="scroll-content">
  <div style="text-align:center;color:#667788;padding:20px;font-size:12px">Chargement des données...</div>
</div>

<script>
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  projectId:"ninja-s-fries",
};
let carts=[], goals={};

async function init() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getFirestore, collection, query, orderBy, getDocs, doc, getDoc, onSnapshot } =
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app = initializeApp(FIREBASE_CONFIG);
    const db  = getFirestore(app);
    const gSnap = await getDoc(doc(db,'config','goals'));
    if (gSnap.exists()) goals = gSnap.data();

    onSnapshot(query(collection(db,'carts'), orderBy('createdAt','asc')), snap => {
      carts = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      render();
    });
  } catch(e) {
    // Démo
    goals = { annualFinancialGoal:18000000, dailyCAGoal:50000, dailyCmdGoal:30, rewardSoldout:100, bonusSoldout:5000 };
    carts = [
      {id:'c1',cartName:'CART 01',todayTotal:48500,todayOrders:29,annualTotal:3200000},
      {id:'c2',cartName:'CART 02',todayTotal:52000,todayOrders:33,annualTotal:3800000},
      {id:'c3',cartName:'CART 03',todayTotal:41000,todayOrders:25,annualTotal:2900000},
    ];
    render();
  }
}

function render() {
  const sorted = [...carts].sort((a,b) => (b.todayTotal||0) - (a.todayTotal||0));
  const caGoal  = goals.dailyCAGoal  || 50000;
  const cmdGoal = goals.dailyCmdGoal || 30;
  const afg     = goals.annualFinancialGoal || 0;
  const soldoutThreshold = (goals.rewardSoldout || 100) / 100;

  const totalAnnual = carts.reduce((s,c)=>s+(c.annualTotal||0),0);
  const totalCA     = carts.reduce((s,c)=>s+(c.todayTotal||0),0);
  const totalCmd    = carts.reduce((s,c)=>s+(c.todayOrders||0),0);
  const annPct      = afg > 0 ? Math.min(Math.round((totalAnnual/afg)*100),100) : 0;

  const podiumCarts = sorted.slice(0,3);
  const podiumEmojis = ['👑','🥈','🥉'];

  // ── Podium ──
  const podiumHtml = \`
    <div class="section-title-row">
      <span class="section-title">PODIUM DU JOUR</span>
      <span class="period-badge">\${new Date().toLocaleDateString('fr-FR')}</span>
    </div>
    <div class="podium">
      \${[podiumCarts[1],podiumCarts[0],podiumCarts[2]].map((c,i) => c ? \`
        <div class="podium-place" style="order:\${i===1?0:i===0?1:2}">
          <div class="podium-block">\${podiumEmojis[i===1?0:i===0?1:2]}</div>
          <div class="podium-name">\${(c.cartName||c.id).toUpperCase()}</div>
          <div class="podium-val">\${(c.todayTotal||0).toLocaleString('fr-FR')} FCFA</div>
        </div>\` : '').join('')}
    </div>\`;

  // ── Médailles ──
  const bestCA  = sorted[0];
  const bestCmd = [...carts].sort((a,b)=>(b.todayOrders||0)-(a.todayOrders||0))[0];
  const soldOut = carts.filter(c => (c.todayTotal||0) >= caGoal * soldoutThreshold);
  const bestAnn = [...carts].sort((a,b)=>(b.annualTotal||0)-(a.annualTotal||0))[0];

  const medalsHtml = \`
    <div class="section-title-row"><span class="section-title">MÉDAILLES</span></div>
    <div class="medals-grid">
      <div class="medal-card gold">
        <div class="medal-icon">🏆</div>
        <div class="medal-body">
          <div class="medal-title">RECORD DESTROYER</div>
          <div class="medal-holder">\${bestCA ? (bestCA.cartName||bestCA.id).toUpperCase() : '—'}</div>
          <div class="medal-val">\${bestCA ? (bestCA.todayTotal||0).toLocaleString('fr-FR')+' FCFA' : ''}</div>
        </div>
      </div>
      <div class="medal-card silver">
        <div class="medal-icon">⚡</div>
        <div class="medal-body">
          <div class="medal-title">GAME CHANGER</div>
          <div class="medal-holder">\${bestCmd ? (bestCmd.cartName||bestCmd.id).toUpperCase() : '—'}</div>
          <div class="medal-val">\${bestCmd ? bestCmd.todayOrders+' ventes' : ''}</div>
        </div>
      </div>
      <div class="medal-card bronze">
        <div class="medal-icon">🔥</div>
        <div class="medal-body">
          <div class="medal-title">SOLD OUT ×\${soldOut.length}</div>
          <div class="medal-holder">\${soldOut.length > 0 ? soldOut.map(c=>(c.cartName||c.id).toUpperCase()).join(', ') : 'Aucun'}</div>
          <div class="medal-val">+\${(goals.bonusSoldout||5000).toLocaleString('fr-FR')} FCFA/cart</div>
        </div>
      </div>
      <div class="medal-card special">
        <div class="medal-icon">⭐</div>
        <div class="medal-body">
          <div class="medal-title">BEST CART (ANNUEL)</div>
          <div class="medal-holder">\${bestAnn ? (bestAnn.cartName||bestAnn.id).toUpperCase() : '—'}</div>
          <div class="medal-val">\${bestAnn ? (bestAnn.annualTotal||0).toLocaleString('fr-FR')+' FCFA' : ''}</div>
        </div>
      </div>
    </div>\`;

  // ── Classement ──
  const rankHtml = \`
    <div class="section-title-row"><span class="section-title">CLASSEMENT COMPLET</span></div>
    <div class="rank-table">
      <div class="rank-header"><span>#</span><span>CHARIOT</span><span>C.A.</span><span>VENTES</span><span>STATUT</span></div>
      \${sorted.map((c,i) => {
        const caPct  = Math.min(Math.round(((c.todayTotal||0)/caGoal)*100),100);
        const isSold = (c.todayTotal||0) >= caGoal * soldoutThreshold;
        const badge  = isSold ? '<span class="rank-badge sold">SOLD OUT</span>'
                    : caPct >= 85 ? '<span class="rank-badge top">TOP</span>'
                    : '<span class="rank-badge ok">' + caPct + '%</span>';
        return \`<div class="rank-row rank-\${i+1}">
          <span class="rank-num">\${i+1}</span>
          <span class="rank-name">\${(c.cartName||c.id).toUpperCase()}</span>
          <span class="rank-ca">\${(c.todayTotal||0).toLocaleString('fr-FR')}</span>
          <span class="rank-cmd">\${c.todayOrders||0}</span>
          <span>\${badge}</span>
        </div>\`;
      }).join('')}
    </div>\`;

  // ── Objectifs globaux ──
  const totalCAPct  = carts.length > 0 ? Math.min(Math.round((totalCA  / (caGoal  * carts.length)) * 100), 100) : 0;
  const totalCmdPct = carts.length > 0 ? Math.min(Math.round((totalCmd / (cmdGoal * carts.length)) * 100), 100) : 0;
  const objHtml = \`
    <div class="obj-card">
      <div class="obj-card-title">📊 PROGRESSION GLOBALE</div>
      <div class="obj-row">
        <div class="obj-label"><span>Objectif annuel (AFG)</span><span style="color:#ffd700">\${annPct}%</span></div>
        <div class="obj-bar"><div class="obj-fill gold" style="width:\${annPct}%"></div></div>
      </div>
      <div class="obj-row">
        <div class="obj-label"><span>C.A. journalier global</span><span style="color:var(--orange)">\${totalCAPct}%</span></div>
        <div class="obj-bar"><div class="obj-fill orange" style="width:\${totalCAPct}%"></div></div>
      </div>
      <div class="obj-row">
        <div class="obj-label"><span>Commandes journalier global</span><span style="color:var(--cyan)">\${totalCmdPct}%</span></div>
        <div class="obj-bar"><div class="obj-fill cyan" style="width:\${totalCmdPct}%"></div></div>
      </div>
    </div>\`;

  document.getElementById('scroll-content').innerHTML =
    podiumHtml + medalsHtml + rankHtml + objHtml;
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
