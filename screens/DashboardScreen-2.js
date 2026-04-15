/**
 * DashboardScreen v3 — LAYERING PIXEL PERFECT
 * Skin PNG 1440x900 (zones blanches) + éléments logiques superposés
 * Pas de barre de navigation — navigation via engrenage + boutons intégrés
 */
const React = require('react');
const { useState, useEffect, useRef, useCallback, memo } = React;
const {
  View, Text, Image, ScrollView, Pressable,
  StyleSheet, Animated, Easing, Dimensions,
  ImageBackground, Alert,
} = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { collection, onSnapshot, query, orderBy, limit } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');
const { useAllCarts, useDashboardStats, useCartOrders } = require('../hooks/useFirestore');
const { C, F } = require('../constants');

const { width: SW, height: SH } = Dimensions.get('window');

// Positions en % basées sur 1440x900 du skin
// Syntaxe: { l: left%, t: top%, w: width%, h: height% }
const Z = {
  logoL:    { l:1.7,  t:2.2,  w:9.7,  h:12.8 },
  stat03:   { l:18.8, t:4.2,  w:11.8, h:8.9  },
  stat100:  { l:60.4, t:4.2,  w:12.8, h:8.9  },
  logoR:    { l:86.8, t:2.2,  w:10.4, h:12.8 },
  syslog:   { l:6.6,  t:28.3, w:13.2, h:40.6 },
  gaugeFull:{ l:25.3, t:24.4, w:35.1, h:46.7 },
  gaugeLogo:{ l:36.5, t:37.8, w:13.5, h:18.9 },
  navRew:   { l:27.1, t:62.8, w:12.2, h:9.4  },
  navLumi:  { l:39.6, t:60.6, w:8.0,  h:12.2 },
  navStocks:{ l:47.9, t:62.8, w:12.8, h:9.4  },
  carts:    { l:66.3, t:23.3, w:21.2, h:54.4 },
  settings: { l:1.4,  t:75.6, w:4.9,  h:8.9  },
  bottomL:  { l:8.0,  t:74.7, w:29.9, h:24.2 },
  bottomR:  { l:43.8, t:74.7, w:36.1, h:24.2 },
};

// Convertit une zone en style React Native absolu
const z2s = (zone) => ({
  position: 'absolute',
  left:   SW * zone.l / 100,
  top:    SH * zone.t / 100,
  width:  SW * zone.w / 100,
  height: SH * zone.h / 100,
});

/* ══════════════════════════════════════
   ATOMS — composants de base sûrs
══════════════════════════════════════ */

const Led = memo(({ color = '#00aaff', size = 9, delay = 0 }) => {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 0.1, duration: 500, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1,   duration: 500, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:color, opacity:a, marginBottom:6 }} />;
});

const NeonText = memo(({ text, size = 18, color = '#00ffcc', style }) => {
  const a = useRef(new Animated.Value(0.65)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue:1,   duration:1500, useNativeDriver:true }),
      Animated.timing(a, { toValue:0.5, duration:1500, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <Animated.Text style={[{ fontFamily:F, fontSize:size, color, fontWeight:'bold', letterSpacing:3, opacity:a,
      textShadowColor:color, textShadowOffset:{width:0,height:0}, textShadowRadius:8 }, style]}>
      {text}
    </Animated.Text>
  );
});

/* ══ Liquide de jauge (barre verticale animée) ══ */
const LiquidBar = memo(({ pct = 60, width = 14, maxHeight, color = '#00aaff' }) => {
  const h = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const target = Math.min(pct, 100) / 100;

  useEffect(() => {
    Animated.timing(h, { toValue:target, duration:1600, useNativeDriver:false, easing:Easing.out(Easing.cubic) }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue:1, duration:1800, useNativeDriver:false }),
      Animated.timing(shimmer, { toValue:0, duration:1800, useNativeDriver:false }),
    ])).start();
  }, [pct]);

  const barH = h.interpolate({ inputRange:[0,1], outputRange:[0, maxHeight] });
  const shimmerOp = shimmer.interpolate({ inputRange:[0,1], outputRange:[0.6,1] });

  return (
    <View style={{ width, height:maxHeight, backgroundColor:`${color}18`, borderRadius:3, overflow:'hidden', justifyContent:'flex-end' }}>
      <Animated.View style={{ width:'100%', height:barH, backgroundColor:color, opacity:shimmerOp, borderRadius:3 }} />
    </View>
  );
});

/* ══ Jauge circulaire segments ══ */
const SegGauge = memo(({ pct=75, size=52, color='#00aaff', label='' }) => {
  const dots = 16;
  const filled = Math.round((Math.min(pct,100)/100)*dots);
  const r = size/2 - 5;
  return (
    <View style={{ alignItems:'center', marginHorizontal:6 }}>
      <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
        <View style={{ position:'absolute', width:size, height:size, borderRadius:size/2, backgroundColor:'#030c18', borderWidth:1.5, borderColor:`${color}30` }} />
        {Array.from({length:dots},(_,i) => {
          const ang = (i/dots)*2*Math.PI - Math.PI/2;
          return <View key={i} style={{ position:'absolute', left:size/2+r*Math.cos(ang)-3, top:size/2+r*Math.sin(ang)-3, width:5, height:5, borderRadius:2.5, backgroundColor:i<filled?color:`${color}18` }} />;
        })}
        <Text style={{ fontFamily:F, fontSize:size*0.19, color, fontWeight:'bold' }}>{pct}%</Text>
      </View>
      {!!label && <Text style={{ fontFamily:F, fontSize:7, color:'#556677', marginTop:2, letterSpacing:0.5 }}>{label}</Text>}
    </View>
  );
});

/* ══ Mini aiguille jauge ══ */
const MiniNeedle = memo(({ pct=50, size, color='#00aaff' }) => {
  const rot = useRef(new Animated.Value(-120)).current;
  useEffect(() => {
    Animated.timing(rot, { toValue:-120+(Math.min(pct,100)/100)*240, duration:1400, useNativeDriver:true, easing:Easing.out(Easing.cubic) }).start();
  }, [pct]);
  const rotate = rot.interpolate({ inputRange:[-120,120], outputRange:['-120deg','120deg'] });
  const r = size/2;
  const nL = r * 0.68;
  return (
    <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
      <View style={{ position:'absolute', width:size, height:size, borderRadius:r, backgroundColor:'#030c18', borderWidth:2, borderColor:`${color}35` }} />
      {Array.from({length:7},(_,i) => {
        const ang = (-120+(i/6)*240)*Math.PI/180;
        const rr = r-6;
        return <View key={i} style={{ position:'absolute', left:r+rr*Math.cos(ang)-1, top:r+rr*Math.sin(ang)-2, width:1.5, height:i%3===0?7:4, backgroundColor:`${color}70`, transform:[{rotate:`${-120+(i/6)*240+90}deg`}] }} />;
      })}
      <Animated.View style={{ position:'absolute', width:nL, height:2.5, backgroundColor:color, borderRadius:1.5, left:r-nL, top:r-1.25, transform:[{rotate},{translateX:nL/2}] }} />
      <View style={{ position:'absolute', width:8, height:8, borderRadius:4, backgroundColor:color, left:r-4, top:r-4 }} />
      <Text style={{ position:'absolute', top:r*0.5, fontFamily:F, fontSize:size*0.15, color, fontWeight:'bold' }}>{Math.round(pct)}%</Text>
    </View>
  );
});

/* ══════════════════════════════════════
   ZONE SYS.LOG — textes inclinés dans le cadre
══════════════════════════════════════ */
const SysLogZone = memo(() => {
  const LOG_MSGS = ['DATA-CARD','ORDER-RECEPT','HEART-BREAK','SYNC-PULS','DATA-SYSTEM','CART-STATUS','FIREBASE-OK'];
  const [logs, setLogs] = useState([
    {t:'20:50',m:'DATA-CARD',   c:'#00ccff'},
    {t:'20:51',m:'ORDER-RECEPT',c:'#00ff88'},
    {t:'20:51',m:'HEART-BREAK', c:'#ffcc00'},
    {t:'20:53',m:'SYNC',        c:'#00ccff'},
    {t:'20:53',m:'DATA-SYSTEM', c:'#00ccff'},
    {t:'20:53',m:'CART STATUS', c:'#00ff88'},
  ]);
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      const pick = LOG_MSGS[Math.floor(Math.random()*LOG_MSGS.length)];
      const cols = ['#00ccff','#00ff88','#ffcc00'];
      setLogs(p => [{t:now,m:pick,c:cols[Math.floor(Math.random()*cols.length)]},...p].slice(0,7));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // Le cadre SYS.LOG est légèrement incliné en perspective dans le skin
  // On applique une légère rotation pour s'aligner avec le cadre orange
  return (
    <View style={{ flex:1, transform:[{skewY:'-2deg'}], paddingLeft:4, paddingTop:4 }}>
      {logs.map((l,i) => (
        <View key={i} style={{ marginBottom:5 }}>
          <Text style={{ fontFamily:F, fontSize:8, color:'rgba(255,140,0,0.4)', lineHeight:10 }}>{l.t}</Text>
          <Text style={{ fontFamily:F, fontSize:9, color:l.c, letterSpacing:0.3, lineHeight:12 }}>{l.m}</Text>
        </View>
      ))}
      <Text style={{ fontFamily:F, fontSize:7.5, color:'rgba(255,140,0,0.3)', marginTop:4 }}>
        {new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase()}
      </Text>
    </View>
  );
});

/* ══════════════════════════════════════
   JAUGE PRINCIPALE — liquide CA + traits ventes
══════════════════════════════════════ */
const MainGaugeZone = memo(({ caMonthPct=60, cmdMonthPct=55, logoUri=null }) => {
  const zW = SW * Z.gaugeFull.w / 100;
  const zH = SH * Z.gaugeFull.h / 100;
  const logoW = SW * Z.gaugeLogo.w / 100;
  const logoH = SH * Z.gaugeLogo.h / 100;

  // Aiguille CA
  const rot = useRef(new Animated.Value(-135)).current;
  useEffect(() => {
    Animated.timing(rot, { toValue:-135+(Math.min(caMonthPct,100)/100)*270, duration:1600, useNativeDriver:true, easing:Easing.out(Easing.cubic) }).start();
  }, [caMonthPct]);
  const rotate = rot.interpolate({ inputRange:[-135,135], outputRange:['-135deg','135deg'] });

  const gaugeR = Math.min(zW,zH)*0.38;
  const leftH  = zH * 0.8;
  const rightH = zH * 0.72;

  // Graduations CA à gauche (barres liquide)
  const leftTicks = [100,80,60,40,20,0];
  // Traits incurvés à droite (ventes)
  const arcColors = ['#ff2200','#ff5500','#ff8800','#ffcc00','#aaff00','#00ff88','#00ffcc','#00aaff','#0066ff','#8800ff','#cc00ff','#ff00aa'];
  const cmdFilled = Math.round((Math.min(cmdMonthPct,100)/100)*arcColors.length);

  return (
    <View style={{ width:zW, height:zH, alignItems:'center', justifyContent:'center', flexDirection:'row' }}>

      {/* GAUCHE — Liquide CA mensuel */}
      <View style={{ width:zW*0.18, height:zH, justifyContent:'center', alignItems:'center' }}>
        {/* Liquide principal */}
        <LiquidBar pct={caMonthPct} width={16} maxHeight={leftH*0.85} color="#00aaff" />
        {/* Ticks */}
        <View style={{ position:'absolute', right:2, height:leftH*0.85, justifyContent:'space-between' }}>
          {leftTicks.map(t => (
            <View key={t} style={{ flexDirection:'row', alignItems:'center' }}>
              <Text style={{ fontFamily:F, fontSize:8, color:t<=caMonthPct?'#00aaff':'#334455', width:22, textAlign:'right', marginRight:2 }}>{t}</Text>
              <View style={{ width:6, height:1.5, backgroundColor:t<=caMonthPct?'#00aaff':'#223344' }} />
            </View>
          ))}
        </View>
        {/* Indicateur valeur courante */}
        <View style={{ position:'absolute', bottom:leftH*0.85*(1-caMonthPct/100)-2, left:0, flexDirection:'row', alignItems:'center' }}>
          <Text style={{ fontFamily:F, fontSize:9, color:'#00aaff', marginRight:2 }}>›</Text>
          <Text style={{ fontFamily:F, fontSize:9, color:'#00aaff', fontWeight:'bold' }}>{Math.round(caMonthPct)}</Text>
        </View>
      </View>

      {/* CENTRE — Cadran circulaire avec logo */}
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        {/* Anneaux décoratifs */}
        <View style={{ position:'absolute', width:gaugeR*2+16, height:gaugeR*2+16, borderRadius:gaugeR+8, borderWidth:6, borderColor:'#1a2a3a' }} />
        <View style={{ position:'absolute', width:gaugeR*2, height:gaugeR*2, borderRadius:gaugeR, borderWidth:1.5, borderColor:'#ff8c0030' }} />
        {/* Ticks 21 */}
        {Array.from({length:21},(_,i) => {
          const ang = (-135+(i/20)*270)*Math.PI/180;
          const rr = gaugeR;
          const isMaj = i%4===0;
          return (
            <View key={i} style={{
              position:'absolute',
              left:gaugeR+8+rr*Math.cos(ang)-(isMaj?2:1),
              top: gaugeR+8+rr*Math.sin(ang)-(isMaj?4:2),
              width:isMaj?2.5:1.5, height:isMaj?9:5,
              backgroundColor:isMaj?'#ff8c0080':'#ff8c0040',
              transform:[{rotate:`${-135+(i/20)*270+90}deg`}],
            }} />
          );
        })}
        {/* Indicateur haut */}
        <View style={{ position:'absolute', top:gaugeR*0.08, width:3, height:10, backgroundColor:'#ff8c00', borderRadius:1 }} />
        {/* Logo centre */}
        <View style={{ width:logoW, height:logoH, borderRadius:Math.min(logoW,logoH)/2, backgroundColor:'#050e1a', borderWidth:2, borderColor:'#ff8c0040', overflow:'hidden', alignItems:'center', justifyContent:'center' }}>
          {logoUri
            ? <Image source={{uri:logoUri}} style={{width:logoW,height:logoH}} resizeMode="contain" />
            : <Text style={{fontFamily:F, fontSize:logoW*0.12, color:'#ff8c00', fontWeight:'bold', textAlign:'center'}}>NINJA'S</Text>
          }
        </View>
        {/* Aiguille orange */}
        <Animated.View style={{
          position:'absolute',
          width:gaugeR*0.72, height:3,
          backgroundColor:'#ff6600', borderRadius:1.5,
          left:gaugeR+8-gaugeR*0.72, top:gaugeR+8-1.5,
          transform:[{rotate},{translateX:gaugeR*0.72/2}],
        }} />
        <View style={{ position:'absolute', width:9, height:9, borderRadius:4.5, backgroundColor:'#ffaa00', left:gaugeR+4, top:gaugeR+4 }} />
      </View>

      {/* DROITE — Traits incurvés ventes (arc-en-ciel) */}
      <View style={{ width:zW*0.15, height:zH, justifyContent:'center', alignItems:'flex-start', paddingLeft:4 }}>
        {arcColors.map((c,i) => (
          <View key={i} style={{
            width: i<cmdFilled ? 18 : 12,
            height:10, marginBottom:2.5, borderRadius:2,
            backgroundColor: i<cmdFilled ? c : `${c}22`,
          }} />
        ))}
      </View>
    </View>
  );
});

/* ══════════════════════════════════════
   CARTS — carrousel vertical avec images définissables
══════════════════════════════════════ */
const CartsZone = memo(({ carts, cartImages, onCartPress }) => {
  const display = carts.length > 0 ? carts : [
    {id:'c1',name:'CART 01',status:'online'},
    {id:'c2',name:'CART 02',status:'online'},
    {id:'c3',name:'CART 03',status:'offline'},
  ];

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'space-around', paddingVertical:4 }}>
      {/* Flèche haut */}
      <Text style={{ color:'#ff8c00', fontSize:16, marginBottom:2 }}>▲</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1, width:'100%' }} contentContainerStyle={{ alignItems:'center' }}>
        {display.map((cart, i) => {
          const on = cart.status === 'online';
          const rotAnim = useRef(new Animated.Value(0)).current;
          useEffect(() => {
            Animated.loop(Animated.sequence([
              Animated.timing(rotAnim,{toValue:1,duration:2800,useNativeDriver:true,easing:Easing.inOut(Easing.sin)}),
              Animated.timing(rotAnim,{toValue:0,duration:2800,useNativeDriver:true,easing:Easing.inOut(Easing.sin)}),
            ])).start();
          }, []);
          const sx = rotAnim.interpolate({inputRange:[0,0.5,1],outputRange:[1,0.84,1]});
          const imgUri = cartImages && cartImages[cart.id];
          const col = ['#00aaff','#ff8c00','#aa88ff'][i%3];

          return (
            <Pressable key={cart.id} onPress={() => onCartPress && onCartPress(cart)} style={{ alignItems:'center', marginBottom:10 }}>
              <View style={{ width:SW*0.14, height:SH*0.12, alignItems:'center', justifyContent:'center' }}>
                <View style={{ position:'absolute', width:SW*0.145, height:SW*0.145, borderRadius:SW*0.072, borderWidth:1.5, borderColor:on?col:'#333', opacity:0.5 }} />
                <Animated.View style={{ width:SW*0.12, height:SH*0.10, transform:[{scaleX:sx}], alignItems:'center', justifyContent:'center' }}>
                  {imgUri
                    ? <Image source={{uri:imgUri}} style={{width:SW*0.12,height:SH*0.10}} resizeMode="contain" />
                    : (
                      <View style={{ width:SW*0.10, height:SH*0.08, borderWidth:1.5, borderColor:col, borderRadius:4, backgroundColor:`${col}18`, alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ fontFamily:F, fontSize:9, color:col }}>{cart.name||`CART 0${i+1}`}</Text>
                      </View>
                    )
                  }
                </Animated.View>
              </View>
              <Text style={{ fontFamily:F, fontSize:8, color:'#ff8c0088', letterSpacing:1 }}>{cart.name||`CART 0${i+1}`}</Text>
              <View style={{ width:5, height:5, borderRadius:2.5, backgroundColor:on?'#00ff88':'#ff3300', marginTop:2 }} />
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={{ color:'#ff8c00', fontSize:16, marginTop:2 }}>▼</Text>
    </View>
  );
});

/* ══════════════════════════════════════
   BANDES INFÉRIEURES
══════════════════════════════════════ */
const BottomLeftZone = memo(({ carts }) => {
  const display = carts.length > 0 ? carts : [{id:'c1',name:'CART 01',caPct:81},{id:'c2',name:'CART 02',caPct:87},{id:'c3',name:'CART 03',caPct:85}];
  const avg = Math.round(display.reduce((s,c)=>s+(c.caPct||0),0)/Math.max(display.length,1));
  const gSize = Math.min(SH*0.16, SW*0.06);
  return (
    <View style={{ flex:1, flexDirection:'row', alignItems:'center' }}>
      <MiniNeedle pct={avg} size={gSize} color="#00aaff" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{alignItems:'center',paddingLeft:6}}>
        {display.map(c => <SegGauge key={c.id} pct={c.caPct||0} size={gSize*0.85} color="#00aaff" label={c.name} />)}
      </ScrollView>
    </View>
  );
});

const BottomRightZone = memo(({ carts }) => {
  const display = carts.length > 0 ? carts : [{id:'c1',name:'CART 01',cmdPct:63},{id:'c2',name:'CART 02',cmdPct:70},{id:'c3',name:'CART 03',cmdPct:50}];
  const avg = Math.round(display.reduce((s,c)=>s+(c.cmdPct||0),0)/Math.max(display.length,1));
  const gSize = Math.min(SH*0.16, SW*0.06);
  return (
    <View style={{ flex:1, flexDirection:'row', alignItems:'center' }}>
      <MiniNeedle pct={avg} size={gSize} color="#ff8c00" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{alignItems:'center',paddingLeft:6}}>
        {display.map(c => <SegGauge key={c.id} pct={c.cmdPct||0} size={gSize*0.85} color="#ff8c00" label={c.name} />)}
      </ScrollView>
    </View>
  );
});

/* ══════════════════════════════════════
   ÉCRAN PRINCIPAL
══════════════════════════════════════ */
const DashboardScreen = ({ navigation }) => {
  const { carts }  = useAllCarts();
  const raw        = useDashboardStats(carts);
  const stats = { totalToday: raw?.totalToday||0, totalOrders: raw?.totalOrders||0 };

  // Paramètres stockés localement
  const [logoUri, setLogoUri]         = useState(null);
  const [cartImages, setCartImages]   = useState({});

  useEffect(() => {
    AsyncStorage.getItem('dashboard_config').then(v => {
      if (!v) return;
      const cfg = JSON.parse(v);
      if (cfg.logoUri) setLogoUri(cfg.logoUri);
      if (cfg.cartImages) setCartImages(cfg.cartImages);
    });
  }, []);

  const QUOTA_CA_DAY  = 50000;
  const QUOTA_CMD_DAY = 30;

  const cartData = carts.map((c, i) => ({
    id:     c.id,
    name:   (c.cartName||c.id).toUpperCase().slice(0,8),
    caPct:  Math.min(Math.round(((c.todayTotal ||0)/QUOTA_CA_DAY )*100),100),
    cmdPct: Math.min(Math.round(((c.todayOrders||0)/QUOTA_CMD_DAY)*100),100),
    status: c.updatedAt&&(Date.now()/1000-c.updatedAt.seconds)<300?'online':'offline',
    imageUri: cartImages[c.id] || c.cartImageUrl || null,
  }));

  const caMonthPct  = Math.min(Math.round((stats.totalToday/(QUOTA_CA_DAY*30))*100),100)||60;
  const cmdMonthPct = 55;

  // Navigation sans barre — via engrenage
  const goToSettings = useCallback(() => {
    navigation && navigation.navigate('Config');
  }, [navigation]);
  const goToRewards  = useCallback(() => Alert.alert('Tableau de récompenses', 'Écran à venir'), []);
  const goToLumi     = useCallback(() => Alert.alert('Lumi — IA', 'Écran à venir'), []);
  const goToStocks   = useCallback(() => Alert.alert('Gestion des stocks', 'Écran à venir'), []);
  const goToCart     = useCallback((cart) => Alert.alert('Profil cart', cart.name), []);

  return (
    <View style={st.root}>
      {/* Fond galaxie */}
      <View style={StyleSheet.absoluteFill}>
        <View style={st.bg} />
        {[[50,80],[250,140],[550,90],[950,170],[1050,80],[400,700],[750,620],[100,500],[1200,350]].map(([x,y],i) => {
          const a = useRef(new Animated.Value(0.4)).current;
          useEffect(() => {
            Animated.loop(Animated.sequence([
              Animated.timing(a,{toValue:0.9,duration:900+i*180,useNativeDriver:true}),
              Animated.timing(a,{toValue:0.1,duration:900+i*180,useNativeDriver:true}),
            ])).start();
          }, []);
          return <Animated.View key={i} style={{ position:'absolute', left:x/1440*SW, top:y/900*SH, width:2, height:2, borderRadius:1, backgroundColor:'#ffffff', opacity:a }} />;
        })}
      </View>

      {/* Skin PNG — couvre tout l'écran */}
      <Image
        source={require('../assets/dashboard_skin.png')}
        style={{ position:'absolute', top:0, left:0, width:SW, height:SH }}
        resizeMode="stretch"
      />

      {/* ══ ÉLÉMENTS LOGIQUES DANS LES ZONES BLANCHES ══ */}

      {/* Logo gauche */}
      <Pressable style={[z2s(Z.logoL), st.logoZone]} onPress={goToSettings}>
        {logoUri
          ? <Image source={{uri:logoUri}} style={st.logoImg} resizeMode="contain" />
          : <View style={st.logoPH}><Text style={st.logoPHT}>N</Text></View>
        }
      </Pressable>

      {/* Stat 03 */}
      <View style={[z2s(Z.stat03), {alignItems:'center',justifyContent:'center'}]}>
        <Text style={st.statNum}>{String(carts.length||3).padStart(2,'0')}</Text>
      </View>

      {/* Stat 100% */}
      <View style={[z2s(Z.stat100), {alignItems:'center',justifyContent:'center'}]}>
        <Text style={st.statNum}>100%</Text>
      </View>

      {/* Logo droit */}
      <Pressable style={[z2s(Z.logoR), st.logoZone]} onPress={goToSettings}>
        {logoUri
          ? <Image source={{uri:logoUri}} style={st.logoImg} resizeMode="contain" />
          : <View style={st.logoPH}><Text style={st.logoPHT}>N</Text></View>
        }
      </Pressable>

      {/* SYS.LOG */}
      <View style={z2s(Z.syslog)}>
        <SysLogZone />
      </View>

      {/* Jauge principale — liquide CA + aiguille + traits ventes */}
      <View style={z2s(Z.gaugeFull)}>
        <MainGaugeZone caMonthPct={caMonthPct} cmdMonthPct={cmdMonthPct} logoUri={logoUri} />
      </View>

      {/* Bouton Récompenses */}
      <Pressable style={[z2s(Z.navRew), st.navBtn]} onPress={goToRewards}>
        <Text style={st.navIcon}>🏆</Text>
      </Pressable>

      {/* Bouton Lumi */}
      <Pressable style={[z2s(Z.navLumi), {alignItems:'center',justifyContent:'center'}]} onPress={goToLumi}>
        <View style={st.lumiBtn}><Text style={{fontSize:20}}>🤖</Text></View>
      </Pressable>

      {/* Bouton Stocks */}
      <Pressable style={[z2s(Z.navStocks), st.navBtn]} onPress={goToStocks}>
        {[72,22,16].map((v,i) => (
          <View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:3}}>
            <View style={{width:Math.max(v*0.3,4),height:4,backgroundColor:i===0?'#00ff88':i===1?'#00aaff':'#ffcc00',borderRadius:1,marginRight:3}} />
            <Text style={{fontFamily:F,fontSize:7,color:'#aaa'}}>{v}%</Text>
          </View>
        ))}
      </Pressable>

      {/* Carts colonne droite */}
      <View style={z2s(Z.carts)}>
        <CartsZone carts={cartData} cartImages={cartImages} onCartPress={goToCart} />
      </View>

      {/* Bouton paramètres (engrenage) */}
      <Pressable style={[z2s(Z.settings), {alignItems:'center',justifyContent:'center'}]} onPress={goToSettings}>
        <Text style={{color:'#ff8c0088',fontSize:22}}>⚙</Text>
      </Pressable>

      {/* Bande inférieure gauche — CA/jour */}
      <View style={z2s(Z.bottomL)}>
        <BottomLeftZone carts={cartData} />
      </View>

      {/* Bande inférieure droite — Commandes/jour */}
      <View style={z2s(Z.bottomR)}>
        <BottomRightZone carts={cartData} />
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  root:   { flex:1, backgroundColor:'#020810' },
  bg:     { ...StyleSheet.absoluteFillObject, backgroundColor:'#020810' },
  logoZone: { alignItems:'center', justifyContent:'center' },
  logoImg:  { width:'90%', height:'90%', borderRadius:100 },
  logoPH:   { width:'75%', height:'75%', borderRadius:100, backgroundColor:'#0a1525', borderWidth:2, borderColor:'#c8a040', alignItems:'center', justifyContent:'center' },
  logoPHT:  { fontFamily:F, fontSize:SW*0.02, color:'#c8a040', fontWeight:'bold' },
  statNum:  { fontFamily:F, fontSize:SH*0.042, color:'#e8d8c0', fontWeight:'bold', letterSpacing:3 },
  navBtn:   { alignItems:'center', justifyContent:'center' },
  navIcon:  { fontSize:22 },
  lumiBtn:  { width:SH*0.07, height:SH*0.07, borderRadius:SH*0.035, backgroundColor:'#0a1a2a', borderWidth:1.5, borderColor:'#0066ff', alignItems:'center', justifyContent:'center' },
});

module.exports = DashboardScreen;
