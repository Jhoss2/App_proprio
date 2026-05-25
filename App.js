/**
 * App.js — Ninja's Corp
 * Coquille React Native minimale — WebView uniquement
 * Navigation gérée par messages entre HTML et RN
 * ZÉRO logique métier ici — tout est dans les HTML
 */
const React   = require('react');
const { useState, useRef, useCallback, useEffect } = React;
const { View, StatusBar, BackHandler, StyleSheet } = require('react-native');
const { WebView } = require('react-native-webview');

// ── Pages HTML embarquées ──
const PAGES = {
  dashboard:    require('./assets/dashboard_html'),
  config:       require('./assets/config_html'),
  live:         require('./assets/live_html'),
  lumi:         require('./assets/lumi_html'),
  cart_profile: require('./assets/cart_profile_html'),
  recompenses:  require('./assets/recompenses_html'),
  stocks:       require('./assets/stocks_html'),
};

// Normaliser : récupérer la string quelle que soit la forme d'export
function getHTML(module) {
  if (typeof module === 'string') return module;
  if (module && typeof module.default === 'string') return module.default;
  return '<html><body style="background:#020810;color:#ff7a1a;font-family:monospace;padding:20px">Page non disponible</body></html>';
}

module.exports = function App() {
  const [page,  setPage]  = useState('dashboard');
  const [param, setParam] = useState('');
  const wvRef = useRef(null);
  const history = useRef(['dashboard']);

  // ── Bouton retour Android ──
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (history.current.length > 1) {
        history.current.pop();
        const prev = history.current[history.current.length - 1];
        setPage(prev.split('?')[0]);
        setParam(prev.split('?')[1] || '');
        return true;
      }
      return false; // Quitter l'app
    });
    return () => h.remove();
  }, []);

  // ── Réception messages depuis WebView ──
  const onMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.action === 'NAVIGATE') {
        const screen = msg.screen || '';
        const p      = msg.param  || '';

        // Mapper les noms de page
        const pageMap = {
          dashboard:    'dashboard',
          config:       'config',
          live:         'live',
          lumi:         'lumi',
          Lumi:         'lumi',
          CartProfile:  'cart_profile',
          cart_profile: 'cart_profile',
          recompenses:  'recompenses',
          Recompenses:  'recompenses',
          Ventes:       'recompenses',
          stocks:       'stocks',
          Stocks:       'stocks',
          Config:       'config',
        };

        const target = pageMap[screen] || screen;
        if (PAGES[target]) {
          history.current.push(target + (p ? '?' + p : ''));
          setPage(target);
          setParam(p);
        }
      }
    } catch (_) {}
  }, []);

  // ── Source HTML ──
  let htmlString = getHTML(PAGES[page] || PAGES['dashboard']);

  // Injecter le param dans cart_profile si nécessaire
  if (page === 'cart_profile' && param) {
    htmlString = htmlString.replace(
      "const CART_ID = params.get('id') || 'cart_01';",
      `const CART_ID = '${param}';`
    );
  }

  return (
    <View style={s.root}>
      <StatusBar hidden />
      <WebView
        ref={wvRef}
        source={{ html: htmlString, baseUrl: '' }}
        style={s.wv}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grant"
        onMessage={onMessage}
        onError={e => console.warn('[WV]', e.nativeEvent.description)}
        injectedJavaScriptBeforeContentLoaded={`
          window.isNativeApp = true;
          window.currentPage = '${page}';
          window.currentParam = '${param}';
          true;
        `}
      />
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020810' },
  wv:   { flex: 1, backgroundColor: '#020810' },
});
          
