/**
 * DashboardScreen — ASSEMBLAGE FINAL v5
 * 5 composants SVG + R3F empilés position absolue
 * Données Firebase temps réel, logos galerie, zéro barre navigation
 * Ordre rendu garanti sans chevauchement
 */
const React = require('react');
const { useState, useEffect, useRef, useCallback, memo } = React;
const { View, StyleSheet, Dimensions, StatusBar, Alert, Image, Animated } = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const ImagePicker  = require('expo-image-picker');

const { useAllCarts, useDashboardStats } = require('../hooks/useFirestore');

// Composants SVG + R3F
const TopBar      = require('../components/TopBar');
const SysLog      = require('../components/SysLog');
const MainGauge   = require('../components/MainGauge');
const CartColumn  = require('../components/CartColumn');
const BottomBands = require('../components/BottomBands');

const { width: SW, height: SH } = Dimensions.get('window');

/* ══ StarDot — composant séparé (hooks hors .map) ══ */
const StarDot = memo(({ x, y, size, delay }) => {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue:0.9, duration:700+(delay%400), useNativeDriver:true }),
      Animated.timing(a, { toValue:0.1, duration:700+(delay%400), useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position:'absolute', left:x, top:y,
      width:size, height:size, borderRadius:size/2,
      backgroundColor:'#ffffff', opacity:a,
    }}/>
  );
});

const STARS = [
  {x:40, y:30, s:1.5, d:0},   {x:200,y:15, s:1,  d:200},
  {x:400,y:60, s:2,   d:400}, {x:650,y:20, s:1.5, d:100},
  {x:900,y:50, s:1,   d:600}, {x:1100,y:35,s:2,  d:300},
  {x:1300,y:70,s:1.5, d:500}, {x:80, y:820,s:1,  d:150},
  {x:350,y:840,s:1.5, d:700}, {x:700,y:860,s:1,  d:250},
  {x:1050,y:825,s:2,  d:450},
];

/* ══ Positions absolues des 5 zones (base 1440×900 → SW×SH) ══ */
const L = {
  topBar:  { left:0,          top:0,           width:SW,         height:SH*0.155  },
  syslog:  { left:SW*0.046,   top:SH*0.165,    width:SW*0.185,   height:SH*0.58   },
  gauge:   { left:SW*0.22,    top:SH*0.14,     width:SW*0.62,    height:SH*0.87   },
  carts:   { left:SW*0.805,   top:SH*0.175,    width:SW*0.168,   height:SH*0.585  },
  bottom:  { left:SW*0.033,   top:SH*0.695,    width:SW*0.965,   height:SH*0.30   },
};

/* ══ Écran principal ══ */
const DashboardScreen = ({ navigation }) => {
  const [logoUri,    setLogoUri]    = useState(null);
  const [bgUri,      setBgUri]      = useState(null);
  const [cartImages, setCartImages] = useState({});

  /* Chargement config */
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

  /* Données Firebase */
  const { carts } = useAllCarts();
  const raw       = useDashboardStats(carts);
  const stats     = { totalToday: raw?.totalToday||0, totalOrders: raw?.totalOrders||0 };

  const QUOTA_CA_DAY  = 50000;
  const QUOTA_CMD_DAY = 30;

  const cartData = carts.map((c,i) => ({
    id:      c.id,
    name:    (c.cartName||c.id).toUpperCase().slice(0,8),
    caPct:   Math.min(Math.round(((c.todayTotal ||0)/QUOTA_CA_DAY )*100),100),
    cmdPct:  Math.min(Math.round(((c.todayOrders||0)/QUOTA_CMD_DAY)*100),100),
    status:  c.updatedAt&&(Date.now()/1000-c.updatedAt.seconds)<300?'online':'offline',
    imageUri:cartImages[c.id]||c.cartImageUrl||null,
    index:   i,
  }));

  const caMonthPct  = Math.min(Math.round((stats.totalToday /(QUOTA_CA_DAY *30))*100),100)||60;
  const cmdMonthPct = Math.min(Math.round((stats.totalOrders/(QUOTA_CMD_DAY*30))*100),100)||55;

  /* Navigation */
  const goSettings = useCallback(() => navigation?.navigate('Config'),   [navigation]);
  const goRewards  = useCallback(() => navigation?.navigate('Ventes'),   [navigation]);
  const goLumi     = useCallback(() => Alert.alert('Lumi IA','Écran en construction'), []);
  const goStocks   = useCallback(() => Alert.alert('Stocks','Écran en construction'), []);
  const goCart     = useCallback((cart) => navigation?.navigate('Carts',{cartId:cart.id}), [navigation]);

  /* Sélection logo depuis galerie */
  const pickLogo = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing:true, aspect:[1,1], quality:0.9,
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

  return (
    <View style={st.root}>
      <StatusBar hidden/>

      {/* ══ COUCHE 0 : FOND GALAXIE ══ */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor:'#020810' }]}/>
        {bgUri && <Image source={{uri:bgUri}} style={StyleSheet.absoluteFill} resizeMode="cover"/>}
        {STARS.map((s,i) => (
          <StarDot key={i} x={s.x/1440*SW} y={s.y/900*SH} size={s.s} delay={s.d}/>
        ))}
      </View>

      {/* ══ COUCHE 1 : TOP BAR ══ */}
      <View style={[StyleSheet.absoluteFill, L.topBar]}>
        <TopBar
          cartCount={carts.length||3}
          annualPct={100}
          logoUri={logoUri}
          onLogoPress={pickLogo}
        />
      </View>

      {/* ══ COUCHE 2A : SYS.LOG gauche ══ */}
      <View style={[StyleSheet.absoluteFill, L.syslog]}>
        <SysLog/>
      </View>

      {/* ══ COUCHE 2B : CARTS droite ══ */}
      <View style={[StyleSheet.absoluteFill, L.carts]}>
        <CartColumn
          carts={cartData}
          cartImages={cartImages}
          onCartPress={goCart}
        />
      </View>

      {/* ══ COUCHE 3 : GRANDE JAUGE centrale ══ */}
      <View style={[StyleSheet.absoluteFill, L.gauge]}>
        <MainGauge
          caMonthPct={caMonthPct}
          cmdMonthPct={cmdMonthPct}
          logoUri={logoUri}
          onLogoPress={pickLogo}
          onRewards={goRewards}
          onLumi={goLumi}
          onStocks={goStocks}
        />
      </View>

      {/* ══ COUCHE 4 : BANDES INFÉRIEURES ══ */}
      <View style={[StyleSheet.absoluteFill, L.bottom]}>
        <BottomBands carts={cartData} onSettings={goSettings}/>
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex:1, backgroundColor:'#020810' },
});

module.exports = DashboardScreen;
