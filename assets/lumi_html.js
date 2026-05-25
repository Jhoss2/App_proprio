// lumi_html.js — Module HTML embarqué
// NE PAS MODIFIER — généré depuis lumi.html
const HTML = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ninja's Corp — Lumi</title>
<style>
  :root{--orange:#ff7a1a;--cyan:#00f2ff;--bg:#020810;--dark:#0a1525;--border:rgba(255,122,26,.3);}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:#e8d8c0;font-family:'Share Tech Mono',monospace;height:100vh;display:flex;flex-direction:column;overflow:hidden;}

  .header{display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);background:rgba(0,0,0,.8);gap:12px;flex-shrink:0;}
  .back-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:6px 14px;font-family:inherit;font-size:14px;cursor:pointer;border-radius:2px;}
  .lumi-avatar{width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff9944,#cc4400);border:2px solid var(--orange);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
  .lumi-title{flex:1;}
  .lumi-name{font-size:15px;font-weight:900;color:var(--orange);letter-spacing:2px;}
  .lumi-sub{font-size:9px;color:var(--cyan);letter-spacing:1px;}
  .lumi-status{width:8px;height:8px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px #00ff88;}

  /* Chat */
  .chat-zone{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;}
  .chat-zone::-webkit-scrollbar{width:3px;}
  .chat-zone::-webkit-scrollbar-thumb{background:var(--border);}

  .bubble{max-width:80%;padding:10px 14px;border-radius:3px;font-size:13px;line-height:1.5;}
  .bubble.lumi{align-self:flex-start;background:rgba(255,122,26,.12);border:1px solid rgba(255,122,26,.3);border-left:3px solid var(--orange);}
  .bubble.user{align-self:flex-end;background:rgba(0,242,255,.08);border:1px solid rgba(0,242,255,.2);border-right:3px solid var(--cyan);}
  .bubble .sender{font-size:9px;font-weight:900;letter-spacing:1px;margin-bottom:5px;opacity:.7;}
  .bubble.lumi .sender{color:var(--orange);}
  .bubble.user  .sender{color:var(--cyan);text-align:right;}
  .bubble .time{font-size:9px;opacity:.4;margin-top:4px;}
  .bubble.user .time{text-align:right;}

  /* Alertes système (petites cartes) */
  .alert-card{display:flex;gap:10px;padding:8px 12px;border-radius:2px;border:1px solid;font-size:11px;align-items:flex-start;}
  .alert-card.critique{border-color:rgba(255,50,50,.4);background:rgba(255,50,50,.06);}
  .alert-card.alerte{border-color:rgba(255,200,0,.4);background:rgba(255,200,0,.06);}
  .alert-card.systeme{border-color:rgba(0,242,255,.3);background:rgba(0,242,255,.05);}
  .alert-card.message{border-color:rgba(0,255,100,.3);background:rgba(0,255,100,.05);}
  .alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:2px;}
  .critique .alert-dot{background:#ff3333;}
  .alerte   .alert-dot{background:#ffcc00;}
  .systeme  .alert-dot{background:var(--cyan);}
  .message  .alert-dot{background:#00ff88;}
  .alert-body .alert-title{font-weight:900;margin-bottom:2px;}
  .alert-body .alert-msg{opacity:.8;line-height:1.4;}
  .alert-body .alert-time{opacity:.4;font-size:9px;margin-top:3px;}

  /* Indicateur typing */
  .typing{align-self:flex-start;padding:8px 14px;display:flex;gap:4px;align-items:center;}
  .typing span{width:6px;height:6px;border-radius:50%;background:var(--orange);animation:blink 1.2s infinite;}
  .typing span:nth-child(2){animation-delay:.2s;}
  .typing span:nth-child(3){animation-delay:.4s;}
  @keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}

  /* Input zone */
  .input-zone{display:flex;gap:8px;padding:10px 14px;border-top:1px solid var(--border);background:rgba(0,0,0,.6);flex-shrink:0;}
  .chat-input{flex:1;background:#050e1a;border:1px solid var(--border);color:#e8d8c0;padding:9px 12px;font-family:inherit;font-size:13px;border-radius:2px;outline:none;transition:.2s;}
  .chat-input:focus{border-color:var(--orange);}
  .send-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:9px 16px;font-family:inherit;font-size:13px;cursor:pointer;border-radius:2px;font-weight:900;transition:.2s;}
  .send-btn:hover{background:rgba(255,122,26,.15);}

  /* Raccourcis rapides */
  .quick-btns{display:flex;gap:6px;padding:6px 14px;overflow-x:auto;scrollbar-width:none;flex-shrink:0;border-top:1px solid rgba(255,122,26,.1);}
  .quick-btns::-webkit-scrollbar{display:none;}
  .quick-btn{background:none;border:1px solid rgba(255,122,26,.25);color:rgba(255,122,26,.7);padding:5px 10px;font-family:inherit;font-size:10px;cursor:pointer;border-radius:2px;white-space:nowrap;transition:.2s;flex-shrink:0;}
  .quick-btn:hover{border-color:var(--orange);color:var(--orange);}
</style>
</head>
<body>

<div class="header">
  <button class="back-btn" onclick="window._navigateTo('dashboard.html')">‹ Retour</button>
  <div class="lumi-avatar">🤖</div>
  <div class="lumi-title">
    <div class="lumi-name">LUMI</div>
    <div class="lumi-sub">BUREAU D'ASSISTANCE IA</div>
  </div>
  <div class="lumi-status" id="lumi-status"></div>
</div>

<div class="chat-zone" id="chat"></div>

<div class="quick-btns">
  <button class="quick-btn" onclick="quickAsk('Quel est le chiffre d\\'affaires total aujourd\\'hui ?')">💰 C.A. aujourd'hui</button>
  <button class="quick-btn" onclick="quickAsk('Montre-moi les performances de chaque chariot')">📊 Performances carts</button>
  <button class="quick-btn" onclick="quickAsk('Y a-t-il des alertes en cours ?')">⚠ Alertes</button>
  <button class="quick-btn" onclick="quickAsk('Quel chariot est le plus performant cette semaine ?')">🏆 Meilleur cart</button>
  <button class="quick-btn" onclick="quickAsk('Résume les notifications récentes')">📋 Notifications</button>
  <button class="quick-btn" onclick="quickAsk('Combien de ventes ont été effectuées aujourd\\'hui ?')">🛒 Ventes du jour</button>
</div>

<div class="input-zone">
  <input class="chat-input" id="chat-input" placeholder="Posez une question à Lumi..." onkeydown="if(event.key==='Enter')sendMsg()">
  <button class="send-btn" onclick="sendMsg()">ENVOYER</button>
</div>

<script>
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  projectId:"ninja-s-fries",
};

// Données contextuelles chargées depuis Firestore
const CTX = { carts:[], notifications:[], goals:{}, totalCA:0, totalOrders:0 };
let fbReady = false;

// ── Init Firebase + chargement données ──
async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc } =
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

    const app = initializeApp(FIREBASE_CONFIG);
    const db  = getFirestore(app);

    // Charger objectifs
    const goalSnap = await getDoc(doc(db,'config','goals'));
    if (goalSnap.exists()) CTX.goals = goalSnap.data();

    // Charger carts
    const cartsSnap = await getDocs(query(collection(db,'carts'), orderBy('createdAt','asc')));
    CTX.carts = cartsSnap.docs.map(d => ({ id:d.id, ...d.data() }));
    CTX.totalCA     = CTX.carts.reduce((s,c) => s+(c.todayTotal||0), 0);
    CTX.totalOrders = CTX.carts.reduce((s,c) => s+(c.todayOrders||0), 0);

    // Charger notifications récentes
    const notifSnap = await getDocs(query(collection(db,'notifications'), orderBy('timestamp','desc'), limit(10)));
    CTX.notifications = notifSnap.docs.map(d => d.data());

    fbReady = true;
    document.getElementById('lumi-status').style.background = '#00ff88';

    // Afficher les notifications récentes comme cards
    displaySystemAlerts();
    lumiSay('Bonjour ! Je suis **LUMI**, votre assistant IA Ninja\\'s Corp. J\\'ai chargé les données de ' + CTX.carts.length + ' chariot(s). C.A. total aujourd\\'hui : **' + CTX.totalCA.toLocaleString('fr-FR') + ' FCFA** | Ventes : **' + CTX.totalOrders + '**. Comment puis-je vous aider ?');
  } catch(e) {
    document.getElementById('lumi-status').style.background = '#ffcc00';
    lumiSay('Mode hors-ligne — je fonctionne avec les données en cache. ' + e.message);
  }
}

// ── Affichage des alertes système ──
function displaySystemAlerts() {
  const alerts = CTX.notifications.slice(0, 5);
  if (!alerts.length) return;
  const container = document.getElementById('chat');
  alerts.forEach(n => {
    const div = document.createElement('div');
    const type = (n.type || 'systeme').toLowerCase();
    div.className = 'alert-card ' + type;
    div.innerHTML = \`
      <div class="alert-dot"></div>
      <div class="alert-body">
        <div class="alert-title">\${n.title || n.titre || n.type || 'SYSTÈME'}</div>
        <div class="alert-msg">\${n.message || ''}</div>
        <div class="alert-time">\${n.timestamp ? new Date(n.timestamp.seconds*1000).toLocaleString('fr-FR') : ''}</div>
      </div>\`;
    container.appendChild(div);
  });
  scrollChat();
}

// ── Lumi parle ──
function lumiSay(text) {
  // Retirer typing indicator
  const typing = document.getElementById('lumi-typing');
  if (typing) typing.remove();

  const div = document.createElement('div');
  div.className = 'bubble lumi';
  const now = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  // Convertir **texte** en gras
  const formatted = text.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong style="color:var(--orange)">$1</strong>');
  div.innerHTML = \`<div class="sender">LUMI</div><div>\${formatted}</div><div class="time">\${now}</div>\`;
  document.getElementById('chat').appendChild(div);
  scrollChat();
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing'; div.id = 'lumi-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  document.getElementById('chat').appendChild(div);
  scrollChat();
}

// ── Message utilisateur ──
function sendMsg() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';

  // Bulle utilisateur
  const div = document.createElement('div');
  div.className = 'bubble user';
  const now = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  div.innerHTML = \`<div class="sender">VOUS</div><div>\${text}</div><div class="time">\${now}</div>\`;
  document.getElementById('chat').appendChild(div);
  scrollChat();

  // Réponse Lumi
  showTyping();
  setTimeout(() => processQuestion(text), 900 + Math.random()*600);
}

function quickAsk(q) {
  document.getElementById('chat-input').value = q;
  sendMsg();
}

// ── Traitement des questions (logique locale) ──
function processQuestion(q) {
  const ql = q.toLowerCase();
  let response = '';

  if (ql.includes('chiffre') || ql.includes('ca') || ql.includes('affaire')) {
    const pct = CTX.goals.dailyCAGoal > 0
      ? Math.round((CTX.totalCA / CTX.goals.dailyCAGoal / Math.max(CTX.carts.length,1)) * 100) : 0;
    response = \`**C.A. total aujourd'hui : \${CTX.totalCA.toLocaleString('fr-FR')} FCFA**\\n\\n\`;
    CTX.carts.forEach(c => {
      const cp = CTX.goals.dailyCAGoal > 0 ? Math.round(((c.todayTotal||0)/(c.dailyCAGoal||CTX.goals.dailyCAGoal||1))*100) : 0;
      response += \`• \${c.cartName||c.id} : \${(c.todayTotal||0).toLocaleString('fr-FR')} FCFA (\${cp}%)\\n\`;
    });
    response += \`\\nObjectif journalier moyen : **\${pct}%** atteint.\`;
  }
  else if (ql.includes('vente') || ql.includes('commande')) {
    response = \`**Ventes totales aujourd'hui : \${CTX.totalOrders} commandes**\\n\\n\`;
    CTX.carts.forEach(c => {
      const cp = (c.dailyGoalCmd||CTX.goals.dailyCmdGoal||1) > 0
        ? Math.round(((c.todayOrders||0)/(c.dailyGoalCmd||CTX.goals.dailyCmdGoal||1))*100) : 0;
      response += \`• \${c.cartName||c.id} : \${c.todayOrders||0} ventes (\${cp}% de l'objectif)\\n\`;
    });
  }
  else if (ql.includes('alert') || ql.includes('problème') || ql.includes('urgent')) {
    if (CTX.notifications.length === 0) {
      response = 'Aucune alerte en cours. Tous les systèmes sont opérationnels. ✓';
    } else {
      response = \`**\${CTX.notifications.length} notification(s) récente(s) :**\\n\\n\`;
      CTX.notifications.slice(0,5).forEach(n => {
        response += \`• [\${n.type||'INFO'}] \${n.title||n.titre||''} — \${n.message||''}\\n\`;
      });
    }
  }
  else if (ql.includes('meilleur') || ql.includes('performant') || ql.includes('top')) {
    if (!CTX.carts.length) { response = 'Aucun chariot enregistré.'; }
    else {
      const best = [...CTX.carts].sort((a,b)=>(b.todayTotal||0)-(a.todayTotal||0))[0];
      response = \`🏆 **\${best.cartName||best.id}** est le plus performant aujourd'hui avec **\${(best.todayTotal||0).toLocaleString('fr-FR')} FCFA** de C.A. et **\${best.todayOrders||0} ventes**.\`;
    }
  }
  else if (ql.includes('notification') || ql.includes('résume') || ql.includes('dernière')) {
    if (!CTX.notifications.length) response = 'Aucune notification récente.';
    else {
      response = \`**Dernières notifications :**\\n\\n\`;
      CTX.notifications.slice(0,5).forEach(n => {
        response += \`• \${n.title||n.titre||n.type} : \${n.message||''}\\n\`;
      });
    }
  }
  else if (ql.includes('performance') || ql.includes('chariot') || ql.includes('cart')) {
    if (!CTX.carts.length) response = 'Aucun chariot enregistré dans l\\'application.';
    else {
      response = \`**Performance des chariots aujourd'hui :**\\n\\n\`;
      CTX.carts.forEach(c => {
        const caPct  = (c.dailyCAGoal||CTX.goals.dailyCAGoal||1)>0 ? Math.round(((c.todayTotal||0)/(c.dailyCAGoal||CTX.goals.dailyCAGoal||1))*100) : 0;
        const cmdPct = (c.dailyGoalCmd||CTX.goals.dailyCmdGoal||1)>0 ? Math.round(((c.todayOrders||0)/(c.dailyGoalCmd||CTX.goals.dailyCmdGoal||1))*100) : 0;
        const status = c.updatedAt && (Date.now()/1000 - (c.updatedAt.seconds||0)) < 300 ? '🟢' : '🔴';
        response += \`\${status} **\${c.cartName||c.id}** — C.A: \${caPct}% | Ventes: \${cmdPct}%\\n\`;
      });
    }
  }
  else if (ql.includes('objectif') || ql.includes('annuel') || ql.includes('mensuel')) {
    const afg = CTX.goals.annualFinancialGoal||0;
    const mfg = CTX.goals.monthlyFinancialGoal||0;
    const totalAnnual = CTX.carts.reduce((s,c)=>s+(c.annualTotal||0),0);
    const annPct = afg>0 ? Math.round((totalAnnual/afg)*100) : 0;
    response = \`**Objectifs :**\\n• Annuel (AFG) : \${afg.toLocaleString('fr-FR')} FCFA\\n• Mensuel (MFG) : \${mfg.toLocaleString('fr-FR')} FCFA\\n• C.A. journalier/cart : \${(CTX.goals.dailyCAGoal||0).toLocaleString('fr-FR')} FCFA\\n\\n**Évolution annuelle : \${annPct}%** (\${totalAnnual.toLocaleString('fr-FR')} / \${afg.toLocaleString('fr-FR')} FCFA)\`;
  }
  else {
    const responses = [
      'Je n\\'ai pas de données spécifiques sur ce sujet pour l\\'instant. Essayez de demander le C.A. du jour, les performances des chariots, ou les alertes récentes.',
      'Pouvez-vous reformuler ? Je peux vous donner des infos sur : le C.A. du jour, les ventes, les alertes, les objectifs ou les performances des chariots.',
      'Je suis en apprentissage continu ! Pour l\\'instant, je maîtrise l\\'analyse des ventes, du C.A., des alertes et des performances des chariots.',
    ];
    response = responses[Math.floor(Math.random()*responses.length)];
  }

  lumiSay(response.replace(/\\n/g, '<br>'));
}

function scrollChat() {
  const c = document.getElementById('chat');
  setTimeout(() => { c.scrollTop = c.scrollHeight; }, 50);
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
