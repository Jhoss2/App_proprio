// cart_profile_html.js — Module HTML embarqué
// NE PAS MODIFIER — généré depuis cart_profile.html
const HTML = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ninja's Corp — Profil Cart</title>
<style>
  :root{--orange:#ff7a1a;--cyan:#00f2ff;--bg:#020810;--dark:#0a1525;--border:rgba(255,122,26,.3);}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:#e8d8c0;font-family:'Share Tech Mono',monospace;height:100vh;display:flex;flex-direction:column;overflow:hidden;}
  .header{display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);background:rgba(0,0,0,.8);gap:12px;flex-shrink:0;}
  .back-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:6px 14px;font-family:inherit;font-size:14px;cursor:pointer;border-radius:2px;}
  .header-title{flex:1;font-size:16px;font-weight:900;letter-spacing:2px;color:var(--orange);}
  .status-dot{width:10px;height:10px;border-radius:50%;background:#ff3300;box-shadow:0 0 8px currentColor;}

  .body{flex:1;display:flex;overflow:hidden;}

  /* Panneau gauche — vidéo/3D */
  .panel-media{width:55%;border-right:1px solid var(--border);display:flex;flex-direction:column;background:#000;}
  .media-zone{flex:1;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;}
  .media-zone video{width:100%;height:100%;object-fit:cover;}
  .media-zone .placeholder{display:flex;flex-direction:column;align-items:center;gap:12px;opacity:.5;}
  .media-zone .placeholder svg{width:60px;height:60px;fill:var(--orange);}
  .media-zone .placeholder span{font-size:13px;letter-spacing:1px;}
  .media-overlay{position:absolute;top:0;left:0;right:0;padding:8px 12px;background:linear-gradient(to bottom,rgba(0,0,0,.7),transparent);display:flex;justify-content:space-between;align-items:center;}
  .live-badge{font-size:9px;font-weight:900;padding:2px 8px;border-radius:2px;background:rgba(255,50,50,.3);border:1px solid #ff3333;color:#ff5555;letter-spacing:1px;}
  .live-badge.on{background:rgba(255,50,50,.5);color:#ff3333;animation:pulse-badge .8s infinite alternate;}
  @keyframes pulse-badge{0%{opacity:1}100%{opacity:.4}}
  .media-controls{display:flex;gap:6px;padding:8px 12px;border-top:1px solid rgba(255,122,26,.15);background:rgba(0,0,0,.6);}
  .ctrl{background:none;border:1px solid var(--border);color:var(--orange);padding:5px 10px;font-family:inherit;font-size:11px;cursor:pointer;border-radius:2px;transition:.2s;}
  .ctrl:hover{border-color:var(--orange);background:rgba(255,122,26,.1);}
  .ctrl.active{background:rgba(255,122,26,.2);border-color:var(--orange);}

  /* Panneau droit — stats */
  .panel-stats{flex:1;overflow-y:auto;padding:14px;}
  .panel-stats::-webkit-scrollbar{width:3px;}
  .panel-stats::-webkit-scrollbar-thumb{background:var(--border);}

  .stat-card{background:var(--dark);border:1px solid var(--border);border-radius:3px;padding:12px;margin-bottom:10px;}
  .stat-card-title{font-size:10px;color:rgba(255,122,26,.7);letter-spacing:1px;margin-bottom:8px;font-weight:900;}
  .stat-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,122,26,.08);}
  .stat-row:last-child{border-bottom:none;}
  .stat-label{font-size:11px;color:#667788;}
  .stat-val{font-size:14px;font-weight:900;color:#e8d8c0;}
  .stat-val.orange{color:var(--orange);}
  .stat-val.cyan{color:var(--cyan);}
  .stat-val.green{color:#00ff88;}
  .stat-val.red{color:#ff5533;}

  /* Barre progression */
  .progress-bar{height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-top:4px;}
  .progress-fill{height:100%;border-radius:3px;transition:width .6s ease;}
  .progress-fill.orange{background:linear-gradient(90deg,#ff8800,#ff4400);}
  .progress-fill.cyan{background:linear-gradient(90deg,#00d4ff,#0077ff);}

  /* Historique mini */
  .history-bar{display:flex;align-items:flex-end;gap:2px;height:40px;padding-top:6px;}
  .h-bar{flex:1;background:rgba(255,122,26,.3);border-radius:1px 1px 0 0;min-height:2px;transition:height .4s ease;}
  .h-bar.today{background:var(--orange);}

  /* Config cart */
  .field{margin-bottom:10px;}
  .field label{display:block;font-size:10px;color:#667788;margin-bottom:4px;}
  .field input{width:100%;background:#050e1a;color:#e8d8c0;border:1px solid var(--border);border-radius:2px;padding:7px 9px;font-family:inherit;font-size:12px;outline:none;}
  .field input:focus{border-color:var(--orange);}
  .save-btn{background:none;border:1px solid var(--cyan);color:var(--cyan);padding:8px;width:100%;font-family:inherit;font-size:12px;cursor:pointer;border-radius:2px;margin-top:6px;font-weight:900;}
  .save-btn:hover{background:rgba(0,242,255,.08);}

  .toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,242,255,.15);border:1px solid var(--cyan);color:var(--cyan);padding:6px 16px;font-size:11px;border-radius:2px;opacity:0;transition:.3s;pointer-events:none;z-index:99;}
  .toast.show{opacity:1;}
</style>
</head>
<body>

<div class="header">
  <button class="back-btn" onclick="window._navigateTo('dashboard.html')">‹ Retour</button>
  <div class="header-title" id="cart-title">PROFIL CART</div>
  <div class="status-dot" id="status-dot"></div>
</div>

<div class="body">
  <!-- Média -->
  <div class="panel-media">
    <div class="media-zone" id="media-zone">
      <div class="media-overlay">
        <span id="cam-label" style="font-size:11px;font-weight:900;color:var(--orange)">CAMÉRA</span>
        <span class="live-badge" id="live-badge">● OFFLINE</span>
      </div>
      <div class="placeholder" id="media-placeholder">
        <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        <span>CAMÉRA NON DISPONIBLE</span>
      </div>
      <video id="live-video" autoplay playsinline muted style="display:none;width:100%;height:100%;object-fit:cover;"></video>
      <video id="model-video" loop playsinline muted style="display:none;width:100%;height:100%;object-fit:contain;"></video>
    </div>
    <div class="media-controls">
      <button class="ctrl" onclick="switchView('cam')" id="btn-cam">📷 Live</button>
      <button class="ctrl active" onclick="switchView('model')" id="btn-model">🎬 Modèle 3D</button>
      <button class="ctrl" onclick="toggleMute()" id="btn-mute">🔇 Audio</button>
      <button class="ctrl" onclick="goLive()">📡 Plein écran</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="panel-stats">
    <!-- Chiffres du jour -->
    <div class="stat-card">
      <div class="stat-card-title">📊 AUJOURD'HUI</div>
      <div class="stat-row"><span class="stat-label">Chiffre d'affaires</span><span class="stat-val orange" id="s-ca">—</span></div>
      <div class="progress-bar"><div class="progress-fill orange" id="p-ca" style="width:0%"></div></div>
      <div class="stat-row" style="margin-top:8px"><span class="stat-label">Commandes</span><span class="stat-val cyan" id="s-cmd">—</span></div>
      <div class="progress-bar"><div class="progress-fill cyan" id="p-cmd" style="width:0%"></div></div>
    </div>

    <!-- Objectifs -->
    <div class="stat-card">
      <div class="stat-card-title">🎯 OBJECTIFS JOURNALIERS</div>
      <div class="stat-row"><span class="stat-label">C.A. cible</span><span class="stat-val" id="s-goal-ca">—</span></div>
      <div class="stat-row"><span class="stat-label">Ventes cibles</span><span class="stat-val" id="s-goal-cmd">—</span></div>
      <div class="stat-row"><span class="stat-label">Avancement C.A.</span><span class="stat-val orange" id="s-pct-ca">—</span></div>
      <div class="stat-row"><span class="stat-label">Avancement ventes</span><span class="stat-val cyan" id="s-pct-cmd">—</span></div>
    </div>

    <!-- Cumul annuel -->
    <div class="stat-card">
      <div class="stat-card-title">📅 CUMUL ANNUEL</div>
      <div class="stat-row"><span class="stat-label">C.A. annuel</span><span class="stat-val" id="s-annual">—</span></div>
      <div class="stat-row"><span class="stat-label">Statut connexion</span><span class="stat-val" id="s-status">—</span></div>
    </div>

    <!-- Historique 7 jours -->
    <div class="stat-card">
      <div class="stat-card-title">📈 HISTORIQUE 7 JOURS (C.A.)</div>
      <div class="history-bar" id="history-bar"></div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#667788;margin-top:4px">
        <span>J-6</span><span>J-5</span><span>J-4</span><span>J-3</span><span>J-2</span><span>J-1</span><span class="orange" style="color:var(--orange)">Auj.</span>
      </div>
    </div>

    <!-- Configuration -->
    <div class="stat-card">
      <div class="stat-card-title">⚙ CONFIGURATION</div>
      <div class="field"><label>Objectif C.A. journalier (FCFA)</label>
        <input type="number" id="cfg-ca" placeholder="Ex: 50000"></div>
      <div class="field"><label>Objectif commandes journalier</label>
        <input type="number" id="cfg-cmd" placeholder="Ex: 30"></div>
      <div class="field"><label>URL vidéo modèle 3D (mp4/webm)</label>
        <input type="url" id="cfg-video" placeholder="https://... ou vide"></div>
      <div class="field"><label>URL image du chariot</label>
        <input type="url" id="cfg-img" placeholder="https://..."></div>
      <button class="save-btn" onclick="saveCartConfig()">💾 Sauvegarder la configuration</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  projectId:"ninja-s-fries",
  databaseURL:"https://ninja-s-fries-default-rtdb.firebaseio.com",
};

const params  = new URLSearchParams(window.location.search);
const CART_ID = params.get('id') || 'cart_01';
let db, rtdb, cartData = {}, globalGoals = {};
let currentView = 'model';
let peerConn    = null;
let audioMuted  = true;

async function init() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const fs = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const app = initializeApp(FIREBASE_CONFIG);
    db   = fs.getFirestore(app);
    rtdb = getDatabase(app);

    // Charger objectifs globaux
    const gSnap = await fs.getDoc(fs.doc(db,'config','goals'));
    if (gSnap.exists()) globalGoals = gSnap.data();

    // Écoute temps réel du cart
    fs.onSnapshot(fs.doc(db,'carts',CART_ID), snap => {
      if (!snap.exists()) { toast('Cart introuvable'); return; }
      cartData = snap.data();
      cartData.id = snap.id;
      renderStats();
    });

    // Connexion WebRTC pour ce cart
    connectWebRTC();

  } catch(e) {
    toast('Firebase: ' + e.message);
  }
}

function renderStats() {
  const name = cartData.cartName || CART_ID;
  document.getElementById('cart-title').textContent = name.toUpperCase() + ' — PROFIL';

  const caGoal  = cartData.dailyCAGoal  || globalGoals.dailyCAGoal  || 50000;
  const cmdGoal = cartData.dailyGoalCmd || globalGoals.dailyCmdGoal || 30;
  const ca      = cartData.todayTotal  || 0;
  const cmd     = cartData.todayOrders || 0;
  const annual  = cartData.annualTotal || 0;
  const caPct   = Math.min(Math.round((ca/caGoal)*100), 100);
  const cmdPct  = Math.min(Math.round((cmd/cmdGoal)*100), 100);
  const isOnline = cartData.updatedAt && (Date.now()/1000 - cartData.updatedAt.seconds) < 300;

  document.getElementById('s-ca').textContent     = ca.toLocaleString('fr-FR') + ' FCFA';
  document.getElementById('s-cmd').textContent    = cmd + ' ventes';
  document.getElementById('s-goal-ca').textContent  = caGoal.toLocaleString('fr-FR') + ' FCFA';
  document.getElementById('s-goal-cmd').textContent = cmdGoal + ' ventes';
  document.getElementById('s-pct-ca').textContent   = caPct + '%';
  document.getElementById('s-pct-cmd').textContent  = cmdPct + '%';
  document.getElementById('s-annual').textContent   = annual.toLocaleString('fr-FR') + ' FCFA';

  const statusEl = document.getElementById('s-status');
  const dot      = document.getElementById('status-dot');
  statusEl.textContent  = isOnline ? 'EN LIGNE' : 'HORS LIGNE';
  statusEl.className    = 'stat-val ' + (isOnline ? 'green' : 'red');
  dot.style.background  = isOnline ? '#00ff88' : '#ff3300';
  dot.style.boxShadow   = \`0 0 8px \${isOnline ? '#00ff88' : '#ff3300'}\`;

  document.getElementById('p-ca').style.width  = caPct  + '%';
  document.getElementById('p-cmd').style.width = cmdPct + '%';

  // Pré-remplir config
  document.getElementById('cfg-ca').value    = caGoal;
  document.getElementById('cfg-cmd').value   = cmdGoal;
  document.getElementById('cfg-video').value = cartData.videoUrl || '';
  document.getElementById('cfg-img').value   = cartData.cartImageUrl || '';

  // Modèle vidéo
  if (cartData.videoUrl) {
    const mv = document.getElementById('model-video');
    if (mv.src !== cartData.videoUrl) mv.src = cartData.videoUrl;
    if (currentView === 'model') showModel();
  }

  // Historique simulé (en attente de vraie collection history/)
  renderHistory(ca, caGoal);
}

function renderHistory(todayCA, goal) {
  const bar = document.getElementById('history-bar');
  const sim = [0.4, 0.6, 0.75, 0.5, 0.9, 0.7, todayCA/goal];
  bar.innerHTML = sim.map((v,i) =>
    \`<div class="h-bar\${i===6?' today':''}" style="height:\${Math.max(v*100,3)}%"></div>\`
  ).join('');
}

// ── Vues ──
function switchView(v) {
  currentView = v;
  document.getElementById('btn-cam').classList.toggle('active',   v==='cam');
  document.getElementById('btn-model').classList.toggle('active', v==='model');
  if (v==='cam')   showLive();
  else             showModel();
}

function showLive() {
  document.getElementById('live-video').style.display  = 'block';
  document.getElementById('model-video').style.display = 'none';
  document.getElementById('media-placeholder').style.display = 'none';
  document.getElementById('cam-label').textContent = 'CAMÉRA LIVE';
}

function showModel() {
  const mv = document.getElementById('model-video');
  if (mv.src) {
    mv.style.display = 'block';
    document.getElementById('live-video').style.display  = 'none';
    document.getElementById('media-placeholder').style.display = 'none';
    document.getElementById('cam-label').textContent = 'MODÈLE 3D';
  } else {
    document.getElementById('media-placeholder').style.display = 'flex';
    document.getElementById('live-video').style.display  = 'none';
    mv.style.display = 'none';
    document.getElementById('cam-label').textContent = 'PAS DE MODÈLE';
  }
}

function toggleMute() {
  audioMuted = !audioMuted;
  document.getElementById('live-video').muted  = audioMuted;
  const btn = document.getElementById('btn-mute');
  btn.textContent = audioMuted ? '🔇 Audio' : '🔊 Audio';
  btn.classList.toggle('active', !audioMuted);
}

function goLive() {
  window._navigateTo('live.html');
}

// ── WebRTC viewer pour ce cart ──
async function connectWebRTC() {
  if (!rtdb) return;
  const ICE = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80',   username:'openrelayproject', credential:'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443',  username:'openrelayproject', credential:'openrelayproject' },
  ];
  try {
    const { ref, onValue, set, push } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const pc = new RTCPeerConnection({ iceServers: ICE });
    peerConn = pc;

    pc.ontrack = e => {
      const vid = document.getElementById('live-video');
      vid.srcObject = e.streams[0];
      vid.muted = audioMuted;
      document.getElementById('live-badge').textContent = '● LIVE';
      document.getElementById('live-badge').classList.add('on');
    };

    pc.onicecandidate = e => {
      if (e.candidate) push(ref(rtdb, \`webrtc/\${CART_ID}/viewer_candidates\`), e.candidate.toJSON());
    };

    onValue(ref(rtdb, \`webrtc/\${CART_ID}/offer\`), async snap => {
      const offer = snap.val();
      if (!offer || pc.remoteDescription) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      set(ref(rtdb, \`webrtc/\${CART_ID}/answer\`), { type: answer.type, sdp: answer.sdp });
    });

    onValue(ref(rtdb, \`webrtc/\${CART_ID}/cart_candidates\`), snap => {
      const cs = snap.val();
      if (!cs) return;
      Object.values(cs).forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{}));
    });
  } catch(_) {}
}

// ── Sauvegarder config cart ──
async function saveCartConfig() {
  if (!db) { toast('Non connecté'); return; }
  const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  try {
    await updateDoc(doc(db,'carts',CART_ID), {
      dailyCAGoal:  parseFloat(document.getElementById('cfg-ca').value)  || 50000,
      dailyGoalCmd: parseFloat(document.getElementById('cfg-cmd').value) || 30,
      videoUrl:     document.getElementById('cfg-video').value.trim(),
      cartImageUrl: document.getElementById('cfg-img').value.trim(),
    });
    toast('✓ Configuration sauvegardée');
  } catch(e) { toast('Erreur: ' + e.message); }
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
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
