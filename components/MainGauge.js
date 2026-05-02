import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { View, Image, Pressable, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import Svg, {
  Defs, G, Path, Circle, Line, Text as SvgText,
  LinearGradient, Stop, Filter, FeGaussianBlur, FeMerge, FeMergeNode, ClipPath,
} from 'react-native-svg';

const A_START = 215, A_END = 145, A_SPAN = (360 - A_START) + A_END;
const deg2rad = d => (d - 90) * Math.PI / 180;
const arcPoint = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos(deg2rad(deg)),
  y: cy + r * Math.sin(deg2rad(deg)),
});
const arcPathD = (cx, cy, r, startDeg, endDeg, span) => {
  const s = arcPoint(cx, cy, r, startDeg);
  const e = arcPoint(cx, cy, r, endDeg);
  const large = span > 180 ? 1 : 0;
  return 'M ' + s.x.toFixed(2) + ' ' + s.y.toFixed(2) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + e.x.toFixed(2) + ' ' + e.y.toFixed(2);
};

const GaugeNeedle = memo(({ cx, cy, r, angleDeg }) => {
  const tip  = arcPoint(cx, cy, r * 0.88, angleDeg);
  const base = arcPoint(cx, cy, r * 0.12, angleDeg + 180);
  const lp   = arcPoint(cx, cy, r * 0.06, angleDeg + 90);
  const rp   = arcPoint(cx, cy, r * 0.06, angleDeg - 90);
  return (
    <Path
      d={'M ' + lp.x.toFixed(1) + ' ' + lp.y.toFixed(1) +
         ' L ' + tip.x.toFixed(1) + ' ' + tip.y.toFixed(1) +
         ' L ' + rp.x.toFixed(1) + ' ' + rp.y.toFixed(1) +
         ' L ' + base.x.toFixed(1) + ' ' + base.y.toFixed(1) + ' Z'}
      fill="#ff6600" opacity={0.95}/>
  );
});

const NavBtn = memo(({ cx, label, onPress, children }) => (
  <G transform={'translate(' + cx + ',0)'} onPress={onPress}>
    {children}
    <SvgText y="70" textAnchor="middle" fontSize="11" fill="#cccccc" fontFamily="monospace">{label}</SvgText>
  </G>
));

const MainGauge = memo(({ caMonthPct=60, cmdMonthPct=55, logoUri=null, onLogoPress, onRewards, onLumi, onStocks }) => {
  const { width: SW, height: SH } = useWindowDimensions();
  const W  = SW * 0.62;
  const H  = SH * 0.87;
  const CX = W * 0.5;
  const CY = H * 0.43;
  const R_MAIN   = Math.min(W, H) * 0.31;
  const R_LIQ    = R_MAIN * 1.14;
  const R_SEG    = R_MAIN * 1.28;
  const TICK_OUT = R_MAIN * 1.08;

  const rotAnim = useRef(new Animated.Value(A_START)).current;
  const [needleAngle, setNeedleAngle] = useState(A_START);
  useEffect(() => {
    const target = A_START + (Math.min(caMonthPct,100)/100) * A_SPAN;
    Animated.timing(rotAnim, { toValue:target, duration:1800, useNativeDriver:false, easing:Easing.out(Easing.cubic) }).start();
    const id = rotAnim.addListener(({ value }) => setNeedleAngle(value));
    return () => rotAnim.removeListener(id);
  }, [caMonthPct]);

  const pulseA = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseA, { toValue:1,   duration:1200, useNativeDriver:true }),
      Animated.timing(pulseA, { toValue:0.2, duration:1200, useNativeDriver:true }),
    ])).start();
  }, []);

  const caAngle  = A_START + (Math.min(caMonthPct, 100) / 100) * A_SPAN;
  const caSpan   = caAngle - A_START;
  const liqPath  = caSpan > 0 ? arcPathD(CX, CY, R_LIQ, A_START, caAngle, caSpan) : '';
  const liqBg    = arcPathD(CX, CY, R_LIQ, A_START, A_END, A_SPAN);

  const SEG_COUNT = 30;
  const cmdFilled = Math.round((Math.min(cmdMonthPct,100)/100) * SEG_COUNT);
  const segments  = useMemo(() => Array.from({ length:SEG_COUNT }, (_, i) => {
    const hue      = (i / SEG_COUNT) * 280;
    const segStart = A_START + (i     / SEG_COUNT) * A_SPAN;
    const segEnd   = A_START + ((i+1) / SEG_COUNT) * A_SPAN - 0.5;
    const span     = segEnd - segStart;
    return { path:arcPathD(CX, CY, R_SEG, segStart, segEnd, span), hue };
  }), [CX, CY, R_SEG]);

  const ticks = useMemo(() => Array.from({ length:101 }, (_, i) => {
    const ang    = A_START + (i/100) * A_SPAN;
    const isMain = i % 10 === 0;
    const isMid  = i % 5 === 0 && !isMain;
    const rIn    = isMain ? R_MAIN*0.89 : isMid ? R_MAIN*0.94 : R_MAIN*0.96;
    const p1 = arcPoint(CX, CY, TICK_OUT, ang);
    const p2 = arcPoint(CX, CY, rIn,      ang);
    const lp = isMain ? arcPoint(CX, CY, R_MAIN*0.81, ang) : null;
    return { p1, p2, isMain, isMid, label:isMain ? String(Math.round((i/100)*100)) : null, lp, ang };
  }), [CX, CY, R_MAIN, TICK_OUT]);

  if (!SW || !SH || R_MAIN <= 0) return null;

  return (
    <View style={{ position:'absolute', width:W, height:H }}>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="cyanGradMG" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%"  stopColor="#003366"/>
            <Stop offset="50%" stopColor="#00d4ff"/>
            <Stop offset="100%" stopColor="#ffffff"/>
          </LinearGradient>
          <LinearGradient id="orangeArcMG" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#ff4400"/>
            <Stop offset="100%" stopColor="#ffaa00"/>
          </LinearGradient>
          <Filter id="gaugeSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="3" result="blur"/>
            <FeMerge><FeMergeNode in="blur"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
          <Filter id="gaugeGlowMG" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur stdDeviation="6" result="blur"/>
            <FeMerge><FeMergeNode in="blur"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
        </Defs>

        <Path d={arcPathD(CX,CY,R_MAIN,A_START,A_END,A_SPAN)} fill="none" stroke="#1a0a00" strokeWidth={R_MAIN*0.13}/>
        <Path d={arcPathD(CX,CY,R_MAIN,A_START,A_END,A_SPAN)} fill="none" stroke="#ff8800" strokeWidth={R_MAIN*0.05} filter="url(#gaugeGlowMG)"/>
        {caSpan > 0 && <Path d={arcPathD(CX,CY,R_MAIN,A_START,caAngle,caSpan)} fill="none" stroke="url(#orangeArcMG)" strokeWidth={R_MAIN*0.08} strokeLinecap="round" filter="url(#gaugeSoftGlow)"/>}

        <Path d={liqBg}  fill="none" stroke="#001830" strokeWidth={10} strokeLinecap="round"/>
        {caSpan > 0 && <Path d={liqPath} fill="none" stroke="url(#cyanGradMG)" strokeWidth={10} strokeLinecap="round" filter="url(#gaugeSoftGlow)"/>}

        {ticks.map((tk,i) => (
          <G key={i}>
            <Line x1={tk.p1.x.toFixed(1)} y1={tk.p1.y.toFixed(1)} x2={tk.p2.x.toFixed(1)} y2={tk.p2.y.toFixed(1)}
              stroke={tk.isMain ? '#ffffff' : tk.isMid ? '#ffaa00' : '#ffffff55'}
              strokeWidth={tk.isMain ? 6 : tk.isMid ? 3 : 1.5}/>
            {tk.isMain && tk.label && tk.lp && (
              <SvgText x={tk.lp.x.toFixed(1)} y={(tk.lp.y+4).toFixed(1)} textAnchor="middle"
                fontSize={tk.ang > 180 ? 13 : 11}
                fill={Number(tk.label) === 40 ? '#00f2ff' : '#ffffff'}
                fontFamily="monospace" fontWeight="bold">
                {tk.label === '0' ? '00' : tk.label}
              </SvgText>
            )}
          </G>
        ))}

        <Path d={'M ' + CX + ' ' + (CY-R_MAIN*1.12) + ' L ' + (CX-5) + ' ' + (CY-R_MAIN*1.02) + ' L ' + (CX+5) + ' ' + (CY-R_MAIN*1.02) + ' Z'} fill="#ff8c00"/>

        {segments.map((seg,i) => (
          <Path key={i} d={seg.path} fill="none"
            stroke={i < cmdFilled ? 'hsl(' + seg.hue + ',100%,55%)' : 'hsla(' + seg.hue + ',100%,55%,0.2)'}
            strokeWidth={8}/>
        ))}

        <Circle cx={CX} cy={CY} r={R_MAIN*0.62} fill="#050e1a" stroke="#00d4ff" strokeWidth={2} strokeDasharray="14 28" opacity={0.5}/>
        <Circle cx={CX} cy={CY} r={R_MAIN*0.58} fill="#001520" stroke="#00d4ff" strokeWidth={8} filter="url(#gaugeGlowMG)"/>

        <GaugeNeedle cx={CX} cy={CY} r={R_MAIN*0.9} angleDeg={needleAngle}/>
        <Circle cx={CX} cy={CY} r={8} fill="#ffaa00"/>
        <Circle cx={CX} cy={CY} r={4} fill="#ff6600"/>

        <G transform={'translate(' + CX + ',' + (CY + R_MAIN*1.18) + ')'}>
          <NavBtn cx={-R_MAIN*1.35} label="TABLEAU DE RÉCOMPENSES" onPress={onRewards}>
            <Path d="M 0 25 L 15 0 L 160 0 L 210 30 L 210 65 L 195 80 L 15 80 L 0 65 Z" fill="#000810" stroke="#00ccff" strokeWidth="3" transform="translate(-105,-40)"/>
            <SvgText y="-15" textAnchor="middle" fontSize="18">{'🏆'}</SvgText>
            <SvgText y="2"  textAnchor="middle" fontSize="9" fill="#ff2200">{'SOLD OUT × 02'}</SvgText>
            <SvgText y="16" textAnchor="middle" fontSize="9" fill="#00f2ff">{'BEST CART'}</SvgText>
          </NavBtn>
          <NavBtn cx={0} label="LUMI" onPress={onLumi}>
            <Circle r={R_MAIN*0.17} fill="#100500" stroke="#ff6600" strokeWidth="4" filter="url(#gaugeGlowMG)"/>
            <SvgText y="8" textAnchor="middle" fontSize="24">{'🤖'}</SvgText>
          </NavBtn>
          <NavBtn cx={R_MAIN*1.35} label="GESTION DES STOCKS" onPress={onStocks}>
            <Path d="M 0 35 L 55 0 L 195 0 L 210 25 L 210 65 L 195 80 L 15 80 L 0 65 Z" fill="#000810" stroke="#00ccff" strokeWidth="3" transform="translate(-105,-40)"/>
            {[{y:-25,w:100,v:72,c:'#ff2200'},{y:-10,w:100,v:100,c:'#00f2ff'},{y:5,w:80,v:125,c:'#aaff00'}].map((b,i) => (
              <G key={i}>
                <Path d={'M ' + (-50) + ' ' + b.y + ' h 100 v 10 h -100 Z'} fill="#001a2a"/>
                <Path d={'M ' + (-50) + ' ' + b.y + ' h ' + b.w + ' v 10 h -' + b.w + ' Z'} fill={b.c}/>
                <SvgText x="55" y={b.y+9} fontSize="9" fill={b.c} textAnchor="end">{b.v}</SvgText>
              </G>
            ))}
          </NavBtn>
        </G>
      </Svg>
      <Pressable onPress={onLogoPress} style={[styles.logoWrap, { width:R_MAIN*1.12, height:R_MAIN*1.12, borderRadius:R_MAIN*0.56, left:CX-R_MAIN*0.56, top:CY-R_MAIN*0.56 }]}>
        {logoUri && <Image source={{ uri:logoUri }} style={styles.logoImg} resizeMode="contain"/>}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  logoWrap:{ position:'absolute', overflow:'hidden', alignItems:'center', justifyContent:'center' },
  logoImg: { width:'100%', height:'100%' },
});

export default MainGauge;
