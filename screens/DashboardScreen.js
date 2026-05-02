import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, StyleSheet, StatusBar, Alert, Image, Animated, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const _firestoreHooks  = require('../hooks/useFirestore');
const useAllCarts       = _firestoreHooks.useAllCarts      || (_firestoreHooks.default && _firestoreHooks.default.useAllCarts);
const useDashboardStats = _firestoreHooks.useDashboardStats|| (_firestoreHooks.default && _firestoreHooks.default.useDashboardStats);

import TopBar      from '../components/TopBar';
import SysLog      from '../components/SysLog';
import MainGauge   from '../components/MainGauge';
import CartColumn  from '../components/CartColumn';
import BottomBands from '../components/BottomBands';

const StarDot = memo(({ x, y, size, delay }) => {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue:0.9, duration:700+(delay%400), useNativeDriver:true }),
      Animated.timing(a, { toValue:0.1, duration:700+(delay%400), useNativeDriver:true }),
    ])).start();
  }, []);
  return <Animated.View style={{ position:'absolute', left:x, top:y, width:size, height:size, borderRadius:size/2, backgroundColor:'#ffffff', opacity:a }}/>;
});

const STARS_BASE = [
  {x:40/1440,  y:30/900,  s:1.5, d:0  }, {x:200/1440, y:15/900,  s:1,   d:200},
  {x:400/1440, y:60/900,  s:2,   d:400}, {x:650/1440, y:20/900,  s:1.5, d:100},
  {x:900/1440, y:50/900,  s:1,   d:600}, {x:1100/1440,y:35/900,  s:2,   d:300},
  {x:1300/1440,y:70/900,  s:1.5, d:500}, {x:350/1440, y:840/900, s:1.5, d:700},
  {x:700/1440, y:860/900, s:1,   d:250}, {x:1050/1440,y:825/900, s:2,   d:450},
];

const DashboardScreen = ({ navigation }) => {
  const { width: SW, height: SH } = useWindowDimensions();

  const [logoUri,    setLogoUri]    = useState(null);
  const [bgUri,      setBgUri]      = useState(null);
  const [cartImages, setCartImages] = useState({});

  const loadConfig = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('dashboard_config');
      if (!raw) return;
      const cfg = JSON.parse(raw);
      if (cfg.logoUri)    setLogoUri(cfg.logoUri);
      if (cfg.bgUri)      setBgUri(cfg.bgUri);
      if (cfg.cartImages) setCartImages(cfg.cartImages);
    } catch(_) {}
  }, []);

  useEffect(() => {
    loadConfig();
    const unsub = navigation?.addListener?.('focus', loadConfig);
    return () => unsub?.();
  }, []);

  const { carts } = (useAllCarts ? useAllCarts() : { carts:[] });
  const raw        = (useDashboardStats ? useDashboardStats(carts) : null);
  const stats     = { totalToday: raw?.totalToday||0, totalOrders: raw?.totalOrders||0 };

  const QUOTA_CA_DAY = 50000, QUOTA_CMD_DAY = 30;
  const cartData = carts.map((c,i) => ({
    id:      c.id,
    name:    (c.cartName||c.id).toUpperCase().slice(0,8),
    caPct:   Math.min(Math.round(((c.todayTotal ||0)/QUOTA_CA_DAY )*100),100),
    cmdPct:  Math.min(Math.round(((c.todayOrders||0)/QUOTA_CMD_DAY)*100),100),
    status:  c.updatedAt&&(Date.now()/1000-c.updatedAt.seconds)<300?'online':'offline',
    imageUri:cartImages[c.id]||c.cartImageUrl||null, index:i,
  }));

  const caMonthPct  = Math.min(Math.round((stats.totalToday /(QUOTA_CA_DAY *30))*100),100)||60;
  const cmdMonthPct = Math.min(Math.round((stats.totalOrders/(QUOTA_CMD_DAY*30))*100),100)||55;

  const goSettings = useCallback(() => navigation?.navigate('Config'),  [navigation]);
  const goRewards  = useCallback(() => navigation?.navigate('Ventes'),  [navigation]);
  const goLumi     = useCallback(() => Alert.alert('Lumi IA','En construction'), []);
  const goStocks   = useCallback(() => Alert.alert('Stocks','En construction'), []);
  const goCart     = useCallback(cart => navigation?.navigate('Carts',{cartId:cart.id}), [navigation]);

  const pickLogo = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:ImagePicker.MediaTypeOptions.Images, allowsEditing:true, aspect:[1,1], quality:0.9,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const uri = res.assets[0].uri;
        setLogoUri(uri);
        const stored = await AsyncStorage.getItem('dashboard_config');
        const cfg = stored ? JSON.parse(stored) : {};
        cfg.logoUri = uri;
        await AsyncStorage.setItem('dashboard_config', JSON.stringify(cfg));
      }
    } catch(_) {}
  }, []);

  if (!SW || !SH) return null;

  // Positions absolues calculées DANS le composant avec les vraies dimensions
  const L = {
    topBar: { left:0,        top:0,        width:SW,       height:SH*0.155 },
    syslog: { left:SW*0.046, top:SH*0.165, width:SW*0.185, height:SH*0.58  },
    gauge:  { left:SW*0.22,  top:SH*0.14,  width:SW*0.62,  height:SH*0.87  },
    carts:  { left:SW*0.805, top:SH*0.175, width:SW*0.168, height:SH*0.585 },
    bottom: { left:SW*0.033, top:SH*0.695, width:SW*0.965, height:SH*0.30  },
  };

  return (
    <View style={st.root}>
      <StatusBar hidden/>
      {/* Fond galaxie */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor:'#020810' }]}/>
        {bgUri && <Image source={{uri:bgUri}} style={StyleSheet.absoluteFill} resizeMode="cover"/>}
        {STARS_BASE.map((s,i) => (
          <StarDot key={i} x={s.x*SW} y={s.y*SH} size={s.s} delay={s.d}/>
        ))}
      </View>
      {/* Composants positionnés dans les zones exactes */}
      <View style={[StyleSheet.absoluteFill, L.topBar]}>
        <TopBar cartCount={carts.length||3} annualPct={100} logoUri={logoUri} onLogoPress={pickLogo}/>
      </View>
      <View style={[StyleSheet.absoluteFill, L.syslog]}>
        <SysLog/>
      </View>
      <View style={[StyleSheet.absoluteFill, L.carts]}>
        <CartColumn carts={cartData} cartImages={cartImages} onCartPress={goCart}/>
      </View>
      <View style={[StyleSheet.absoluteFill, L.gauge]}>
        <MainGauge caMonthPct={caMonthPct} cmdMonthPct={cmdMonthPct} logoUri={logoUri}
          onLogoPress={pickLogo} onRewards={goRewards} onLumi={goLumi} onStocks={goStocks}/>
      </View>
      <View style={[StyleSheet.absoluteFill, L.bottom]}>
        <BottomBands carts={cartData} onSettings={goSettings}/>
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex:1, backgroundColor:'#020810' },
});

export default DashboardScreen;
