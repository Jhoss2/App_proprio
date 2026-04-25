/**
 * MainGauge — Grande jauge centrale
 * Arc liquide cyan CA, ticks courbes 100 subdivisions, segments arc-en-ciel ventes,
 * logo central cliquable, 3 boutons bas (Récompenses, Lumi, Stocks)
 * Reproduction fidèle Grande_jauge_centrale de Gemini
 */
const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const { View, Image, Pressable, StyleSheet, Animated, Easing, Dimensions } = require('react-native');
const SvgLib = require('react-native-svg');
const {
  Svg, Defs, G, Path, Circle, Text: SvgText,
  Line, LinearGradient, RadialGradient, Stop,
  Filter, FeGaussianBlur, FeMerge, FeMergeNode,
  ClipPath, Use,
} = SvgLib;

const { width: SW, height: SH } = Dimensions.get('window');
const W = SW * 0.62;
const H = SH * 0.87;

// Paramètres jauge
const CX = W * 0.5;
const CY = H * 0.43;
const R_MAIN = Math.min(W, H) * 0.31;
const R_LIQ  = R_MAIN * 1.14;
const R_SEG  = R_MAIN * 1.28;
const TICK_OUT = R_MAIN * 1.08;
// Arc : de 215° (bas-gauche) à 145° (bas-droite) = 290° de span
const A_START = 215, A_END = 145;
const A_SPAN  = (360 - A_START) + A_END; // 290°

const deg2rad = d => (d - 90) * Math.PI / 180;
const arcPoint = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos(deg2rad(deg)),
  y: cy + r * Math.sin(deg2rad(deg)),
});

const arcPathD = (cx, cy, r, startDeg, endDeg, span) => {
  const s = arcPoint(cx, cy, r, startDeg);
  const e = arcPoint(cx, cy, r, endDeg);
  const large = span > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
};

/* ── Aiguille animée via listener (pas useNativeDriver:false sur SVG path) ── */
const GaugeNeedle = memo(({ cx, cy, r, angleDeg }) => {
  const tip  = arcPoint(cx, cy, r * 0.88, angleDeg);
  const base = arcPoint(cx, cy, r * 0.12, angleDeg + 180);
  const lp   = arcPoint(cx, cy, r * 0.06, angleDeg + 90);
  const rp   = arcPoint(cx, cy, r * 0.06, angleDeg - 90);
  return (
    <Path
      d={`M ${lp.x.toFixed(1)} ${lp.y.toFixed(1)} L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L ${rp.x.toFixed(1)} ${rp.y.toFixed(1)} L ${base.x.toFixed(1)} ${base.y.toFixed(1)} Z`}
      fill="#ff6600" opacity={0.95}/>
  );
});

/* ── Bouton de navigation bas ── */
const NavBtn = memo(({ cx, label, children, onPress }) => (
  <G transform={`translate(${cx},0)`} onPress={onPress}>
    {children}
    <SvgText y="70" textAnchor="middle" fontSize="11" fill="#cccccc" fontFamily="monospace">{label}</SvgText>
  </G>
));

const MainGauge = memo(({
  caMonthPct  = 60,
  cmdMonthPct = 55,
  logoUri     = null,
  onLogoPress,
  onRewards,
  onLumi,
  onStocks,
}) => {
  // Aiguille animée
  const rotAnim = useRef(new Animated.Value(A_START)).current;
  const [needleAngle, setNeedleAngle] = useState(A_START);

  useEffect(() => {
    const target = A_START + (Math.min(caMonthPct,100)/100) * A_SPAN;
    Animated.timing(rotAnim, {
      toValue:target, duration:1800,
      useNativeDriver:false, easing:Easing.out(Easing.cubic),
    }).start();
    const id = rotAnim.addListener(({ value }) => setNeedleAngle(value));
    return () => rotAnim.removeListener(id);
  }, [caMonthPct]);

  // Pulsation anneau
  const pulseA = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseA, { toValue:1,   duration:1200, useNativeDriver:true }),
      Animated.timing(pulseA, { toValue:0.2, duration:1200, useNativeDriver:true }),
    ])).start();
  }, []);

  // Pulsation Lumi
  const lumiA = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(lumiA, { toValue:1.12, duration:900, useNativeDriver:true }),
      Animated.timing(lumiA, { toValue:1,    duration:900, useNativeDriver:true }),
    ])).start();
  }, []);

  // Arc CA rempli
  const caAngle  = A_START + (Math.min(caMonthPct, 100) / 100) * A_SPAN;
  const caSpan   = (caAngle >= A_START) ? caAngle - A_START : 360 - A_START + caAngle;
  const liqPath  = arcPathD(CX, CY, R_LIQ, A_START, caAngle, caSpan);
  const liqBg    = arcPathD(CX, CY, R_LIQ, A_START, A_END,   A_SPAN);

  // Segments arc-en-ciel ventes (droite)
  const SEG_COUNT = 30;
  const cmdFilled = Math.round((Math.min(cmdMonthPct,100)/100) * SEG_COUNT);
  const segments  = Array.from({ length: SEG_COUNT }, (_, i) => {
    const hue = (i / SEG_COUNT) * 280;
    const segStart = A_START + (i     / SEG_COUNT) * A_SPAN;
    const segEnd   = A_START + ((i+1) / SEG_COUNT) * A_SPAN - 0.5;
    const span     = segEnd - segStart;
    return { path: arcPathD(CX, CY, R_SEG, segStart, segEnd, span), hue, filled: i < cmdFilled };
  });

  // Ticks courbes (100 subdivisions)
  const ticks = Array.from({ length: 101 }, (_, i) => {
    const ang    = A_START + (i / 100) * A_SPAN;
    const isMain = i % 10 === 0;
    const isMid  = i % 5 === 0 && !isMain;
    const rOut   = TICK_OUT;
    const rIn    = isMain ? R_MAIN * 0.89 : isMid ? R_MAIN * 0.94 : R_MAIN * 0.96;
    const p1 = arcPoint(CX, CY, rOut, ang);
    const p2 = arcPoint(CX, CY, rIn,  ang);
    const label = isMain ? String(Math.round((i / 100) * 100)) : null;
    const labelPos = isMain ? arcPoint(CX, CY, R_MAIN * 0.81, ang) : null;
    return { p1, p2, isMain, isMid, label, labelPos, ang };
  });

  return (
    <View style={[styles.root, { width:W, height:H }]}>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="cyanGrad" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%"   stopColor="#003366"/>
            <Stop offset="50%"  stopColor="#00d4ff"/>
            <Stop offset="100%" stopColor="#ffffff"/>
          </LinearGradient>
          <LinearGradient id="orangeArcGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#ff4400"/>
            <Stop offset="100%" stopColor="#ffaa00"/>
          </LinearGradient>
          <Filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur stdDeviation="6" result="blur"/>
            <FeMerge><FeMergeNode in="blur"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
          <Filter id="gaugeSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="3" result="blur"/>
            <FeMerge><FeMergeNode in="blur"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
          <ClipPath id="logoClip">
            <Circle cx={CX} cy={CY} r={R_MAIN * 0.58}/>
          </ClipPath>
        </Defs>

        {/* ── ANNEAU ORANGE PRINCIPAL ── */}
        <Path
          d={arcPathD(CX, CY, R_MAIN, A_START, A_END, A_SPAN)}
          fill="none" stroke="#1a0a00" strokeWidth={R_MAIN * 0.13}/>
        <Path
          d={arcPathD(CX, CY, R_MAIN, A_START, A_END, A_SPAN)}
          fill="none" stroke="#ff8800" strokeWidth={R_MAIN * 0.05}
          filter="url(#gaugeGlow)"/>
        {/* Anneau rempli CA */}
        <Path
          d={arcPathD(CX, CY, R_MAIN, A_START, caAngle, caSpan)}
          fill="none" stroke="url(#orangeArcGrad)" strokeWidth={R_MAIN * 0.08}
          strokeLinecap="round" filter="url(#gaugeSoftGlow)"/>

        {/* ── LIQUIDE CA (arc concentrique extérieur) ── */}
        <Path d={liqBg}  fill="none" stroke="#001830" strokeWidth={10} strokeLinecap="round"/>
        <Path d={liqPath} fill="none" stroke="url(#cyanGrad)" strokeWidth={10}
          strokeLinecap="round" filter="url(#gaugeSoftGlow)"/>

        {/* ── TICKS COURBES ── */}
        {ticks.map((tk, i) => (
          <G key={i}>
            <Line
              x1={tk.p1.x.toFixed(1)} y1={tk.p1.y.toFixed(1)}
              x2={tk.p2.x.toFixed(1)} y2={tk.p2.y.toFixed(1)}
              stroke={tk.isMain ? '#ffffff' : tk.isMid ? '#ffaa00' : '#ffffff55'}
              strokeWidth={tk.isMain ? 6 : tk.isMid ? 3 : 1.5}/>
            {tk.isMain && tk.label && (
              <SvgText
                x={tk.labelPos.x.toFixed(1)} y={(tk.labelPos.y + 4).toFixed(1)}
                textAnchor="middle" fontSize={tk.ang > 180 ? 13 : 11}
                fill={Number(tk.label) === 40 ? '#00f2ff' : '#ffffff'}
                fontFamily="monospace" fontWeight="bold">
                {tk.label === '0' ? '00' : tk.label}
              </SvgText>
            )}
          </G>
        ))}

        {/* Indicateur "40" spécial cyan */}
        {(() => {
          const p = arcPoint(CX, CY, R_MAIN * 0.70, A_START + (40/100)*A_SPAN);
          return (
            <SvgText x={p.x.toFixed(1)} y={(p.y+4).toFixed(1)}
              textAnchor="middle" fontSize="12" fill="#00f2ff"
              fontFamily="monospace" fontWeight="bold">› 40</SvgText>
          );
        })()}

        {/* ── SEGMENTS ARC-EN-CIEL VENTES ── */}
        {segments.map((seg, i) => (
          <Path key={i}
            d={seg.path}
            fill="none"
            stroke={seg.filled ? `hsl(${seg.hue},100%,55%)` : `hsla(${seg.hue},100%,55%,0.2)`}
            strokeWidth={8}
            filter={seg.filled ? "url(#gaugeSoftGlow)" : undefined}/>
        ))}

        {/* Indicateur pointeur haut */}
        <Path
          d={`M ${CX} ${CY - R_MAIN * 1.12} L ${CX-5} ${CY - R_MAIN * 1.02} L ${CX+5} ${CY - R_MAIN * 1.02} Z`}
          fill="#ff8c00"/>

        {/* ── FOND CERCLE INTÉRIEUR ── */}
        <Circle cx={CX} cy={CY} r={R_MAIN * 0.62}
          fill="#050e1a" stroke="#00d4ff" strokeWidth={2} strokeDasharray="14 28" opacity={0.5}/>
        <Circle cx={CX} cy={CY} r={R_MAIN * 0.58} fill="#001520" stroke="#00d4ff" strokeWidth={8}
          filter="url(#gaugeGlow)"/>

        {/* ── AIGUILLE ── */}
        <GaugeNeedle cx={CX} cy={CY} r={R_MAIN * 0.9} angleDeg={needleAngle}/>
        <Circle cx={CX} cy={CY} r={8} fill="#ffaa00"/>
        <Circle cx={CX} cy={CY} r={4} fill="#ff6600"/>

        {/* ── BOUTONS BAS ── */}
        <G transform={`translate(${CX},${CY + R_MAIN * 1.18})`}>
          {/* Récompenses */}
          <NavBtn cx={-R_MAIN * 1.35} label="TABLEAU DE RÉCOMPENSES" onPress={onRewards}>
            <Path d="M 0 25 L 15 0 L 160 0 L 210 30 L 210 65 L 195 80 L 15 80 L 0 65 Z"
              fill="#000810" stroke="#00ccff" strokeWidth="3" transform="translate(-105,-40)"/>
            <SvgText y="-15" textAnchor="middle" fontSize="18">🏆</SvgText>
            <SvgText y="2"   textAnchor="middle" fontSize="9" fill="#ff2200">SOLD OUT × 02</SvgText>
            <SvgText y="16"  textAnchor="middle" fontSize="9" fill="#00f2ff">BEST CART</SvgText>
          </NavBtn>
          {/* Lumi */}
          <NavBtn cx={0} label="LUMI" onPress={onLumi}>
            <Circle r={R_MAIN * 0.17} fill="#100500" stroke="#ff6600" strokeWidth="4"
              filter="url(#gaugeGlow)"/>
            <SvgText y="8" textAnchor="middle" fontSize="24">🤖</SvgText>
          </NavBtn>
          {/* Stocks */}
          <NavBtn cx={R_MAIN * 1.35} label="GESTION DES STOCKS" onPress={onStocks}>
            <Path d="M 0 35 L 55 0 L 195 0 L 210 25 L 210 65 L 195 80 L 15 80 L 0 65 Z"
              fill="#000810" stroke="#00ccff" strokeWidth="3" transform="translate(-105,-40)"/>
            {[{y:-25,w:100,v:72,c:'#ff2200'},{y:-10,w:100,v:100,c:'#00f2ff'},{y:5,w:80,v:125,c:'#aaff00'}].map((b,i) => (
              <G key={i}>
                <Rect x={-50} y={b.y} width={100} height={10} fill="#001a2a" rx="2"/>
                <Rect x={-50} y={b.y} width={b.w} height={10} fill={b.c} rx="2"/>
                <SvgText x={55} y={b.y+9} fontSize="9" fill={b.c} textAnchor="end">{b.v}</SvgText>
              </G>
            ))}
          </NavBtn>
        </G>
      </Svg>

      {/* Logo React Native Image (par-dessus SVG, dans le cercle) */}
      <Pressable
        onPress={onLogoPress}
        style={[styles.logoWrap, {
          width:  R_MAIN * 1.12,
          height: R_MAIN * 1.12,
          borderRadius: R_MAIN * 0.56,
          left:   CX - R_MAIN * 0.56,
          top:    CY - R_MAIN * 0.56,
        }]}>
        {logoUri
          ? <Image source={{ uri:logoUri }} style={styles.logoImg} resizeMode="contain"/>
          : null
        }
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  root:    { position:'absolute' },
  logoWrap:{ position:'absolute', overflow:'hidden', alignItems:'center', justifyContent:'center' },
  logoImg: { width:'100%', height:'100%' },
});

module.exports = MainGauge;
                      
