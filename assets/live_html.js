// live_html.js — Module HTML embarqué
// NE PAS MODIFIER — généré depuis live.html
const HTML = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Ninja's Corp — Live Surveillance</title>
<style>
  :root { --orange:#ff7a1a; --cyan:#00f2ff; --bg:#020810; }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:white;font-family:'Share Tech Mono',monospace;height:100vh;overflow:hidden;display:flex;flex-direction:column;}

  /* Header */
  .header{display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid rgba(255,122,26,.3);background:rgba(0,0,0,.8);gap:12px;flex-shrink:0;}
  .back-btn{background:none;border:1px solid var(--orange);color:var(--orange);padding:6px 14px;font-family:inherit;font-size:14px;cursor:pointer;border-radius:2px;}
  .header-title{flex:1;font-size:16px;font-weight:900;letter-spacing:2px;color:var(--orange);}
  .status-bar{font-size:11px;color:var(--cyan);}

  /* Grille caméras */
  .cameras-grid{flex:1;display:grid;gap:4px;padding:8px;overflow:hidden;}
  .cameras-grid.count-1{grid-template-columns:1fr;}
  .cameras-grid.count-2{grid-template-columns:1fr 1fr;}
  .cameras-grid.count-3{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;}
  .cameras-grid.count-3 .cam-box:first-child{grid-column:1/-1;}
  .cameras-grid.count-4{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;}

  /* Boîte caméra */
  .cam-box{position:relative;background:#000;border:1px solid rgba(255,122,26,.25);border-radius:3px;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .cam-box:hover{border-color:var(--orange);}
  .cam-box video{width:100%;height:100%;object-fit:cover;display:none;}
  .cam-box video.active{display:block;}
  .cam-box.selected{border-color:var(--cyan);border-width:2px;}

  /* Placeholder caméra */
  .cam-placeholder{display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.6;}
  .cam-placeholder svg{width:40px;height:40px;fill:var(--orange);}
  .cam-placeholder span{font-size:11px;letter-spacing:1px;}

  /* Overlay infos */
  .cam-overlay{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:linear-gradient(to bottom,rgba(0,0,0,.7),transparent);}
  .cam-name{font-size:11px;font-weight:900;color:var(--orange);letter-spacing:1px;}
  .cam-status{font-size:9px;padding:2px 6px;border-radius:2px;font-weight:900;}
  .cam-status.online{background:rgba(0,255,100,.2);color:#00ff88;border:1px solid #00ff88;}
  .cam-status.offline{background:rgba(255,50,0,.2);color:#ff5533;border:1px solid #ff5533;}
  .cam-status.connecting{background:rgba(255,200,0,.2);color:#ffcc00;border:1px solid #ffcc00;}

  /* Overlay bas : infos ventes */
  .cam-sales{position:absolute;bottom:0;left:0;right:0;padding:4px 8px;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);display:flex;justify-content:space-between;}
  .cam-sales span{font-size:10px;color:var(--cyan);}

  /* Barre contrôle audio */
  .controls{display:flex;gap:8px;padding:8px 12px;border-top:1px solid rgba(255,122,26,.2);background:rgba(0,0,0,.6);flex-shrink:0;align-items:center;}
  .ctrl-btn{background:none;border:1px solid rgba(255,122,26,.4);color:var(--orange);padding:5px 12px;font-family:inherit;font-size:11px;cursor:pointer;border-radius:2px;transition:.2s;}
  .ctrl-btn:hover{border-color:var(--orange);background:rgba(255,122,26,.1);}
  .ctrl-btn.active{background:rgba(255,122,26,.2);border-color:var(--orange);}
  .ctrl-btn.danger{border-color:rgba(255,50,0,.4);color:#ff5533;}
  .ctrl-btn.danger:hover{border-color:#ff5533;background:rgba(255,50,0,.1);}
  .connection-info{margin-left:auto;font-size:10px;color:rgba(255,122,26,.5);}

  /* Popup plein écran */
  .fullscreen-overlay{display:none;position:fixed;inset:0;background:#000;z-index:1000;flex-direction:column;}
  .fullscreen-overlay.show{display:flex;}
  .fullscreen-overlay video{flex:1;width:100%;object-fit:contain;}
  .fullscreen-header{display:flex;align-items:center;padding:10px;background:rgba(0,0,0,.8);}
  .close-fs{background:none;border:none;color:var(--orange);font-size:20px;cursor:pointer;margin-right:12px;}
  .fullscreen-header span{color:var(--orange);font-size:14px;font-weight:900;}

  /* Indicateur de chargement */
  .loading-ring{width:32px;height:32px;border:3px solid rgba(255,122,26,.2);border-top-color:var(--orange);border-radius:50%;animation:spin .8s linear infinite;position:absolute;}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <button class="back-btn" onclick="history.back()">‹ Retour</button>
  <div class="header-title">⬡ SURVEILLANCE LIVE</div>
  <div class="status-bar" id="global-status">Connexion...</div>
</div>

<!-- Grille caméras -->
<div class="cameras-grid count-1" id="cameras-grid">
  <!-- Généré dynamiquement -->
</div>

<!-- Contrôles -->
<div class="controls">
  <button class="ctrl-btn" id="btn-audio" onclick="toggleAudio()">🔇 Audio OFF</button>
  <button class="ctrl-btn" id="btn-refresh" onclick="reconnectAll()">↻ Reconnecter</button>
  <button class="ctrl-btn danger" onclick="disconnectAll()">✕ Déconnecter</button>
  <div class="connection-info" id="conn-info">TURN: openrelay.metered.ca</div>
</div>

<!-- Plein écran -->
<div class="fullscreen-overlay" id="fullscreen-overlay">
  <div class="fullscreen-header">
    <button class="close-fs" onclick="closeFullscreen()">✕</button>
    <span id="fs-title">CART XX</span>
  </div>
  <video id="fs-video" autoplay playsinline></video>
</div>

<script>
// ════════════════════════════════════════════
// NINJA'S CORP — SURVEILLANCE LIVE WebRTC
// Signaling : Firebase Realtime Database
// NAT traversal : TURN servers (gratuits)
// ════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:        "AIzaSyDJS5sgI7rFyAQAOZNgJsZ1nkWwjFI-cDE",
  projectId:     "ninja-s-fries",
  databaseURL:   "https://ninja-s-fries-default-rtdb.firebaseio.com",
};

// Serveurs ICE/TURN — Open Relay (gratuits, supportent 4G NAT)
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

// État global
let db_rtdb   = null;
let carts     = [];        // [{id, name, status}]
let peers     = {};        // {cartId: RTCPeerConnection}
let streams   = {};        // {cartId: MediaStream}
let audioOn   = false;
let fbReady   = false;

// ── Initialisation Firebase ──
async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getDatabase, ref, onValue, set, onDisconnect, push, remove } =
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const { getFirestore, collection, query, orderBy, onSnapshot } =
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

    const app  = initializeApp(FIREBASE_CONFIG);
    db_rtdb    = getDatabase(app);
    const db_fs = getFirestore(app);

    window._firebase = { getDatabase, ref, onValue, set, push, remove, db_rtdb };
    fbReady = true;
    setStatus('Firebase OK — Chargement des carts...', '#00f2ff');

    // Charger les carts depuis Firestore
    onSnapshot(
      query(collection(db_fs, 'carts'), orderBy('createdAt', 'asc')),
      snap => {
        carts = snap.docs.map(d => ({
          id:     d.id,
          name:   d.data().cartName || d.id,
          status: 'offline',
          caVal:  d.data().todayTotal  || 0,
          cmdVal: d.data().todayOrders || 0,
        }));
        renderGrid();
        connectAll();
        setStatus(\`\${carts.length} cart(s) — Connexion WebRTC...\`, '#00f2ff');
      }
    );
  } catch(e) {
    setStatus('Erreur Firebase: ' + e.message, '#ff5533');
    // Mode démo avec carts factices
    carts = [
      {id:'cart_01', name:'CART 01', status:'offline', caVal:0, cmdVal:0},
      {id:'cart_02', name:'CART 02', status:'offline', caVal:0, cmdVal:0},
      {id:'cart_03', name:'CART 03', status:'offline', caVal:0, cmdVal:0},
    ];
    renderGrid();
  }
}

// ── Rendu de la grille ──
function renderGrid() {
  const grid = document.getElementById('cameras-grid');
  const n    = carts.length;
  grid.className = \`cameras-grid count-\${Math.min(n, 4)}\`;

  grid.innerHTML = carts.map(cart => \`
    <div class="cam-box" id="cam-\${cart.id}" onclick="openFullscreen('\${cart.id}','\${cart.name}')">
      <div class="cam-overlay">
        <span class="cam-name">\${cart.name.toUpperCase()}</span>
        <span class="cam-status offline" id="status-\${cart.id}">OFFLINE</span>
      </div>
      <div class="cam-placeholder" id="placeholder-\${cart.id}">
        <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        <span>EN ATTENTE</span>
        <div class="loading-ring"></div>
      </div>
      <video id="video-\${cart.id}" autoplay playsinline></video>
      <div class="cam-sales">
        <span id="ca-\${cart.id}">C.A: \${cart.caVal} FCFA</span>
        <span id="cmd-\${cart.id}">\${cart.cmdVal} ventes</span>
      </div>
    </div>\`).join('');
}

// ── Connexion WebRTC à tous les carts ──
async function connectAll() {
  for (const cart of carts) {
    await connectToCart(cart.id);
  }
}

async function connectToCart(cartId) {
  if (!fbReady || !window._firebase) return;
  const { ref, onValue, set, push, remove, db_rtdb } = window._firebase;

  try {
    // Créer connexion peer
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peers[cartId] = pc;

    // Réception du flux vidéo/audio
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      streams[cartId] = stream;
      const video = document.getElementById('video-' + cartId);
      if (video) {
        video.srcObject = stream;
        video.muted     = !audioOn;
        video.classList.add('active');
        const ph = document.getElementById('placeholder-' + cartId);
        if (ph) ph.style.display = 'none';
        setCartStatus(cartId, 'online');
      }
    };

    // ICE candidates → Firebase
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const cRef = ref(db_rtdb, \`webrtc/\${cartId}/viewer_candidates\`);
        push(cRef, event.candidate.toJSON());
      }
    };

    // Surveiller la connexion
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected')     setCartStatus(cartId, 'online');
      if (state === 'disconnected' || state === 'failed') setCartStatus(cartId, 'offline');
    };

    // Écouter l'offre du cart (le cart publie l'offre)
    const offerRef = ref(db_rtdb, \`webrtc/\${cartId}/offer\`);
    onValue(offerRef, async (snap) => {
      const offer = snap.val();
      if (!offer || peers[cartId].remoteDescription) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        // Publier la réponse
        const answerRef = ref(db_rtdb, \`webrtc/\${cartId}/answer\`);
        set(answerRef, { type: answer.type, sdp: answer.sdp });
        setCartStatus(cartId, 'connecting');
      } catch(e) {
        console.warn('[WebRTC]', cartId, e.message);
      }
    });

    // Écouter les ICE candidates du cart
    const cartCandRef = ref(db_rtdb, \`webrtc/\${cartId}/cart_candidates\`);
    onValue(cartCandRef, (snap) => {
      const candidates = snap.val();
      if (!candidates) return;
      Object.values(candidates).forEach(async (c) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch(_) {}
      });
    });

  } catch(e) {
    setCartStatus(cartId, 'offline');
    console.warn('[WebRTC] connectToCart:', e.message);
  }
}

// ── Statut d'un cart ──
function setCartStatus(cartId, status) {
  const el = document.getElementById('status-' + cartId);
  if (!el) return;
  el.textContent  = status.toUpperCase();
  el.className    = \`cam-status \${status}\`;
  const box = document.getElementById('cam-' + cartId);
  if (box) {
    box.style.borderColor = status === 'online' ? 'rgba(0,255,100,.4)' :
                            status === 'connecting' ? 'rgba(255,200,0,.4)' :
                            'rgba(255,122,26,.25)';
  }
}

// ── Contrôles ──
function toggleAudio() {
  audioOn = !audioOn;
  const btn = document.getElementById('btn-audio');
  btn.textContent = audioOn ? '🔊 Audio ON' : '🔇 Audio OFF';
  btn.classList.toggle('active', audioOn);
  Object.entries(streams).forEach(([id, stream]) => {
    const video = document.getElementById('video-' + id);
    if (video) video.muted = !audioOn;
  });
}

function reconnectAll() {
  // Fermer les connexions existantes
  Object.values(peers).forEach(pc => { try { pc.close(); } catch(_) {} });
  peers   = {};
  streams = {};
  renderGrid();
  connectAll();
  setStatus('Reconnexion en cours...', '#ffcc00');
}

function disconnectAll() {
  Object.values(peers).forEach(pc => { try { pc.close(); } catch(_) {} });
  peers   = {};
  streams = {};
  carts.forEach(c => setCartStatus(c.id, 'offline'));
  setStatus('Déconnecté', '#ff5533');
}

// ── Plein écran ──
function openFullscreen(cartId, cartName) {
  const stream = streams[cartId];
  if (!stream) return;
  const overlay = document.getElementById('fullscreen-overlay');
  const video   = document.getElementById('fs-video');
  const title   = document.getElementById('fs-title');
  title.textContent  = cartName.toUpperCase();
  video.srcObject    = stream;
  video.muted        = !audioOn;
  overlay.classList.add('show');
  document.getElementById('cam-' + cartId)?.classList.add('selected');
}

function closeFullscreen() {
  document.getElementById('fullscreen-overlay').classList.remove('show');
  document.querySelectorAll('.cam-box').forEach(b => b.classList.remove('selected'));
}

// ── Status global ──
function setStatus(msg, color) {
  const el = document.getElementById('global-status');
  if (el) { el.textContent = msg; el.style.color = color || '#00f2ff'; }
}

// ── Démarrage ──
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
