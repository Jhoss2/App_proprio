import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import Svg, {
  Defs, G, Path, Circle, Line, Rect, Text as SvgText,
  LinearGradient, Stop, Filter, FeGaussianBlur, FeMerge, FeMergeNode,
} from 'react-native-svg';

const MJ_START = 90, MJ_SPAN = 180;
const deg2rad = d => (d - 90) * Math.PI / 180;
const arcPt   = (cx, cy, r, deg) => ({ x: cx + r * Math.cos(deg2rad(deg)), y: cy + r * Math.sin(deg2rad(deg)) });
const arcD    = (cx, cy, r, sD, eD, span) => {
  const s = arcPt(cx,cy,r,sD), e = arcPt(cx,cy,r,eD);
  return 'M ' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) + ' A ' + r + ' ' + r + ' 0 ' + (span>180?1:0) + ' 1 ' + e.x.toFixed(1) + ' ' + e.y.toFixed(1);
};

const MiniGauge = memo(({ pct=60, size, color='#00aaff', cx, cy }) => {
  const rotAnim = useRef(new Animated.Value(MJ_START)).current;
  const [angle, setAngle] = useState(MJ_START - (pct/100)*MJ_SPAN);
  useEffect(() => {
    const target = MJ_START - (Math.min(pct,100)/100)*MJ_SPAN;
    Animated.timing(rotAnim, { toValue:target, duration:1400, useNativeDriver:false, easing:Easing.out(Easing.cubic) }).start();
    const id = rotAnim.addListener(({ value }) => setAngle(value));
    return () => rotAnim.removeListener(id);
  }, [pct]);

  if (!cx || !cy || !size || size <= 0) return null;

  const r = size*0.38, rOuter = size*0.46;
  const tip  = arcPt(cx,cy,r*0.88,angle);
  const base = arcPt(cx,cy,r*0.10,angle+180);
  const lp   = arcPt(cx,cy,r*0.06,angle+90);
  const rp   = arcPt(cx,cy,r*0.06,angle-90);
  const ticks = Array.from({length:11},(_,i) => {
    const deg = MJ_START-(i/10)*MJ_SPAN;
    const isMaj = i%5===0;
    return { p1:arcPt(cx,cy,rOuter-1,deg), p2:arcPt(cx,cy,rOuter-(isMaj?10:5),deg), isMaj, val:i*10 };
  });
  const span = MJ_START - angle;
  return (
    <G>
      <Path d={arcD(cx,cy,r*0.9,MJ_START,MJ_START-MJ_SPAN,MJ_SPAN)} fill="none" stroke={color + '25'} strokeWidth={8}/>
      {span > 0 && <Path d={arcD(cx,cy,r*0.9,MJ_START,angle,span)} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"/>}
      {ticks.map((tk,i) => (
        <G key={i}>
          <Line x1={tk.p1.x.toFixed(1)} y1={tk.p1.y.toFixed(1)} x2={tk.p2.x.toFixed(1)} y2={tk.p2.y.toFixed(1)} stroke={color + '88'} strokeWidth={tk.isMaj?3:1.5}/>
          {tk.isMaj && <SvgText x={arcPt(cx,cy,rOuter-18,MJ_START-(i/10)*MJ_SPAN).x.toFixed(1)} y={(arcPt(cx,cy,rOuter-18,MJ_START-(i/10)*MJ_SPAN).y+4).toFixed(1)} textAnchor="middle" fontSize="9" fill={color + 'bb'} fontFamily="monospace">{tk.val}</SvgText>}
        </G>
      ))}
      <Path d={'M '+lp.x.toFixed(1)+' '+lp.y.toFixed(1)+' L '+tip.x.toFixed(1)+' '+tip.y.toFixed(1)+' L '+rp.x.toFixed(1)+' '+rp.y.toFixed(1)+' L '+base.x.toFixed(1)+' '+base.y.toFixed(1)+' Z'} fill={color} opacity={0.9}/>
      <Circle cx={cx} cy={cy} r={rOuter} fill="#030c18" stroke={color + '30'} strokeWidth={2}/>
      <Circle cx={cx} cy={cy} r={6} fill={color}/>
      <SvgText x={cx} y={cy + size*0.18} textAnchor="middle" fontSize={size*0.16} fill={color} fontFamily="monospace" fontWeight="bold">{Math.round(pct) + '%'}</SvgText>
    </G>
  );
});

const CartGauge = memo(({ pct=75, size=52, color='#00aaff', label='' }) => {
  if (!size || size <= 0) return null;
  const r = size*0.38, rO = size*0.46;
  const end = 90-(Math.min(pct,100)/100)*180;
  const span = 90-end;
  return (
    <View style={{ alignItems:'center', marginHorizontal:6 }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={rO} fill="#030c18" stroke={color + '25'} strokeWidth={1.5}/>
        <Path d={arcD(size/2,size/2,r*0.9,90,90-180,180)} fill="none" stroke={color + '22'} strokeWidth={7}/>
        {span > 0 && <Path d={arcD(size/2,size/2,r*0.9,90,end,span)} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"/>}
        <SvgText x={size/2} y={size/2+5} textAnchor="middle" fontSize={size*0.2} fill={color} fontFamily="monospace" fontWeight="bold">{pct + '%'}</SvgText>
      </Svg>
      {!!label && <SvgText style={{ fontSize:7.5, color:'#556677', marginTop:2, fontFamily:'monospace', textAlign:'center' }}>{label}</SvgText>}
    </View>
  );
});

const Band = memo(({ carts, color, avgPct, isRight=false, bW, bH }) => {
  const display = carts.length > 0 ? carts : [{id:'c1',name:'CART 01',pct:81},{id:'c2',name:'CART 02',pct:87},{id:'c3',name:'CART 03',pct:85}];
  const gSize = Math.min(bH*0.55, bW*0.13);
  const mjCX = bW*0.17, mjCY = bH*0.57;
  const filterId = isRight ? 'bGlowR' : 'bGlowL';
  const bgId     = isRight ? 'bgGradR' : 'bgGradL';
  const bevId    = isRight ? 'bevGradR' : 'bevGradL';
  const borderColor = isRight ? '#00d4ff' : '#ff8800';

  if (!bW || !bH || bW <= 0 || bH <= 0) return null;

  return (
    <View style={{ width:bW, height:bH, position:'relative' }}>
      <Svg width={bW} height={bH} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor="#0e1b26"/>
            <Stop offset="100%" stopColor="#060d13"/>
          </LinearGradient>
          <LinearGradient id={bevId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%"   stopColor={borderColor}/>
            <Stop offset="50%"  stopColor={isRight ? '#0099ff' : '#ff5500'}/>
            <Stop offset="100%" stopColor={isRight ? '#0066cc' : '#cc3300'}/>
          </LinearGradient>
          <Filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="4" result="blur"/>
            <FeMerge><FeMergeNode in="blur"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
        </Defs>
        <Path
          d={isRight
            ? 'M 120 0 L ' + (bW-10) + ' 0 L ' + (bW-10) + ' ' + (bH-20) + ' L 50 ' + (bH-20) + ' L 10 ' + (bH*0.7) + ' L 120 0 Z'
            : 'M 10 0 L ' + (bW-20) + ' 0 L ' + (bW-20) + ' ' + (bH-20) + ' L 20 ' + (bH-20) + ' L 10 ' + (bH*0.7) + ' Z'}
          fill={'url(#' + bgId + ')'} opacity={0.95}/>
        <Path
          d={isRight
            ? 'M 120 0 L ' + (bW-10) + ' 0 L ' + (bW-10) + ' ' + (bH-20) + ' L 50 ' + (bH-20) + ' L 10 ' + (bH*0.7) + ' L 120 0 Z'
            : 'M 10 0 L ' + (bW-20) + ' 0 L ' + (bW-20) + ' ' + (bH-20) + ' L 20 ' + (bH-20) + ' L 10 ' + (bH*0.7) + ' Z'}
          fill="none" stroke={borderColor} strokeWidth={12} filter={'url(#' + filterId + ')'}/>
        <Path
          d={isRight
            ? 'M ' + (bW*0.28) + ' 0 L ' + (bW*0.28+140) + ' 0 L ' + (bW*0.28+155) + ' 22 L ' + (bW*0.28+5) + ' 22 Z'
            : 'M ' + (bW*0.22) + ' 0 L ' + (bW*0.22+160) + ' 0 L ' + (bW*0.22+175) + ' 22 L ' + (bW*0.22+5) + ' 22 Z'}
          fill={'url(#' + bevId + ')'}/>
        {[0,1,2].map(i => (
          <Rect key={i} x={bW*0.44+i*14} y={2} width={10} height={18} fill={borderColor} rx={2} opacity={0.8}/>
        ))}
        <MiniGauge pct={avgPct} size={gSize*1.8} color={color} cx={mjCX} cy={mjCY}/>
      </Svg>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ position:'absolute', left:bW*0.3, top:bH*0.15, width:bW*0.65, height:bH*0.75 }}
        contentContainerStyle={{ alignItems:'center', paddingHorizontal:6 }}>
        {display.map(c => <CartGauge key={c.id} pct={c.pct||0} label={c.name} color={color} size={gSize}/>)}
      </ScrollView>
    </View>
  );
});

const BottomBands = memo(({ carts=[], onSettings }) => {
  const { width: SW, height: SH } = useWindowDimensions();
  const W = SW;
  const H = SH * 0.30;
  const bW = W * 0.465;

  const display = carts.length > 0 ? carts : [
    {id:'c1',name:'CART 01',caPct:81,cmdPct:63},
    {id:'c2',name:'CART 02',caPct:87,cmdPct:70},
    {id:'c3',name:'CART 03',caPct:85,cmdPct:50},
  ];
  const caAvg  = Math.round(display.reduce((s,c)=>s+(c.caPct||0),0)/Math.max(display.length,1));
  const cmdAvg = Math.round(display.reduce((s,c)=>s+(c.cmdPct||0),0)/Math.max(display.length,1));
  const caData  = display.map(c => ({ id:c.id, name:c.name, pct:c.caPct  }));
  const cmdData = display.map(c => ({ id:c.id, name:c.name, pct:c.cmdPct }));

  if (!SW || !SH) return null;

  return (
    <View style={{ position:'absolute', flexDirection:'row', width:W, height:H }}>
      <Pressable style={styles.gearBtn} onPress={onSettings}>
        <Svg width={44} height={44} viewBox="0 0 24 24">
          <Defs>
            <Filter id="gearGlowBB" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="2" result="blur"/>
              <FeMerge><FeMergeNode in="blur"/><FeMergeNode in="SourceGraphic"/></FeMerge>
            </Filter>
          </Defs>
          <Path d="M10.5 2L11.5 0h1l1 2a9 9 0 011.2.5L17 1.3l1.4 1.4-1.1 1.7a9 9 0 01.5 1.2L20 6.5v1l-2.2.7a9 9 0 01-.5 1.2l1.1 1.7L17 12.5l-1.8-1.2a9 9 0 01-1.2.5L13 14h-1l-.7-2.2a9 9 0 01-1.2-.5L8.5 12.5 7 11.1l1.1-1.7a9 9 0 01-.5-1.2L5.5 7.5v-1l2.2-.7a9 9 0 01.5-1.2L7 2.9 8.5 1.4l1.8 1.1a9 9 0 011.2-.5z"
            fill="none" stroke="#ffffff" strokeWidth="1.3" filter="url(#gearGlowBB)" transform="translate(1,1)"/>
          <Circle cx="12" cy="7.5" r="3" fill="none" stroke="#ffffff" strokeWidth="1.3" filter="url(#gearGlowBB)"/>
        </Svg>
      </Pressable>
      <Band carts={caData}  color="#00aaff" avgPct={caAvg}  isRight={false} bW={bW} bH={H}/>
      <Band carts={cmdData} color="#ff8c00" avgPct={cmdAvg} isRight={true}  bW={bW} bH={H}/>
    </View>
  );
});

const styles = StyleSheet.create({
  gearBtn: { width:50, alignItems:'center', justifyContent:'center' },
});

export default BottomBands;
