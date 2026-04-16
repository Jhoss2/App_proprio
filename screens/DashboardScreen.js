/**
 * DashboardScreen v4
 * FIX CRASH : hooks sortis des .map() → composant CartItem séparé
 * SVG JAUGE  : arc CA parfait + ticks courbes + liquide + traits ventes
 * FOND/LOGO  : définis depuis galerie via paramètres (AsyncStorage)
 * PAS de asset skin en dur — fond configurable
 */
const React = require('react');
const { useState, useEffect, useRef, useCallback, memo } = React;
const {
  View, Text, Image, ScrollView, Pressable,
  StyleSheet, Animated, Easing, Dimensions, Alert,
} = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const SvgLib   = require('react-native-svg');
const Svg      = SvgLib.default || SvgLib.Svg;
const { Circle, Path, Line, Text: SvgText, G, Defs, LinearGradient, Stop, ClipPath, Rect } = SvgLib;

const { useAllCarts, useDashboardStats } = require('../hooks/useFirestore');
const { F } = require('../constants');

const { width: SW, height: SH } = Dimensions.get('window');

// Positions % sur base du skin 1440×900
const Z = {
  logoL:    { l:1.7,  t:2.2,  w:9.7,  h:12.8 },
  stat03:   { l:18.8, t:4.2,  w:11.8, h:8.9  },
  stat100:  { l:60.4, t:4.2,  w:12.8, h:8.9  },
  logoR:    { l:86.8, t:2.2,  w:10.4, h:12.8 },
  syslog:   { l:6.6,  t:28.3, w:13.2, h:40.6 },
  gauge:    { l:25.3, t:24.4, w:35.1, h:46.7 },
  navRew:   { l:27.1, t:62.8, w:12.2, h:9.4  },
  navLumi:  { l:39.6, t:60.6, w:8.0,  h:12.2 },
  navStocks:{ l:47.9, t:62.8, w:12.8, h:9.4  },
  carts:    { l:66.3, t:23.3, w:21.2, h:54.4 },
  settings: { l:1.4,  t:75.6, w:4.9,  h:8.9  },
  bottomL:  { l:8.0,  t:74.7, w:29.9, h:24.2 },
  bottomR:  { l:43.8, t:74.7, w:36.1, h:24.2 },
};

const z2s = (z) => ({
  position:'absolute',
  left:   SW * z.l / 100,
  top:    SH * z.t / 100,
  width:  SW * z.w / 100,
  height: SH * z.h / 100,
});

// Helper arc SVG
const polarToCart = (cx, cy, r, angleDeg) => {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const s = polarToCart(cx, cy, r, startDeg);
  const e = polarToCart(cx, cy, r, endDeg);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

/* ══════════════════════════════════════
   ATOMS
══════════════════════════════════════ */

const Led = memo(({ color='#00aaff', size=9, delay=0 }) => {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue:0.1, duration:500, useNativeDriver:true }),
      Animated.timing(a, { toValue:1,   duration:500, useNativeDriver:true }),
    ])).start();
  }, []);
  return <Animated.View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:color, opacity:a, marginBottom:6 }} />;
});

const NeonText = memo(({ text, size=18, color='#00ffcc', style }) => {
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

/* ══════════════════════════════════════
   JAUGE PRINCIPALE — 100% SVG
   Arc CA (liquide bleu), ticks courbes, logo, aiguille, traits ventes
══════════════════════════════════════ */
const MainGaugeSVG = memo(({ caMonthPct=60, cmdMonthPct=55, logoUri=null }) => {
  const W = SW * Z.gauge.w / 100;
  const H = SH * Z.gauge.h / 100;

  // Paramètres du cadran
  const CX = W * 0.52;
  const CY = H * 0.50;
  const R_OUTER  = Math.min(W, H) * 0.38;
  const R_INNER  = R_OUTER * 0.62;
  const R_NEEDLE = R_OUTER * 0.82;
  const R_TICK_OUT = R_OUTER * 0.94;
  const R_TICK_IN_MAJ = R_OUTER * 0.84;
  const R_TICK_IN_MIN = R_OUTER * 0.88;

  // Arc 270° (−135° à +135°)
  const START_DEG = -135;
  const END_DEG   = 135;
  const SPAN      = END_DEG - START_DEG; // 270

  // Progression CA : arc rempli
  const caAngle  = START_DEG + (Math.min(caMonthPct,100)/100) * SPAN;
  const cmdAngle = START_DEG + (Math.min(cmdMonthPct,100)/100) * SPAN;

  // Aiguille animée
  const rotAnim = useRef(new Animated.Value(START_DEG)).current;
  useEffect(() => {
    Animated.timing(rotAnim, {
      toValue: caAngle, duration:1800,
      useNativeDriver:false, easing:Easing.out(Easing.cubic),
    }).start();
  }, [caMonthPct]);

  // Ticks : 1 tous les 27° → 11 ticks majeurs, 4 mineurs entre chaque
  const ticks = [];
  for (let i = 0; i <= 20; i++) {
    const deg  = START_DEG + (i / 20) * SPAN;
    const isMaj = i % 4 === 0;
    const r1 = isMaj ? R_TICK_IN_MAJ : R_TICK_IN_MIN;
    const p1 = polarToCart(CX, CY, R_TICK_OUT, deg);
    const p2 = polarToCart(CX, CY, r1, deg);
    ticks.push({ p1, p2, isMaj, label: isMaj ? String(Math.round((i/20)*100)) : null, deg, i });
  }

  // Traits ventes à droite (arc-en-ciel) — segments d'arc courts
  const ARC_COLORS = ['#ff2200','#ff5500','#ff8800','#ffcc00','#aaff00','#00ff88','#00ffcc','#00aaff','#0066ff','#8800ff','#cc00ff','#ff00aa'];
  const cmdFilled = Math.round((Math.min(cmdMonthPct,100)/100)*ARC_COLORS.length);
  const R_SALES_OUT = R_OUTER * 1.12;
  const R_SALES_IN  = R_OUTER * 1.04;

  // Liquide CA à gauche — arc rempli
  const R_LIQ_OUT = R_OUTER * 0.55;
  const R_LIQ_IN  = R_OUTER * 0.44;

  // Graduation CA gauche (valeurs texte)
  const caLabels = [0,20,40,60,80,100];

  return (
    <View style={{ width:W, height:H }}>
      <Svg width={W} height={H}>
        <Defs>
          {/* Gradient liquide CA */}
          <LinearGradient id="liqGrad" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0"   stopColor="#001833" />
            <Stop offset="1"   stopColor="#00aaff" />
          </LinearGradient>
          {/* Gradient arc rempli */}
          <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ff4400" />
            <Stop offset="1" stopColor="#ffaa00" />
          </LinearGradient>
        </Defs>

        {/* ── Fond du cadran ── */}
        <Circle cx={CX} cy={CY} r={R_OUTER+10} fill="#0a1020" opacity={0.85} />

        {/* ── Arc piste (fond gris) ── */}
        <Path
          d={arcPath(CX, CY, R_OUTER, START_DEG, END_DEG)}
          fill="none" stroke="#1a2a3a" strokeWidth={10} strokeLinecap="round"
        />

        {/* ── Arc CA rempli (orange) ── */}
        <Path
          d={arcPath(CX, CY, R_OUTER, START_DEG, caAngle)}
          fill="none" stroke="url(#arcGrad)" strokeWidth={10} strokeLinecap="round"
        />

        {/* ── Arc anneau extérieur décoratif ── */}
        <Circle cx={CX} cy={CY} r={R_OUTER+14} fill="none" stroke="#ff8c0040" strokeWidth={1.5} />
        <Circle cx={CX} cy={CY} r={R_OUTER+18} fill="none" stroke="#ff8c0020" strokeWidth={1} />

        {/* ── TICKS + LABELS ── */}
        {ticks.map(({ p1, p2, isMaj, label, deg, i }) => (
          <G key={i}>
            <Line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isMaj ? '#ff8c00cc' : '#ff8c0050'}
              strokeWidth={isMaj ? 2 : 1}
            />
            {isMaj && label && (
              <SvgText
                x={polarToCart(CX, CY, R_TICK_IN_MAJ - 12, deg).x}
                y={polarToCart(CX, CY, R_TICK_IN_MAJ - 12, deg).y + 3}
                fontSize={9} fill="#ff8c00aa"
                textAnchor="middle" fontFamily={F}
              >{label}</SvgText>
            )}
          </G>
        ))}

        {/* ── Indicateur pointeur haut ── */}
        <Path
          d={`M ${CX} ${CY - R_OUTER - 5} L ${CX-4} ${CY - R_OUTER + 4} L ${CX+4} ${CY - R_OUTER + 4} Z`}
          fill="#ff8c00"
        />

        {/* ── LIQUIDE CA (arc à gauche, sous le cadran) ── */}
        {caMonthPct > 0 && (
          <Path
            d={arcPath(CX, CY, (R_LIQ_OUT+R_LIQ_IN)/2, START_DEG, caAngle)}
            fill="none" stroke="#00aaff" strokeWidth={R_LIQ_OUT - R_LIQ_IN}
            strokeLinecap="round" opacity={0.85}
          />
        )}
        {/* Fond du liquide */}
        <Path
          d={arcPath(CX, CY, (R_LIQ_OUT+R_LIQ_IN)/2, START_DEG, END_DEG)}
          fill="none" stroke="#001833" strokeWidth={R_LIQ_OUT - R_LIQ_IN}
          strokeLinecap="round" opacity={0.6}
        />
        {/* Labels CA gauche */}
        {caLabels.map((val, i) => {
          const deg = START_DEG + (val/100) * SPAN;
          const pos = polarToCart(CX, CY, R_LIQ_OUT + 14, deg);
          return (
            <SvgText key={val} x={pos.x} y={pos.y+3}
              fontSize={8} fill={val <= caMonthPct ? '#00aaff' : '#334455'}
              textAnchor="middle" fontFamily={F}>
              {val}
            </SvgText>
          );
        })}
        {/* Indicateur valeur CA courante */}
        {(() => {
          const pos = polarToCart(CX, CY, R_LIQ_OUT + 22, caAngle);
          return (
            <G>
              <SvgText x={pos.x} y={pos.y} fontSize={9} fill="#00aaff" fontWeight="bold" textAnchor="middle" fontFamily={F}>
                {`›${Math.round(caMonthPct)}`}
              </SvgText>
            </G>
          );
        })()}

        {/* ── TRAITS VENTES droite (arc-en-ciel) ── */}
        {ARC_COLORS.map((col, i) => {
          const segStart = START_DEG + (i     / ARC_COLORS.length) * SPAN;
          const segEnd   = START_DEG + ((i+1) / ARC_COLORS.length) * SPAN - 1;
          const rm = (R_SALES_OUT + R_SALES_IN) / 2;
          const sw = R_SALES_OUT - R_SALES_IN;
          return (
            <Path key={i}
              d={arcPath(CX, CY, rm, segStart, segEnd)}
              fill="none"
              stroke={i < cmdFilled ? col : `${col}22`}
              strokeWidth={sw}
            />
          );
        })}

        {/* ── Cercle intérieur (zone logo) ── */}
        <Circle cx={CX} cy={CY} r={R_INNER} fill="#050e1a" />
        <Circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#ff8c0040" strokeWidth={2} />

        {/* ── AIGUILLE ANIMÉE ── */}
        <AnimatedNeedle cx={CX} cy={CY} r={R_NEEDLE} rotAnim={rotAnim} />

        {/* Pivot central */}
        <Circle cx={CX} cy={CY} r={7} fill="#ffaa00" />
        <Circle cx={CX} cy={CY} r={3} fill="#ff6600" />
      </Svg>

      {/* Logo centre — Image React Native par-dessus le SVG */}
      <View style={{
        position:'absolute',
        left: CX - R_INNER * 0.7,
        top:  CY - R_INNER * 0.7,
        width:  R_INNER * 1.4,
        height: R_INNER * 1.4,
        borderRadius: R_INNER * 0.7,
        overflow:'hidden',
        alignItems:'center', justifyContent:'center',
      }}>
        {logoUri
          ? <Image source={{uri:logoUri}} style={{width:'100%',height:'100%'}} resizeMode="contain" />
          : <Text style={{fontFamily:F, fontSize:R_INNER*0.18, color:'#ff8c00', fontWeight:'bold', textAlign:'center'}}>NINJA'S</Text>
        }
      </View>
    </View>
  );
});

/* Composant SVG animé pour l'aiguille */
const AnimatedNeedle = memo(({ cx, cy, r, rotAnim }) => {
  const [angle, setAngle] = useState(-135);
  useEffect(() => {
    const id = rotAnim.addListener(({ value }) => setAngle(value));
    return () => rotAnim.removeListener(id);
  }, []);
  const tip  = polarToCart(cx, cy, r, angle);
  const base = polarToCart(cx, cy, r * 0.15, angle + 180);
  const lp   = polarToCart(cx, cy, r * 0.08, angle + 90);
  const rp   = polarToCart(cx, cy, r * 0.08, angle - 90);
  const d = `M ${lp.x} ${lp.y} L ${tip.x} ${tip.y} L ${rp.x} ${rp.y} L ${base.x} ${base.y} Z`;
  return (
    <Path d={d} fill="#ff6600" opacity={0.95} />
  );
});

/* ══════════════════════════════════════
   MINI JAUGES BAS — SVG arc
══════════════════════════════════════ */
const MiniGaugeSVG = memo(({ pct=50, size=70, color='#00aaff', label='' }) => {
  const S = size;
  const CX = S/2, CY = S/2;
  const R = S * 0.38;
  const ROuter = S * 0.46;
  const START = -135, SPAN = 270;
  const filled = START + (Math.min(pct,100)/100) * SPAN;

  const rotAnim = useRef(new Animated.Value(START)).current;
  useEffect(() => {
    Animated.timing(rotAnim, { toValue:filled, duration:1400, useNativeDriver:false, easing:Easing.out(Easing.cubic) }).start();
  }, [pct]);
  const [angle, setAngle] = useState(filled);
  useEffect(() => {
    const id = rotAnim.addListener(({value}) => setAngle(value));
    return () => rotAnim.removeListener(id);
  }, []);

  const tip  = polarToCart(CX, CY, R * 0.88, angle);
  const base = polarToCart(CX, CY, R * 0.12, angle + 180);
  const lp   = polarToCart(CX, CY, R * 0.07, angle + 90);
  const rp   = polarToCart(CX, CY, R * 0.07, angle - 90);
  const nd = `M ${lp.x} ${lp.y} L ${tip.x} ${tip.y} L ${rp.x} ${rp.y} L ${base.x} ${base.y} Z`;

  return (
    <View style={{ alignItems:'center' }}>
      <Svg width={S} height={S}>
        <Circle cx={CX} cy={CY} r={ROuter} fill="#030c18" />
        <Path d={arcPath(CX, CY, R, START, START+SPAN)} fill="none" stroke={`${color}25`} strokeWidth={5} />
        <Path d={arcPath(CX, CY, R, START, angle)}      fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
        {/* Ticks */}
        {Array.from({length:7},(_,i) => {
          const d = START + (i/6)*SPAN;
          const p1 = polarToCart(CX, CY, ROuter-1, d);
          const p2 = polarToCart(CX, CY, ROuter-5, d);
          return <Line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={`${color}60`} strokeWidth={1} />;
        })}
        {/* Aiguille */}
        <Path d={nd} fill={color} opacity={0.9} />
        <Circle cx={CX} cy={CY} r={4} fill={color} />
        {/* % central */}
        <SvgText x={CX} y={CY + S*0.14} fontSize={S*0.16} fill={color} fontWeight="bold" textAnchor="middle" fontFamily={F}>
          {Math.round(pct)}%
        </SvgText>
      </Svg>
      {!!label && <Text style={{ fontFamily:F, fontSize:7, color:'#556677', marginTop:1 }}>{label}</Text>}
    </View>
  );
});

/* ══════════════════════════════════════
   SYS.LOG
══════════════════════════════════════ */
const SysLog = memo(() => {
  const MSGS = ['DATA-CARD','ORDER-RECEPT','HEART-BREAK','SYNC-PULS','DATA-SYSTEM','CART-STATUS','FIREBASE-OK'];
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
      const m = MSGS[Math.floor(Math.random()*MSGS.length)];
      const cols = ['#00ccff','#00ff88','#ffcc00'];
      const c = cols[Math.floor(Math.random()*cols.length)];
      setLogs(p => [{t:now,m,c},...p].slice(0,7));
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  const date = new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase();
  return (
    <View style={{ flex:1, padding:4, transform:[{skewY:'-1.5deg'}] }}>
      {logs.map((l,i) => (
        <View key={i} style={{ marginBottom:4 }}>
          <Text style={{ fontFamily:F, fontSize:7.5, color:'rgba(255,140,0,0.4)' }}>{l.t}</Text>
          <Text style={{ fontFamily:F, fontSize:8.5, color:l.c, letterSpacing:0.2 }}>{l.m}</Text>
        </View>
      ))}
      <Text style={{ fontFamily:F, fontSize:7, color:'rgba(255,140,0,0.3)', marginTop:3 }}>{date}</Text>
      <View style={{ position:'absolute', right:2, top:0, bottom:0, justifyContent:'space-evenly', alignItems:'center' }}>
        {['#00aaff','#00cc44','#ffcc00','#00aa66','#00aaff'].map((c,i) => <Led key={i} color={c} size={9} delay={i*350} />)}
      </View>
    </View>
  );
});

/* ══════════════════════════════════════
   CART ITEM — composant séparé (fix crash hooks dans .map)
══════════════════════════════════════ */
const CartItem = memo(({ cart, imgUri, onPress, index }) => {
  // ✅ Hooks au niveau racine du composant, PAS dans .map()
  const rotAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(rotAnim,{toValue:1,duration:2800,useNativeDriver:true,easing:Easing.inOut(Easing.sin)}),
      Animated.timing(rotAnim,{toValue:0,duration:2800,useNativeDriver:true,easing:Easing.inOut(Easing.sin)}),
    ])).start();
  }, []);
  const sx  = rotAnim.interpolate({inputRange:[0,0.5,1],outputRange:[1,0.84,1]});
  const on  = cart.status === 'online';
  const col = ['#00aaff','#ff8c00','#aa88ff'][index % 3];
  const iW  = SW * 0.11;
  const iH  = SH * 0.09;

  return (
    <Pressable onPress={onPress} style={{ alignItems:'center', marginBottom:SH*0.01 }}>
      <View style={{ width:iW*1.1, height:iW*1.1, alignItems:'center', justifyContent:'center' }}>
        <View style={{ position:'absolute', width:iW*1.15, height:iW*1.15, borderRadius:iW*0.58, borderWidth:1.5, borderColor:on?col:'#333', opacity:0.55 }} />
        <Animated.View style={{ width:iW, height:iH, transform:[{scaleX:sx}], alignItems:'center', justifyContent:'center' }}>
          {imgUri
            ? <Image source={{uri:imgUri}} style={{width:iW,height:iH}} resizeMode="contain" />
            : (
              <View style={{ width:iW*0.88, height:iH*0.85, borderWidth:1.5, borderColor:col, borderRadius:4, backgroundColor:`${col}18`, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ fontFamily:F, fontSize:8, color:col }}>{cart.name}</Text>
              </View>
            )
          }
        </Animated.View>
      </View>
      <Text style={{ fontFamily:F, fontSize:7.5, color:'#ff8c0088', letterSpacing:0.8 }}>{cart.name}</Text>
      <View style={{ width:5, height:5, borderRadius:2.5, backgroundColor:on?'#00ff88':'#ff3300', marginTop:2 }} />
    </Pressable>
  );
});

/* ══════════════════════════════════════
   CARTS ZONE — utilise CartItem (hooks propres)
══════════════════════════════════════ */
const CartsZone = memo(({ carts, cartImages, onCartPress }) => {
  const display = carts.length > 0 ? carts : [
    {id:'c1',name:'CART 01',status:'online'},
    {id:'c2',name:'CART 02',status:'online'},
    {id:'c3',name:'CART 03',status:'offline'},
  ];
  return (
    <View style={{ flex:1, alignItems:'center', paddingVertical:4 }}>
      <Text style={{ color:'#ff8c00', fontSize:16, marginBottom:4 }}>▲</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{flex:1,width:'100%'}} contentContainerStyle={{alignItems:'center'}}>
        {display.map((cart, i) => (
          <CartItem
            key={cart.id}
            cart={cart}
            imgUri={cartImages ? cartImages[cart.id] : null}
            onPress={() => onCartPress && onCartPress(cart)}
            index={i}
          />
        ))}
      </ScrollView>
      <Text style={{ color:'#ff8c00', fontSize:16, marginTop:4 }}>▼</Text>
    </View>
  );
});

/* ══════════════════════════════════════
   BANDES INFÉRIEURES
══════════════════════════════════════ */
const BottomLeft = memo(({ carts }) => {
  const d = carts.length > 0 ? carts : [{id:'c1',name:'CART 01',caPct:81},{id:'c2',name:'CART 02',caPct:87},{id:'c3',name:'CART 03',caPct:85}];
  const avg = Math.round(d.reduce((s,c)=>s+(c.caPct||0),0)/Math.max(d.length,1));
  const gs  = Math.min(SH*0.17, SW*0.065);
  return (
    <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
      <MiniGaugeSVG pct={avg} size={gs} color="#00aaff" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{alignItems:'center',paddingLeft:6}}>
        {d.map(c => <MiniGaugeSVG key={c.id} pct={c.caPct||0} size={gs*0.85} color="#00aaff" label={c.name} />)}
      </ScrollView>
    </View>
  );
});

const BottomRight = memo(({ carts }) => {
  const d = carts.length > 0 ? carts : [{id:'c1',name:'CART 01',cmdPct:63},{id:'c2',name:'CART 02',cmdPct:70},{id:'c3',name:'CART 03',cmdPct:50}];
  const avg = Math.round(d.reduce((s,c)=>s+(c.cmdPct||0),0)/Math.max(d.length,1));
  const gs  = Math.min(SH*0.17, SW*0.065);
  return (
    <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
      <MiniGaugeSVG pct={avg} size={gs} color="#ff8c00" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{alignItems:'center',paddingLeft:6}}>
        {d.map(c => <MiniGaugeSVG key={c.id} pct={c.cmdPct||0} size={gs*0.85} color="#ff8c00" label={c.name} />)}
      </ScrollView>
    </View>
  );
});

/* ══ StarDot — étoile scintillante (composant séparé) ══ */
const StarDot = memo(({ x, y, idx }) => {
  const a = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(a,{toValue:0.9,duration:900+idx*180,useNativeDriver:true}),
      Animated.timing(a,{toValue:0.1,duration:900+idx*180,useNativeDriver:true}),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position:'absolute', left:x/1440*SW, top:y/900*SH,
      width:2, height:2, borderRadius:1, backgroundColor:'#fff', opacity:a,
    }} />
  );
});

/* ══════════════════════════════════════
   ÉCRAN PRINCIPAL
══════════════════════════════════════ */
const DashboardScreen = ({ navigation }) => {
  const { carts }   = useAllCarts();
  const raw         = useDashboardStats(carts);
  const stats = { totalToday: raw?.totalToday||0, totalOrders: raw?.totalOrders||0 };

  // Config depuis AsyncStorage (logos, fond, images carts)
  const [logoUri,    setLogoUri]    = useState(null);
  const [bgUri,      setBgUri]      = useState(null);
  const [cartImages, setCartImages] = useState({});
  const [skinUri,    setSkinUri]    = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('dashboard_config').then(v => {
      if (!v) return;
      const cfg = JSON.parse(v);
      if (cfg.logoUri)    setLogoUri(cfg.logoUri);
      if (cfg.bgUri)      setBgUri(cfg.bgUri);
      if (cfg.cartImages) setCartImages(cfg.cartImages);
      if (cfg.skinUri)    setSkinUri(cfg.skinUri);
    });
    // Rafraîchir si on revient des paramètres
    const unsub = navigation?.addListener?.('focus', () => {
      AsyncStorage.getItem('dashboard_config').then(v => {
        if (!v) return;
        const cfg = JSON.parse(v);
        if (cfg.logoUri)    setLogoUri(cfg.logoUri);
        if (cfg.bgUri)      setBgUri(cfg.bgUri);
        if (cfg.cartImages) setCartImages(cfg.cartImages);
        if (cfg.skinUri)    setSkinUri(cfg.skinUri);
      });
    });
    return () => unsub && unsub();
  }, []);

  const QUOTA_CA_DAY  = 50000;
  const QUOTA_CMD_DAY = 30;

  const cartData = carts.map((c,i) => ({
    id:      c.id,
    name:    (c.cartName||c.id).toUpperCase().slice(0,8),
    caPct:   Math.min(Math.round(((c.todayTotal ||0)/QUOTA_CA_DAY )*100),100),
    cmdPct:  Math.min(Math.round(((c.todayOrders||0)/QUOTA_CMD_DAY)*100),100),
    status:  c.updatedAt&&(Date.now()/1000-c.updatedAt.seconds)<300?'online':'offline',
  }));

  const caMonthPct  = Math.min(Math.round((stats.totalToday/(QUOTA_CA_DAY*30))*100),100)||60;
  const cmdMonthPct = Math.min(Math.round((stats.totalOrders/(QUOTA_CMD_DAY*30))*100),100)||55;

  const goSettings = useCallback(() => navigation?.navigate('Config'), [navigation]);
  const goRewards  = useCallback(() => Alert.alert('Tableau de récompenses','Écran en construction'), []);
  const goLumi     = useCallback(() => Alert.alert('Lumi IA','Écran en construction'), []);
  const goStocks   = useCallback(() => Alert.alert('Gestion des stocks','Écran en construction'), []);
  const goCart     = useCallback((cart) => Alert.alert('Profil cart', cart.name), []);

  // Étoiles fond
  const starPositions = [[50,80],[250,140],[550,90],[950,170],[1050,80],[400,700],[750,620],[100,500],[1200,350],[300,400],[800,300]];

  return (
    <View style={st.root}>
      {/* ── FOND (configurable depuis galerie, sinon noir) ── */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, {backgroundColor:'#020810'}]} />
        {bgUri && <Image source={{uri:bgUri}} style={StyleSheet.absoluteFill} resizeMode="cover" />}
        {/* Étoiles — composant séparé pour éviter hooks dans .map() */}
        {starPositions.map(([x,y],i) => (
          <StarDot key={i} x={x} y={y} idx={i} />
        ))}
      </View>

      {/* ── SKIN PNG (depuis galerie, configurable) ── */}
      {skinUri && (
        <Image source={{uri:skinUri}} style={{position:'absolute',top:0,left:0,width:SW,height:SH}} resizeMode="stretch" />
      )}

      {/* ══ ÉLÉMENTS LOGIQUES ══ */}

      {/* Logo gauche */}
      <Pressable style={[z2s(Z.logoL),{alignItems:'center',justifyContent:'center'}]} onPress={goSettings}>
        {logoUri
          ? <Image source={{uri:logoUri}} style={{width:'90%',height:'90%',borderRadius:999}} resizeMode="contain" />
          : <View style={st.logoPH}><Text style={st.logoPHT}>N</Text></View>
        }
      </Pressable>

      {/* 03 carts */}
      <View style={[z2s(Z.stat03),{alignItems:'center',justifyContent:'center'}]}>
        <Text style={st.statN}>{String(carts.length||3).padStart(2,'0')}</Text>
      </View>

      {/* 100% objectif */}
      <View style={[z2s(Z.stat100),{alignItems:'center',justifyContent:'center'}]}>
        <Text style={st.statN}>100%</Text>
      </View>

      {/* Logo droit */}
      <Pressable style={[z2s(Z.logoR),{alignItems:'center',justifyContent:'center'}]} onPress={goSettings}>
        {logoUri
          ? <Image source={{uri:logoUri}} style={{width:'90%',height:'90%',borderRadius:999}} resizeMode="contain" />
          : <View style={st.logoPH}><Text style={st.logoPHT}>N</Text></View>
        }
      </Pressable>

      {/* SYS.LOG */}
      <View style={z2s(Z.syslog)}>
        <SysLog />
      </View>

      {/* JAUGE PRINCIPALE SVG */}
      <View style={z2s(Z.gauge)}>
        <MainGaugeSVG caMonthPct={caMonthPct} cmdMonthPct={cmdMonthPct} logoUri={logoUri} />
      </View>

      {/* Bouton Récompenses */}
      <Pressable style={[z2s(Z.navRew),{alignItems:'center',justifyContent:'center'}]} onPress={goRewards}>
        <Text style={{fontSize:22}}>🏆</Text>
        <Text style={st.navLbl}>SOLD OUT</Text>
      </Pressable>

      {/* Bouton Lumi */}
      <Pressable style={[z2s(Z.navLumi),{alignItems:'center',justifyContent:'center'}]} onPress={goLumi}>
        <View style={st.lumiBtn}><Text style={{fontSize:20}}>🤖</Text></View>
      </Pressable>

      {/* Bouton Stocks */}
      <Pressable style={[z2s(Z.navStocks),{alignItems:'center',justifyContent:'center',flexDirection:'column'}]} onPress={goStocks}>
        {[72,22,16].map((v,i) => (
          <View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:2}}>
            <View style={{width:Math.max(v*0.28,4),height:4,backgroundColor:i===0?'#00ff88':i===1?'#00aaff':'#ffcc00',borderRadius:1,marginRight:3}} />
            <Text style={{fontFamily:F,fontSize:7,color:'#aaa'}}>{v}%</Text>
          </View>
        ))}
      </Pressable>

      {/* Carts */}
      <View style={z2s(Z.carts)}>
        <CartsZone carts={cartData} cartImages={cartImages} onCartPress={goCart} />
      </View>

      {/* Engrenage paramètres */}
      <Pressable style={[z2s(Z.settings),{alignItems:'center',justifyContent:'center'}]} onPress={goSettings}>
        <Text style={{color:'#ff8c0088',fontSize:22}}>⚙</Text>
      </Pressable>

      {/* Bande CA */}
      <View style={z2s(Z.bottomL)}>
        <BottomLeft carts={cartData} />
      </View>

      {/* Bande Commandes */}
      <View style={z2s(Z.bottomR)}>
        <BottomRight carts={cartData} />
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  root:    { flex:1, backgroundColor:'#020810' },
  logoPH:  { width:'75%', height:'75%', borderRadius:999, backgroundColor:'#0a1525', borderWidth:2, borderColor:'#c8a040', alignItems:'center', justifyContent:'center' },
  logoPHT: { fontFamily:F, fontSize:SW*0.022, color:'#c8a040', fontWeight:'bold' },
  statN:   { fontFamily:F, fontSize:SH*0.042, color:'#e8d8c0', fontWeight:'bold', letterSpacing:3 },
  navLbl:  { fontFamily:F, fontSize:7, color:'#ff8c0077', marginTop:2 },
  lumiBtn: { width:SH*0.065, height:SH*0.065, borderRadius:SH*0.033, backgroundColor:'#0a1a2a', borderWidth:1.5, borderColor:'#0066ff', alignItems:'center', justifyContent:'center' },
});

module.exports = DashboardScreen;
