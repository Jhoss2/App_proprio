/**
 * SysLog — Panneau gauche notifications défilantes + LEDs
 * Fidèle au cadran latéral gauche de Gemini
 */
const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const { View, StyleSheet, Animated, Dimensions } = require('react-native');
const SvgLib = require('react-native-svg');
const {
  Svg, Defs, G, Path, Rect, Circle, Text: SvgText,
  LinearGradient, RadialGradient, Stop, Filter,
  FeGaussianBlur, FeMerge, FeMergeNode, ClipPath,
} = SvgLib;

const { width: SW, height: SH } = Dimensions.get('window');
const W = SW * 0.185;
const H = SH * 0.58;
// Source : panneau gauche du cadran latéral ~280×350 pixels internes
const VW = 280, VH = 380;

const LOG_TYPES = [
  { label:'CRITIQUE',  color:'#ff0000', msgs:['VENTES OK','STOCK BAS','CONNEXION'] },
  { label:'SYSTÈME',   color:'#00f2ff', msgs:['FIREBASE SYNC','AUTH OK','DATA-SYSTEM'] },
  { label:'ALERTE',    color:'#ffff00', msgs:['STOCK CART 02','FLUX INSTABLE','SEUIL'] },
  { label:'MESSAGE',   color:'#44ff44', msgs:['CART STATUS OK','SYNC OK','RELAI'] },
];

/* ── LED individuelle (composant séparé — pas dans .map) ── */
const LedDot = memo(({ color, cy, delay }) => {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue:0.1, duration:500, useNativeDriver:true }),
      Animated.timing(a, { toValue:1,   duration:500, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position:'absolute', right:6, top:cy,
      width:10, height:10, borderRadius:5,
      backgroundColor:color, opacity:a,
      shadowColor:color, shadowRadius:6, shadowOpacity:1,
      shadowOffset:{width:0,height:0}, elevation:4,
    }}/>
  );
});

const SysLog = memo(() => {
  const [logs, setLogs] = useState([
    { t:'20:50', label:'CRITIQUE',  msg:'VENTES CART 01 OK',   c:'#ff4444' },
    { t:'20:51', label:'SYSTÈME',   msg:'FIREBASE SYNC — OK',  c:'#00f2ff' },
    { t:'20:51', label:'ALERTE',    msg:'STOCK CART 02 BAS',   c:'#ffff00' },
    { t:'20:53', label:'MESSAGE',   msg:'DATA-SYSTEM OK',      c:'#44ff44' },
    { t:'20:53', label:'SYSTÈME',   msg:'CART STATUS — OK',    c:'#00f2ff' },
    { t:'20:53', label:'ALERTE',    msg:'SYNC-PULS',           c:'#ffff00' },
  ]);

  useEffect(() => {
    const iv = setInterval(() => {
      const now  = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      const type = LOG_TYPES[Math.floor(Math.random() * LOG_TYPES.length)];
      const msg  = type.msgs[Math.floor(Math.random() * type.msgs.length)];
      setLogs(p => [{ t:now, label:type.label, msg, c:type.color }, ...p].slice(0,6));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const date = new Date().toLocaleDateString('fr-FR',{
    weekday:'short', day:'2-digit', month:'short'
  }).toUpperCase();

  const LED_DEFS = [
    { color:'#ff4444', top:0.18 },
    { color:'#44ff44', top:0.32 },
    { color:'#ffff00', top:0.46 },
    { color:'#44ff44', top:0.60 },
    { color:'#ffff00', top:0.74 },
  ];

  return (
    <View style={[styles.root, { width:W, height:H }]}>
      <Svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <Filter id="neonGlowL" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur stdDeviation="4" result="b1"/>
            <FeGaussianBlur stdDeviation="10" result="b2" in="SourceGraphic"/>
            <FeMerge><FeMergeNode in="b2"/><FeMergeNode in="b1"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
          <ClipPath id="logClip">
            <Rect x="18" y="42" width="220" height="310"/>
          </ClipPath>
        </Defs>

        {/* Cadre principal */}
        <Path d="M 14 48 L 240 48 L 265 68 L 265 103 L 275 113 L 275 138 L 265 148 L 265 173 L 275 183 L 275 313 L 265 323 L 265 348 L 250 360 L 14 360 L 4 348 L 4 68 Z"
          fill="#1a080088" stroke="#ff7a1a" strokeWidth="2" filter="url(#neonGlowL)"/>
        {/* Fenêtre interne */}
        <Rect x="18" y="55" width="220" height="300" fill="#000000cc" stroke="#ff7a1a" strokeWidth="1.5" rx="2"/>

        {/* Titre */}
        <SvgText x="26" y="78" fontSize="13" fill="#ff7a1a" fontWeight="bold" fontFamily="monospace">
          // SYS.LOG
        </SvgText>

        {/* Logs */}
        <G clipPath="url(#logClip)">
          {logs.map((l,i) => (
            <G key={i} transform={`translate(0,${95 + i * 42})`}>
              <SvgText x="26" y="0" fontSize="9" fill="#ff8c0066" fontFamily="monospace">{l.t}</SvgText>
              <SvgText x="26" y="14" fontSize="11" fill={l.c} fontWeight="bold" fontFamily="monospace">{l.label}</SvgText>
              <SvgText x="26" y="27" fontSize="10" fill="#cccccc" fontFamily="monospace">{l.msg}</SvgText>
            </G>
          ))}
          {/* Date */}
          <SvgText x="26" y="360" fontSize="9" fill="#ff8c0040" fontFamily="monospace">{date}</SvgText>
        </G>

        {/* Flèche indicateur gauche */}
        <SvgText x="-2" y="195" fontSize="18" fill="#ff7a1a" fontWeight="bold">›</SvgText>
      </Svg>

      {/* LEDs — composants React Native animés superposés */}
      {LED_DEFS.map((led, i) => (
        <LedDot key={i} color={led.color} cy={H * led.top - 5} delay={i * 380}/>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { position:'absolute' },
});

module.exports = SysLog;
                    
