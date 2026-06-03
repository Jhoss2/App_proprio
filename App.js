/**
 * App.js — Ninja's Corp
 * ZÉRO JSX — React.createElement pur — Babel-safe garanti
 * HTML stocké en JSON — Metro parse nativement sans Babel
 */
'use strict';
var React   = require('react');
var RN      = require('react-native');
var WV      = require('react-native-webview');

var View        = RN.View;
var StatusBar   = RN.StatusBar;
var StyleSheet  = RN.StyleSheet;
var BackHandler = RN.BackHandler;
var useRef      = React.useRef;
var useState    = React.useState;
var useEffect   = React.useEffect;
var useCallback = React.useCallback;
var WebView     = WV.WebView;

// Charger les HTML depuis les JSON — Metro les parse nativement
var PAGES = {
  dashboard:    require('./assets/dashboard.json').h,
  config:       require('./assets/config.json').h,
  live:         require('./assets/live.json').h,
  lumi:         require('./assets/lumi.json').h,
  cart_profile: require('./assets/cart_profile.json').h,
  recompenses:  require('./assets/recompenses.json').h,
  stocks:       require('./assets/stocks.json').h,
};

var PAGE_MAP = {
  dashboard:    'dashboard',  Dashboard:    'dashboard',
  config:       'config',     Config:       'config',
  live:         'live',       Live:         'live',
  lumi:         'lumi',       Lumi:         'lumi',
  cart_profile: 'cart_profile', CartProfile: 'cart_profile',
  recompenses:  'recompenses', Recompenses: 'recompenses', Ventes: 'recompenses',
  stocks:       'stocks',     Stocks:       'stocks',
};

var styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020810' },
  wv:   { flex: 1, backgroundColor: '#020810' },
});

function App() {
  var pageState  = useState('dashboard');
  var paramState = useState('');
  var page       = pageState[0];
  var setPage    = pageState[1];
  var param      = paramState[0];
  var setParam   = paramState[1];
  var wvRef      = useRef(null);
  var hist       = useRef(['dashboard']);

  // Bouton retour Android
  useEffect(function() {
    var h = BackHandler.addEventListener('hardwareBackPress', function() {
      if (hist.current.length > 1) {
        hist.current.pop();
        var prev   = hist.current[hist.current.length - 1];
        var parts  = prev.split('?');
        setPage(parts[0]);
        setParam(parts[1] || '');
        return true;
      }
      return false;
    });
    return function() { h.remove(); };
  }, []);

  // Messages depuis WebView
  var onMessage = useCallback(function(event) {
    try {
      var msg = JSON.parse(event.nativeEvent.data);
      if (msg.action !== 'NAVIGATE') return;
      var target = PAGE_MAP[msg.screen];
      if (!target || !PAGES[target]) return;
      var p = msg.param || '';
      hist.current.push(target + (p ? '?' + p : ''));
      setPage(target);
      setParam(p);
    } catch(e) {}
  }, []);

  // HTML courant
  var html = PAGES[page] || PAGES['dashboard'];
  if (page === 'cart_profile' && param) {
    html = html.replace("params.get('id') || 'cart_01'", "'" + param + "' || 'cart_01'");
  }

  var injected = "window.isNativeApp=true;window.currentPage='" + page + "';true;";

  // React.createElement SANS JSX — Babel-safe 100%
  return React.createElement(
    View,
    { style: styles.root },
    React.createElement(StatusBar, { hidden: true }),
    React.createElement(WebView, {
      ref: wvRef,
      source: { html: html, baseUrl: '' },
      style: styles.wv,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowUniversalAccessFromFileURLs: true,
      originWhitelist: ['*'],
      mixedContentMode: 'always',
      scrollEnabled: false,
      bounces: false,
      overScrollMode: 'never',
      mediaPlaybackRequiresUserAction: false,
      allowsInlineMediaPlayback: true,
      mediaCapturePermissionGrantType: 'grant',
      onMessage: onMessage,
      injectedJavaScriptBeforeContentLoaded: injected,
      onError: function(e) { console.warn('[WV]', e.nativeEvent.description); },
    })
  );
}

module.exports = App;
