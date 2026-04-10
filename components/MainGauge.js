/**
 * MainGauge — jauge principale centrale
 * Arc semi-circulaire, aiguille orange animée, graduation CA gauche,
 * graduation couleurs arc-en-ciel droite, logo centre
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Image, StyleSheet, Animated, Easing, Dimensions } = require('react-native');

const { width: W } = Dimensions.get('window');
const F = 'monospace';
const SIZE = Math.min(W * 0.35, 260);
const R = SIZE / 2;

/* ── Graduation numérique gauche (CA) ── */
const LeftScale = memo(({ value = 75 }) => {
  const ticks = [100, 80, 60, 40, 20, 0];
  return (
    <View style={s.leftScale}>
      {ticks.map(t => (
        <View key={t} style={s.tickRow}>
          <Text style={[s.tickText, t <= value && { color: '#00aaff' }]}>{t}</Text>
          <View style={[s.tickLine, t <= value && { backgroundColor: '#00aaff' }]} />
        </View>
      ))}
    </View>
  );
});

/* ── Graduation couleurs arc-en-ciel droite (commandes) ── */
const RightScale = memo(({ value = 60 }) => {
  const COLORS = ['#ff2200','#ff5500','#ff8800','#ffcc00','#aaff00','#00ff88','#00ffcc','#00aaff','#0066ff','#6600ff','#cc00ff','#ff00aa'];
  const filled = Math.round((value / 100) * COLORS.length);
  return (
    <View style={s.rightScale}>
      {COLORS.map((c, i) => (
        <View key={i} style={[s.colorBlock, {
          backgroundColor: i < filled ? c : `${c}22`,
          height: 12, marginBottom: 2,
        }]} />
      ))}
    </View>
  );
});

/* ── Aiguille animée ── */
const Needle = memo(({ value = 75, size = SIZE }) => {
  const rot = useRef(new Animated.Value(0)).current;
  const target = -135 + (value / 100) * 270;

  useEffect(() => {
    Animated.timing(rot, {
      toValue: target, duration: 1500,
      useNativeDriver: true, easing: Easing.out(Easing.cubic),
    }).start();
  }, [value]);

  const rotate = rot.interpolate({ inputRange: [-135, 135], outputRange: ['-135deg', '135deg'] });
  const needleLen = size * 0.38;

  return (
    <View style={[s.needleWrap, { width: size, height: size }]}>
      <Animated.View style={[s.needleBase, {
        width: needleLen, height: 3,
        transform: [{ rotate }, { translateX: needleLen / 2 }],
      }]}>
        {/* Aiguille orange */}
        <View style={s.needleBody} />
        {/* Pointe lumineuse */}
        <View style={s.needleTip} />
      </Animated.View>
      {/* Centre pivot */}
      <View style={s.pivot} />
    </View>
  );
});

/* ── Arcs décoratifs ── */
const ArcRing = memo(({ size, color, thickness = 3, opacity = 0.6 }) => (
  <View style={{
    position: 'absolute',
    width: size, height: size, borderRadius: size / 2,
    borderWidth: thickness, borderColor: color, opacity,
  }} />
));

/* ── MainGauge ── */
const MainGauge = memo(({ caMonthPct = 75, cmdMonthPct = 60, logoUri = null }) => {
  // Tick animation du "LA" indicateur en haut
  const tickA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tickA, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(tickA, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.root}>
      {/* Indicateur "LA" en haut */}
      <View style={s.topIndicator}>
        <Animated.View style={[s.topTick, { opacity: tickA }]} />
        <Text style={s.laText}>LA</Text>
      </View>

      {/* Zone centrale avec jauge */}
      <View style={s.gaugeRow}>
        <LeftScale value={caMonthPct} />

        {/* Jauge circulaire */}
        <View style={[s.gaugeWrap, { width: SIZE, height: SIZE }]}>
          {/* Anneaux décoratifs */}
          <ArcRing size={SIZE}      color="#1a3a5a" thickness={8}  opacity={1} />
          <ArcRing size={SIZE - 20} color="#0a2a4a" thickness={4}  opacity={0.8} />
          <ArcRing size={SIZE - 40} color="#00aaff" thickness={1.5} opacity={0.4} />

          {/* Arc de progression CA (bleu) */}
          <View style={[s.progressArc, { width: SIZE - 10, height: SIZE - 10, borderRadius: (SIZE - 10) / 2 }]}>
            <View style={[s.arcFill, { borderColor: '#0066ff', width: `${caMonthPct}%` }]} />
          </View>

          {/* Logo centre */}
          <View style={s.logoWrap}>
            {logoUri
              ? <Image source={{ uri: logoUri }} style={s.logoImg} resizeMode="contain" />
              : (
                <View style={s.logoDefault}>
                  <Text style={s.logoDefaultText}>NINJA'S</Text>
                </View>
              )
            }
          </View>

          {/* Aiguille */}
          <Needle value={caMonthPct} size={SIZE} />

          {/* Tick marks de la jauge */}
          {Array.from({ length: 21 }, (_, i) => {
            const ang = -135 + (i / 20) * 270;
            const rad = (ang * Math.PI) / 180;
            const isMajor = i % 4 === 0;
            const r2 = R - 6;
            return (
              <View key={i} style={{
                position: 'absolute',
                left: R + r2 * Math.cos(rad) - (isMajor ? 1 : 0.5),
                top:  R + r2 * Math.sin(rad) - (isMajor ? 4 : 2),
                width: isMajor ? 2 : 1,
                height: isMajor ? 8 : 4,
                backgroundColor: isMajor ? '#aaccee' : '#446688',
                transform: [{ rotate: `${ang + 90}deg` }],
              }} />
            );
          })}
        </View>

        <RightScale value={cmdMonthPct} />
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  topIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  topTick: { width: 4, height: 12, backgroundColor: '#00ccff', marginRight: 6, borderRadius: 2 },
  laText: { fontFamily: F, fontSize: 11, color: '#88aabb', letterSpacing: 2 },
  gaugeRow: { flexDirection: 'row', alignItems: 'center' },

  leftScale: { width: 42, alignItems: 'flex-end', marginRight: 6 },
  tickRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tickText:  { fontFamily: F, fontSize: 9, color: '#446688', width: 28, textAlign: 'right', marginRight: 4 },
  tickLine:  { width: 8, height: 1.5, backgroundColor: '#224466' },

  rightScale: { width: 22, marginLeft: 6 },
  colorBlock: { width: 18, borderRadius: 1 },

  gaugeWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  progressArc: { position: 'absolute', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  arcFill: { height: '100%', borderWidth: 3, borderRadius: 100 },

  logoWrap:    { position: 'absolute', width: SIZE * 0.5, height: SIZE * 0.5, borderRadius: SIZE * 0.25, backgroundColor: '#0a1525', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1a3a5a' },
  logoImg:     { width: SIZE * 0.42, height: SIZE * 0.42, borderRadius: SIZE * 0.21 },
  logoDefault: { alignItems: 'center', justifyContent: 'center' },
  logoDefaultText: { fontFamily: F, fontSize: 13, color: '#c8a040', fontWeight: 'bold' },

  needleWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  needleBase: { position: 'absolute' },
  needleBody: { flex: 1, height: 3, backgroundColor: '#ff6600', borderRadius: 1.5 },
  needleTip:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffaa00', position: 'absolute', right: -4, top: -2.5 },
  pivot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: '#aaccee', position: 'absolute' },
});

module.exports = MainGauge;
