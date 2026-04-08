/**
 * APP.JS — avec ErrorBoundary + DiagnosticScreen intégrés
 * Si l'app crash, affiche l'erreur exacte à l'écran au lieu de fermer
 */
const React = require('react');
const { useState, useEffect, Component } = React;
const {
  View, Text, ScrollView, StyleSheet,
  StatusBar, TouchableOpacity, Clipboard,
} = require('react-native');

/* ─── 1. Test chaque module natif AVANT de les importer ─── */
let screensOk = false;
let gestureOk = false;
let safeAreaOk = false;
let navigationOk = false;
let firebaseOk = false;
let IMPORT_ERRORS = [];

try {
  const { enableScreens } = require('react-native-screens');
  enableScreens(true);
  screensOk = true;
} catch(e) { IMPORT_ERRORS.push('react-native-screens: ' + e.message); }

try {
  require('react-native-gesture-handler');
  gestureOk = true;
} catch(e) { IMPORT_ERRORS.push('gesture-handler: ' + e.message); }

try {
  require('react-native-safe-area-context');
  safeAreaOk = true;
} catch(e) { IMPORT_ERRORS.push('safe-area-context: ' + e.message); }

try {
  require('@react-navigation/native');
  require('@react-navigation/bottom-tabs');
  navigationOk = true;
} catch(e) { IMPORT_ERRORS.push('navigation: ' + e.message); }

try {
  require('./firebase/firebaseConfig');
  firebaseOk = true;
} catch(e) { IMPORT_ERRORS.push('firebase: ' + e.message); }

/* ─── 2. Écran de diagnostic — affiché si crash ou en mode debug ─── */
const DiagScreen = ({ errors, onContinue }) => (
  <View style={d.root}>
    <StatusBar barStyle="light-content" backgroundColor="#000" />
    <Text style={d.title}>⚡ NINJA CORP — DIAGNOSTIC</Text>
    <Text style={d.sub}>Modules natifs :</Text>
    {[
      { name: 'react-native-screens',         ok: screensOk  },
      { name: 'react-native-gesture-handler', ok: gestureOk  },
      { name: 'react-native-safe-area',       ok: safeAreaOk },
      { name: '@react-navigation',            ok: navigationOk },
      { name: 'firebase/firestore',           ok: firebaseOk },
    ].map(m => (
      <Text key={m.name} style={[d.module, { color: m.ok ? '#00E676' : '#FF1744' }]}>
        {m.ok ? '✓' : '✗'} {m.name}
      </Text>
    ))}
    {errors.length > 0 && (
      <>
        <Text style={[d.sub, { marginTop: 16, color: '#FF1744' }]}>Erreurs :</Text>
        <ScrollView style={d.errBox}>
          {errors.map((e, i) => (
            <Text key={i} style={d.errText}>{e}</Text>
          ))}
        </ScrollView>
      </>
    )}
    {errors.length === 0 && (
      <Text style={[d.sub, { color: '#00E676', marginTop: 12 }]}>
        ✓ Tous les modules OK — lancement...
      </Text>
    )}
    {errors.length > 0 && (
      <TouchableOpacity style={d.btn} onPress={onContinue}>
        <Text style={d.btnText}>CONTINUER QUAND MÊME</Text>
      </TouchableOpacity>
    )}
  </View>
);

/* ─── 3. ErrorBoundary — capture les erreurs JS runtime ─── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <View style={d.root}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <Text style={d.title}>💥 CRASH DÉTECTÉ</Text>
          <Text style={d.errTitle}>{this.state.error.toString()}</Text>
          <ScrollView style={d.errBox}>
            <Text style={d.errText}>
              {this.state.info ? this.state.info.componentStack : 'Pas de stack'}
            </Text>
          </ScrollView>
          <Text style={d.hint}>
            Copie ce message et envoie-le pour diagnostic.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/* ─── 4. App principale — chargée seulement si tout est OK ─── */
const MainApp = () => {
  const { GestureHandlerRootView } = require('react-native-gesture-handler');
  const { SafeAreaProvider }       = require('react-native-safe-area-context');
  const { NavigationContainer }    = require('@react-navigation/native');
  const BottomTabNav = require('./navigation/BottomTabNav');
  const { C } = require('./constants');

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary:      C.orange,
              background:   '#000000',
              card:         '#020205',
              text:         '#FFFFFF',
              border:       'rgba(255,87,34,0.5)',
              notification: C.orange,
            },
          }}
        >
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <BottomTabNav />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

/* ─── 5. Composant racine ─── */
function App() {
  const [showDiag, setShowDiag] = useState(IMPORT_ERRORS.length > 0);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    if (IMPORT_ERRORS.length === 0) {
      // Tout OK — afficher diagnostic 2s puis lancer
      const t = setTimeout(() => setReady(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  if (showDiag && !ready) {
    return (
      <DiagScreen
        errors={IMPORT_ERRORS}
        onContinue={() => { setShowDiag(false); setReady(true); }}
      />
    );
  }

  if (!ready) {
    return <DiagScreen errors={[]} onContinue={() => setReady(true)} />;
  }

  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

const d = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  title:    { color: '#FF5722', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', marginBottom: 16, letterSpacing: 2 },
  sub:      { color: '#FFB300', fontFamily: 'monospace', fontSize: 11, marginBottom: 8, letterSpacing: 1 },
  module:   { fontFamily: 'monospace', fontSize: 12, marginBottom: 4 },
  errBox:   { backgroundColor: '#0a0a0f', borderRadius: 6, padding: 10, maxHeight: 300, marginTop: 6 },
  errTitle: { color: '#FF1744', fontFamily: 'monospace', fontSize: 13, marginBottom: 8, fontWeight: 'bold' },
  errText:  { color: '#FF7043', fontFamily: 'monospace', fontSize: 10, lineHeight: 16 },
  hint:     { color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 10, marginTop: 12 },
  btn:      { marginTop: 20, borderWidth: 1, borderColor: '#FF5722', padding: 12, alignItems: 'center', borderRadius: 4 },
  btnText:  { color: '#FF5722', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 },
});

module.exports = App;
      
