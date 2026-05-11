/**
 * DashboardScreen v6 — WebView + Firebase Realtime
 * Le HTML dashboard.html contient tout le design intact de Gemini
 * React Native gère uniquement :
 *   1. Chargement du HTML
 *   2. Écoute Firestore en temps réel
 *   3. Envoi des données à la WebView via postMessage
 *   4. Réception des navigations depuis la WebView
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection, onSnapshot, doc, getDoc, query, orderBy, limit
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Lire le HTML depuis assets
const DASHBOARD_HTML = require('../assets/dashboard.html');

const DashboardScreen = ({ navigation }) => {
  const webviewRef = useRef(null);
  const unsubscribers = useRef([]);
  const [webviewReady, setWebviewReady] = useState(false);

  // ══ Envoi de données à la WebView ══
  const sendToWebView = useCallback((type, payload) => {
    if (!webviewRef.current) return;
    const msg = JSON.stringify({ type, payload });
    webviewRef.current.postMessage(msg);
  }, []);

  // ══ Calcul du % par rapport à l'objectif ══
  const calcPct = (value, goal) => {
    if (!goal || goal <= 0) return 0;
    return Math.min(Math.round((value / goal) * 100), 100);
  };

  // ══ Branchement Firebase Firestore ══
  useEffect(() => {
    let configGoals = { annualGoal: 0, monthlyGoal: 0, dailyGoalCA: 50000, dailyGoalCmd: 30 };

    // 1. Charger la config (objectifs) depuis Firestore
    const loadConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'goals'));
        if (snap.exists()) {
          const data = snap.data();
          configGoals = {
            annualGoal:   data.annualFinancialGoal  || 0,
            monthlyGoal:  data.monthlyFinancialGoal || 0,
            dailyGoalCA:  data.dailyCAGoal          || 50000,
            dailyGoalCmd: data.dailyCmdGoal         || 30,
          };
        }
        // Aussi depuis AsyncStorage (paramètres locaux)
        const local = await AsyncStorage.getItem('dashboard_config');
        if (local) {
          const cfg = JSON.parse(local);
          if (cfg.annualGoal)   configGoals.annualGoal   = cfg.annualGoal;
          if (cfg.monthlyGoal)  configGoals.monthlyGoal  = cfg.monthlyGoal;
          if (cfg.dailyGoalCA)  configGoals.dailyGoalCA  = cfg.dailyGoalCA;
          if (cfg.dailyGoalCmd) configGoals.dailyGoalCmd = cfg.dailyGoalCmd;
        }
      } catch(e) {
        console.warn('[Dashboard] loadConfig:', e.message);
      }
    };

    // 2. Écoute des carts en temps réel
    const subscribeToData = async () => {
      await loadConfig();

      // ── Collection carts ──
      const unsubCarts = onSnapshot(
        query(collection(db, 'carts'), orderBy('createdAt', 'asc')),
        (snapshot) => {
          const carts = snapshot.docs.map(d => {
            const data = d.data();
            const caPct  = calcPct(data.todayTotal  || 0, configGoals.dailyGoalCA);
            const cmdPct = calcPct(data.todayOrders || 0, configGoals.dailyGoalCmd);
            return {
              id:       d.id,
              name:     data.cartName || d.id,
              caPct,
              cmdPct,
              caVal:    data.todayTotal  || 0,
              cmdVal:   data.todayOrders || 0,
              status:   data.updatedAt
                          && (Date.now()/1000 - data.updatedAt.seconds) < 300
                          ? 'online' : 'offline',
              imageUrl: data.cartImageUrl || '',
            };
          });

          // Moyennes globales
          const dailyCAavgPct  = carts.length
            ? Math.round(carts.reduce((s,c) => s + c.caPct,  0) / carts.length) : 0;
          const dailyCmdAvgPct = carts.length
            ? Math.round(carts.reduce((s,c) => s + c.cmdPct, 0) / carts.length) : 0;

          // Total C.A. annuel (somme de toutes les transactions)
          const totalAnnualCA = snapshot.docs.reduce((s,d) => s + (d.data().annualTotal || 0), 0);
          const annualPct     = calcPct(totalAnnualCA, configGoals.annualGoal);

          // Profils pour cadran droit
          const cartProfiles = carts.map(c => ({
            id:       c.id,
            name:     c.name,
            status:   c.status,
            imageUrl: c.imageUrl,
          }));

          sendToWebView('DATA_UPDATE', {
            cartCount:       carts.length,
            annualPct,
            dailyCAavgPct,
            dailyCmdAvgPct,
            dailyGoalCA:     configGoals.dailyGoalCA,
            dailyGoalCmd:    configGoals.dailyGoalCmd,
            carts,
            cartProfiles,
          });
        },
        (err) => console.warn('[Dashboard] carts snapshot:', err.message)
      );
      unsubscribers.current.push(unsubCarts);

      // ── Collection notifications ──
      const unsubNotif = onSnapshot(
        query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(20)),
        (snapshot) => {
          const notifications = snapshot.docs.map(d => {
            const data = d.data();
            return {
              type:      data.type      || 'SYSTÈME',
              titre:     data.title     || data.titre || '',
              message:   data.message   || '',
              timestamp: data.timestamp
                ? new Date(data.timestamp.seconds * 1000)
                    .toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})
                : '',
            };
          });
          sendToWebView('DATA_UPDATE', { notifications });
        },
        (err) => console.warn('[Dashboard] notif snapshot:', err.message)
      );
      unsubscribers.current.push(unsubNotif);
    };

    subscribeToData();

    // Cleanup
    return () => {
      unsubscribers.current.forEach(u => u());
      unsubscribers.current = [];
    };
  }, [sendToWebView]);

  // ══ Réception des messages depuis la WebView ══
  const onWebViewMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.action === 'DASHBOARD_READY') {
        setWebviewReady(true);
        return;
      }

      if (msg.action === 'NAVIGATE') {
        const { screen, cartId } = msg.payload || {};
        switch(screen) {
          case 'Config':
            navigation?.navigate('Config');
            break;
          case 'Recompenses':
            navigation?.navigate('Ventes');
            break;
          case 'Lumi':
            navigation?.navigate('Live');
            break;
          case 'Stocks':
            Alert.alert('Gestion des Stocks', 'Écran en cours de développement');
            break;
          case 'CartProfile':
            navigation?.navigate('Carts', { cartId });
            break;
          default:
            console.log('[Dashboard] Intent:', screen);
        }
      }
    } catch(e) {
      console.warn('[Dashboard] onMessage:', e.message);
    }
  }, [navigation]);

  // ══ Bouton retour Android ══
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  // ══ Rafraîchir config au focus ══
  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', async () => {
      try {
        const local = await AsyncStorage.getItem('dashboard_config');
        if (local) {
          const cfg = JSON.parse(local);
          sendToWebView('DATA_UPDATE', { logoUrl: cfg.logoUri, bgUrl: cfg.bgUri });
        }
      } catch(_) {}
    });
    return () => unsub?.();
  }, [navigation, sendToWebView]);

  return (
    <View style={st.root}>
      <StatusBar hidden/>
      <WebView
        ref={webviewRef}
        source={DASHBOARD_HTML}
        style={st.webview}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={onWebViewMessage}
        onError={(e) => console.warn('[WebView] Error:', e.nativeEvent.description)}
        onHttpError={(e) => console.warn('[WebView] HTTP Error:', e.nativeEvent.statusCode)}
        injectedJavaScriptBeforeContentLoaded={`
          window.isNativeApp = true;
          window.ReactNativeWebView = window.ReactNativeWebView || {
            postMessage: function(msg) { window.postMessage(msg, '*'); }
          };
          true;
        `}
      />
    </View>
  );
};

const st = StyleSheet.create({
  root:    { flex:1, backgroundColor:'#030100' },
  webview: { flex:1, backgroundColor:'#030100' },
});

export default DashboardScreen;
