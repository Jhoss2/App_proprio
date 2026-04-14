/**
 * DashboardScreen — LAYERING TECHNIQUE
 * Skin PNG 1440x900 en fond + éléments logiques superposés en position absolue %
 */
const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const {
  View, Text, Image, ScrollView, Pressable,
  StyleSheet, Animated, Easing, Dimensions,
} = require('react-native');
const { useAllCarts, useDashboardStats } = require('../hooks/useFirestore');
const { C, F } = require('../constants');

const { width: SW, height: SH } = Dimensions.get('window');
const px = (p) => (p / 100) * SW;
const py = (p) => (p / 100) * SH;

/* ─── LED ─── */
const Led = memo(({ color, size = 10, delay = 0 }) => {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 0.1, duration: 500, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1,   duration: 500, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color, opacity: a }} />;
});

/* ─── Néon animé ─── */
const NeonText = memo(({ text, style, color = '#00ffcc' }) => {
  const a = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1,   duration: 1400, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.5, duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.Text style={[style, { color, opacity: a }]}>{text}</Animated.Text>;
});

/* ─── Aiguille mini ─── */
const Needle = memo(({ pct = 50, size, color = '#00aaff' }) => {
  const rot = useRef(new Animated.Value(-120)).current;
  useEffect(() => {
    Animated.timing(rot, {
      toValue: -120 + (Math.min(pct,100)/100)*240,
      duration: 1400, useNativeDriver: true, easing: Easing.out(Easing.cubic),
    }).start();
  }, [pct]);
  const rotate = rot.interpolate({ inputRange: [-120,120], outputRange: ['-120deg','120deg'] });
  const r = size / 2;
  const nL = r * 0.7;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position:'absolute', width:size, height:size, borderRadius:r, backgroundColor:'#020810', borderWidth:2, borderColor:`${color}40` }} />
      {Array.from({ length: 7 }, (_, i) => {
        const ang = (-120 + (i/6)*240) * Math.PI / 180;
        const rr = r - 6;
        return (
          <View key={i} style={{
            position:'absolute',
            left: r + rr*Math.cos(ang) - 1, top: r + rr*Math.sin(ang) - 2,
            width: 2, height: i%3===0 ? 7 : 4,
            backgroundColor: `${color}80`,
            transform: [{ rotate: `${-120+(i/6)*240+90}deg` }],
          }} />
        );
      })}
      <Animated.View style={{
        position:'absolute', width:nL, height:2.5,
        backgroundColor:color, borderRadius:1.5,
        left:r-nL, top:r-1.25,
        transform:[{ rotate },{ translateX: nL/2 }],
      }} />
      <View style={{ position:'absolute', width:8, height:8, borderRadius:4, backgroundColor:color, left:r-4, top:r-4 }} />
      <Text style={{ position:'absolute', top:r*0.55, fontFamily:F, fontSize:size*0.14, color, fontWeight:'bold' }}>{Math.round(pct)}%</Text>
    </View>
  );
});

/* ─── Jauge segments ─── */
const SegGauge = memo(({ pct=75, size=56, color='#00aaff', label='' }) => {
  const dots = 16;
  const filled = Math.round((Math.min(pct,100)/100)*dots);
  const r = size/2 - 5;
  return (
    <View style={{ alignItems:'center', marginHorizontal:8 }}>
      <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
        <View style={{ position:'absolute', width:size, height:size, borderRadius:size/2, backgroundColor:'#020810', borderWidth:1.5, borderColor:`${color}30` }} />
        {Array.from({ length:dots }, (_,i) => {
          const ang = (i/dots)*2*Math.PI - Math.PI/2;
          return (
            <View key={i} style={{
              position:'absolute',
              left: size/2 + r*Math.cos(ang) - 3,
              top:  size/2 + r*Math.sin(ang) - 3,
              width:6, height:6, borderRadius:3,
              backgroundColor: i<filled ? color : `${color}18`,
            }} />
          );
        })}
        <Text style={{ fontFamily:F, fontSize:size*0.19, color, fontWeight:'bold' }}>{pct}%</Text>
      </View>
      {!!label && <Text style={{ fontFamily:F, fontSize:7.5, color:'#667788', marginTop:3 }}>{label}</Text>}
    </View>
  );
});

/* ─── Jauge principale ─── */
const MainGauge = memo(({ caMonthPct=75, cmdMonthPct=60 }) => {
  const SIZE = py(38);
  const R = SIZE / 2;
  const rot = useRef(new Animated.Value(-135)).current;
  useEffect(() => {
    Animated.timing(rot, {
      toValue: -135 + (Math.min(caMonthPct,100)/100)*270,
      duration:1600, useNativeDriver:true, easing:Easing.out(Easing.cubic),
    }).start();
  }, [caMonthPct]);
  const rotate = rot.interpolate({ inputRange:[-135,135], outputRange:['-135deg','135deg'] });
  const leftTicks = [100,80,60,40,20,0];
  const arcColors = ['#ff2200','#ff5500','#ff8800','#ffcc00','#aaff00','#00ff88','#00ffcc','#00aaff','#0066ff','#6600ff','#cc00ff','#ff00aa'];
  const cmdFilled = Math.round((Math.min(cmdMonthPct,100)/100)*arcColors.length);
  return (
    <View style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
      {/* Graduation CA gauche */}
      <View style={{ alignItems:'flex-end', marginRight: px(0.5) }}>
        {leftTicks.map(t => (
          <View key={t} style={{ flexDirection:'row', alignItems:'center', marginBottom: py(0.85) }}>
            <Text style={{ fontFamily:F, fontSize:9, color: t<=caMonthPct?'#00aaff':'#334455', width:26, textAlign:'right', marginRight:3 }}>{t}</Text>
            <View style={{ width:7, height:1.5, backgroundColor: t<=caMonthPct?'#00aaff':'#223344' }} />
          </View>
        ))}
      </View>
      {/* Cadran */}
      <View style={{ width:SIZE, height:SIZE, alignItems:'center', justifyContent:'center' }}>
        <View style={{ position:'absolute', width:SIZE, height:SIZE, borderRadius:R, borderWidth:8, borderColor:'#1a2a3a' }} />
        <View style={{ position:'absolute', width:SIZE-24, height:SIZE-24, borderRadius:(SIZE-24)/2, borderWidth:1.5, borderColor:'#ff8c0030' }} />
        {Array.from({ length:21 }, (_,i) => {
          const ang = (-135+(i/20)*270)*Math.PI/180;
          const isMaj = i%4===0;
          const rr = R-8;
          return (
            <View key={i} style={{
              position:'absolute',
              left: R+rr*Math.cos(ang)-1, top: R+rr*Math.sin(ang)-(isMaj?4:2),
              width:isMaj?2.5:1.5, height:isMaj?9:5,
              backgroundColor:isMaj?'#ff8c0088':'#ff8c0044',
              transform:[{ rotate:`${-135+(i/20)*270+90}deg` }],
            }} />
          );
        })}
        <View style={{ position:'absolute', top:4, width:3, height:10, backgroundColor:'#ff8c00', borderRadius:1 }} />
        <View style={{ position:'absolute', width:SIZE*0.48, height:SIZE*0.48, borderRadius:SIZE*0.24, backgroundColor:'#050e1a', borderWidth:2, borderColor:'#ff8c0040', alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontFamily:F, fontSize:SIZE*0.09, color:'#ff8c00', fontWeight:'bold', textAlign:'center' }}>NINJA'S</Text>
        </View>
        <Animated.View style={{
          position:'absolute', width:R*0.75, height:3,
          backgroundColor:'#ff6600', borderRadius:1.5,
          left:R-R*0.75, top:R-1.5,
          transform:[{ rotate },{ translateX: R*0.75/2 }],
        }} />
        <View style={{ position:'absolute', width:10, height:10, borderRadius:5, backgroundColor:'#ffaa00', left:R-5, top:R-5 }} />
        {/* Indicateur pointeur */}
        <Text style={{ position:'absolute', top:-2, fontFamily:F, fontSize:10, color:'#ff8c00' }}>v</Text>
      </View>
      {/* Graduation commandes droite */}
      <View style={{ marginLeft: px(0.5) }}>
        {arcColors.map((c,i) => (
          <View key={i} style={{ width:18, height:10, marginBottom:2, borderRadius:1, backgroundColor: i<cmdFilled ? c : `${c}22` }} />
        ))}
      </View>
    </View>
  );
});

/* ─── SYS.LOG ─── */
const SysLog = memo(() => {
  const MSGS = [
    {m:'DATA-CARD',c:'#00ccff'},{m:'ORDER-RECEPT',c:'#00ff88'},
    {m:'HEART-BREAK',c:'#ffcc00'},{m:'SYNC-PULS',c:'#00ccff'},
    {m:'DATA-SYSTEM',c:'#00ccff'},{m:'CART-STATUS',c:'#00ff88'},
  ];
  const [logs, setLogs] = useState([
    {t:'20:50',m:'DATA-CARD',c:'#00ccff'},{t:'20:51',m:'ORDER-RECEPT',c:'#00ff88'},
    {t:'20:51',m:'HEART-BREAK',c:'#ffcc00'},{t:'20:53',m:'SYNC',c:'#00ccff'},
    {t:'20:53',m:'DATA-SYSTEM',c:'#00ccff'},{t:'20:53',m:'CART STATUS',c:'#00ff88'},
  ]);
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      const p = MSGS[Math.floor(Math.random()*MSGS.length)];
      setLogs(prev => [{t:now,...p},...prev].slice(0,7));
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  const date = new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase();
  return (
    <View style={{ flex:1, padding: px(0.8) }}>
      <Text style={{ fontFamily:F, fontSize:10, color:'#ff8c00', letterSpacing:1, marginBottom:5, fontWeight:'bold' }}>//SYS.LOG</Text>
      <View style={{ flexDirection:'row', flex:1 }}>
        <View style={{ flex:1 }}>
          {logs.map((l,i) => (
            <View key={i} style={{ marginBottom:4 }}>
              <Text style={{ fontFamily:F, fontSize:8, color:'rgba(255,140,0,0.45)' }}>{l.t}</Text>
              <Text style={{ fontFamily:F, fontSize:9, color:l.c, letterSpacing:0.3 }}>{l.m}</Text>
            </View>
          ))}
          <Text style={{ fontFamily:F, fontSize:8, color:'rgba(255,140,0,0.3)', marginTop:3 }}>{date}</Text>
        </View>
        <View style={{ width:15, alignItems:'center', paddingTop:16 }}>
          {['#00aaff','#00cc44','#ffcc00','#00aa66','#00aaff','#ffcc00'].map((c,i) => (
            <Led key={i} color={c} size={9} delay={i*350} />
          ))}
        </View>
      </View>
    </View>
  );
});

/* ─── Carts ─── */
const Carts = memo(({ carts }) => {
  const display = carts.length > 0 ? carts : [
    {id:'c1',name:'CART 01',status:'online',index:0},
    {id:'c2',name:'CART 02',status:'online',index:1},
    {id:'c3',name:'CART 03',status:'offline',index:2},
  ];
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'space-around', paddingVertical: py(0.5) }}>
      <Text style={{ color:'#ff8c00', fontSize:14 }}>▲</Text>
      {display.map((c,i) => {
        const on = c.status==='online';
        const rot = useRef(new Animated.Value(0)).current;
        useEffect(() => {
          Animated.loop(Animated.sequence([
            Animated.timing(rot,{toValue:1,duration:2800,useNativeDriver:true,easing:Easing.inOut(Easing.sin)}),
            Animated.timing(rot,{toValue:0,duration:2800,useNativeDriver:true,easing:Easing.inOut(Easing.sin)}),
          ])).start();
        }, []);
        const sx = rot.interpolate({inputRange:[0,0.5,1],outputRange:[1,0.82,1]});
        const col = ['#00aaff','#ff8c00','#aaaaff'][i%3];
        return (
          <Pressable key={c.id} style={{ alignItems:'center' }}>
            <View style={{ width:px(8), height:py(8), alignItems:'center', justifyContent:'center' }}>
              <View style={{ position:'absolute', width:px(8.5), height:px(8.5), borderRadius:px(4.25), borderWidth:1.5, borderColor:on?col:'#333', opacity:0.6 }} />
              <Animated.View style={{ width:px(6.5), height:py(5.5), transform:[{scaleX:sx}], alignItems:'center', justifyContent:'center' }}>
                {c.imageUri
                  ? <Image source={{uri:c.imageUri}} style={{width:px(6.5),height:py(5.5)}} resizeMode="contain" />
                  : (
                    <View style={{ width:px(5.5), height:py(4.5), borderWidth:1.5, borderColor:col, borderRadius:3, backgroundColor:`${col}18`, alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ fontFamily:F, fontSize:8, color:col }}>{c.name || `CART 0${i+1}`}</Text>
                    </View>
                  )
                }
              </Animated.View>
            </View>
            <Text style={{ fontFamily:F, fontSize:8, color:'#ff8c0099', letterSpacing:1, marginTop:2 }}>{c.name || `CART 0${i+1}`}</Text>
            <View style={{ width:5, height:5, borderRadius:2.5, backgroundColor:on?'#00ff88':'#ff3300', marginTop:2 }} />
          </Pressable>
        );
      })}
      <Text style={{ color:'#ff8c00', fontSize:14 }}>▼</Text>
    </View>
  );
});

/* ─── Nav buttons ─── */
const NavBtns = memo(({ onRewards, onLumi, onStocks }) => {
  const lp = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(lp,{toValue:1.12,duration:900,useNativeDriver:true}),
      Animated.timing(lp,{toValue:1,duration:900,useNativeDriver:true}),
    ])).start();
  }, []);
  return (
    <View style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'space-around' }}>
      <Pressable onPress={onRewards} style={{ flex:1, alignItems:'center' }}>
        <View style={{ flexDirection:'row', marginBottom:2 }}>
          <Text style={{fontSize:11}}>🏅</Text>
          <Text style={{fontSize:11,marginLeft:3}}>🏆</Text>
        </View>
        <Text style={st.navSub}>SOLD OUT</Text>
        <Text style={st.navSub}>SOLD OUT</Text>
        <Text style={st.navTitle}>TABLEAU DE RÉCOMPENSES</Text>
      </Pressable>
      <Pressable onPress={onLumi} style={{ flex:1, alignItems:'center' }}>
        <Animated.View style={[st.lumiCircle,{transform:[{scale:lp}]}]}>
          <Text style={{fontSize:18}}>🤖</Text>
        </Animated.View>
        <Text style={st.navTitle}>LUMI</Text>
      </Pressable>
      <Pressable onPress={onStocks} style={{ flex:1, alignItems:'center' }}>
        <View style={{marginBottom:2}}>
          {[72,22,160].map((v,i) => (
            <View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:2}}>
              <View style={{width:Math.max(v*0.28,4),height:4,backgroundColor:i===0?'#00ff88':i===1?'#00aaff':'#ffcc00',borderRadius:1,marginRight:3}} />
              <Text style={{fontFamily:F,fontSize:7,color:'#aaa'}}>{v}%</Text>
            </View>
          ))}
        </View>
        <Text style={st.navTitle}>GESTION DES STOCKS</Text>
      </Pressable>
    </View>
  );
});

/* ─── Bandes inférieures ─── */
const BottomBands = memo(({ carts }) => {
  const display = carts.length > 0 ? carts : [
    {id:'c1',name:'CART 01',caPct:81,cmdPct:63},
    {id:'c2',name:'CART 02',caPct:87,cmdPct:70},
    {id:'c3',name:'CART 03',caPct:85,cmdPct:50},
  ];
  const caAvg  = Math.round(display.reduce((s,c)=>s+(c.caPct||0),0)/Math.max(display.length,1));
  const cmdAvg = Math.round(display.reduce((s,c)=>s+(c.cmdPct||0),0)/Math.max(display.length,1));
  const gSize  = Math.min(py(18), px(7));
  return (
    <View style={{ flex:1, flexDirection:'row' }}>
      <View style={{ width:px(4.5), alignItems:'center', justifyContent:'center' }}>
        <Text style={{color:'#ff8c0055',fontSize:15}}>⚙</Text>
      </View>
      {/* CA */}
      <View style={{ flex:1, paddingHorizontal:px(0.5) }}>
        <Text style={[st.bandTitle,{color:'#00aaff'}]}>CHIFFRE D'AFFAIRES/JOUR</Text>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center' }}>
          <Needle pct={caAvg} size={gSize} color="#00aaff" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{alignItems:'center',paddingLeft:px(0.5)}}>
            {display.map(c => <SegGauge key={c.id} pct={c.caPct||0} size={gSize*0.86} color="#00aaff" label={c.name} />)}
          </ScrollView>
        </View>
      </View>
      <View style={{width:1,backgroundColor:'#ff8c0025',marginVertical:py(1)}} />
      {/* Commandes */}
      <View style={{ flex:1, paddingHorizontal:px(0.5) }}>
        <Text style={[st.bandTitle,{color:'#ff8c00'}]}>Commandes/Jour</Text>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center' }}>
          <Needle pct={cmdAvg} size={gSize} color="#ff8c00" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{alignItems:'center',paddingLeft:px(0.5)}}>
            {display.map(c => <SegGauge key={c.id} pct={c.cmdPct||0} size={gSize*0.86} color="#ff8c00" label={c.name} />)}
          </ScrollView>
        </View>
      </View>
    </View>
  );
});

/* ════════════════════════════════════════
   ÉCRAN PRINCIPAL
════════════════════════════════════════ */
const DashboardScreen = () => {
  const { carts }  = useAllCarts();
  const raw        = useDashboardStats(carts);
  const stats = { totalToday: raw?.totalToday||0, totalOrders: raw?.totalOrders||0 };
  const QUOTA_CA_DAY = 50000, QUOTA_CMD_DAY = 30;
  const cartData = carts.map((c,i) => ({
    id: c.id,
    name: (c.cartName||c.id).toUpperCase().slice(0,8),
    caPct:  Math.min(Math.round(((c.todayTotal||0)/QUOTA_CA_DAY)*100),100),
    cmdPct: Math.min(Math.round(((c.todayOrders||0)/QUOTA_CMD_DAY)*100),100),
    status: c.updatedAt&&(Date.now()/1000-c.updatedAt.seconds)<300?'online':'offline',
    imageUri: c.cartImageUrl||null, index:i,
  }));
  const caMonthPct  = Math.min(Math.round((stats.totalToday/(QUOTA_CA_DAY*30))*100),100)||60;
  const cmdMonthPct = 55;

  // Coordonnées des trous (cx%, cy%, w%, h%) sur base 1440x900
  const H = {
    logoL:  { cx: 6.1, cy: 6.9, w: 5.9, h: 9.4 },
    st03:   { cx:24.0, cy: 7.8, w:11.8, h: 7.8 },
    corp:   { cx:47.6, cy: 7.5, w:27.1, h: 9.4 },
    st100:  { cx:67.7, cy: 7.8, w:11.8, h: 7.8 },
    logoR:  { cx:89.9, cy: 6.9, w: 6.2, h: 9.4 },
    syslog: { cx:13.0, cy:46.7, w:17.0, h:46.7 },
    gauge:  { cx:45.5, cy:43.5, w:29.9, h:40.0 },
    carts:  { cx:78.3, cy:47.8, w:21.2, h:48.9 },
    nav:    { cx:44.0, cy:66.2, w:33.8, h:11.0 },
    bottom: { cx:47.5, cy:86.0, w:79.0, h:25.0 },
  };
  const abs = (h) => ({
    position:'absolute',
    left:  px(h.cx - h.w/2),
    top:   py(h.cy - h.h/2),
    width: px(h.w),
    height:py(h.h),
  });

  return (
    <View style={st.root}>
      {/* Fond galaxie */}
      <View style={StyleSheet.absoluteFill}>
        <View style={st.bg} />
        {[[50,80],[200,150],[500,90],[900,170],[1050,80],[400,700],[750,620],[100,500]].map(([x,y],i) => {
          const a = useRef(new Animated.Value(0.4)).current;
          useEffect(() => {
            Animated.loop(Animated.sequence([
              Animated.timing(a,{toValue:0.9,duration:1000+i*200,useNativeDriver:true}),
              Animated.timing(a,{toValue:0.1,duration:1000+i*200,useNativeDriver:true}),
            ])).start();
          }, []);
          return <Animated.View key={i} style={{ position:'absolute', left:x/1440*SW, top:y/900*SH, width:2, height:2, borderRadius:1, backgroundColor:'#fff', opacity:a }} />;
        })}
      </View>

      {/* Skin PNG */}
      <Image
        source={require('../assets/dashboard_skin.png')}
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
        resizeMode="stretch"
      />

      {/* Éléments logiques dans les trous */}
      <View style={[abs(H.logoL),{alignItems:'center',justifyContent:'center'}]}>
        <View style={st.logoC}><Text style={st.logoT}>N</Text></View>
      </View>

      <View style={[abs(H.st03),{alignItems:'center',justifyContent:'center'}]}>
        <Text style={st.statN}>{String(carts.length||3).padStart(2,'0')}</Text>
      </View>

      <View style={[abs(H.corp),{alignItems:'center',justifyContent:'center'}]}>
        <NeonText text="NINJA'S CORP" style={st.neonT} color="#00ffcc" />
      </View>

      <View style={[abs(H.st100),{alignItems:'center',justifyContent:'center'}]}>
        <Text style={st.statN}>100%</Text>
      </View>

      <View style={[abs(H.logoR),{alignItems:'center',justifyContent:'center'}]}>
        <View style={st.logoC}><Text style={st.logoT}>N</Text></View>
      </View>

      <View style={abs(H.syslog)}><SysLog /></View>
      <View style={abs(H.gauge)}><MainGauge caMonthPct={caMonthPct} cmdMonthPct={cmdMonthPct} /></View>
      <View style={abs(H.carts)}><Carts carts={cartData} /></View>
      <View style={abs(H.nav)}><NavBtns onRewards={()=>{}} onLumi={()=>{}} onStocks={()=>{}} /></View>
      <View style={abs(H.bottom)}><BottomBands carts={cartData} /></View>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex:1, backgroundColor:'#020810' },
  bg:   { ...StyleSheet.absoluteFillObject, backgroundColor:'#020810' },
  logoC:{ width:px(4.5), height:px(4.5), borderRadius:px(2.25), backgroundColor:'#0a1525', borderWidth:2, borderColor:'#c8a040', alignItems:'center', justifyContent:'center' },
  logoT:{ fontFamily:F, fontSize:px(1.8), color:'#c8a040', fontWeight:'bold' },
  statN:{ fontFamily:F, fontSize:py(4), color:'#e8d8c0', fontWeight:'bold', letterSpacing:3 },
  neonT:{ fontFamily:F, fontSize:py(3.8), fontWeight:'bold', letterSpacing:4,
    textShadowColor:'#00ffcc', textShadowOffset:{width:0,height:0}, textShadowRadius:10 },
  navSub:  { fontFamily:F, fontSize:7, color:'#ff8c0077', letterSpacing:0.3 },
  navTitle:{ fontFamily:F, fontSize:6.5, color:'#ff8c00aa', marginTop:1, textAlign:'center' },
  lumiCircle:{ width:py(5.5), height:py(5.5), borderRadius:py(2.75), backgroundColor:'#0a1a2a', borderWidth:1.5, borderColor:'#0066ff', alignItems:'center', justifyContent:'center', marginBottom:3 },
  bandTitle: { fontFamily:F, fontSize:9, letterSpacing:0.8, marginBottom:3 },
});

module.exports = DashboardScreen;
