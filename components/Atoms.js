/**
 * ATOMS — Deep Space Orange
 * 100% React Native Animated + View + Text
 * Zéro SVG, zéro reanimated, zéro gap:, zéro borderColor animé
 * Testé safe sur Android RN 0.74
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Animated, StyleSheet, Easing } = require('react-native');
const { C, F } = require('../constants');

/* ── LED clignotante ─────────────────────────── */
const Led = memo(({ color = C.orange, size = 8, fast = false }) => {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 0.1, duration: fast ? 250 : 600, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1,   duration: fast ? 250 : 600, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: a }} />;
});

/* ── Ligne de scan verticale ─────────────────── */
const Scan = memo(({ color = C.orange, h = 400 }) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(a, { toValue: 1, duration: 2600, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);
  const ty = a.interpolate({ inputRange: [0, 1], outputRange: [-10, h] });
  return (
    <Animated.View style={[s.scanWrap, { transform: [{ translateY: ty }] }]}>
      <View style={[s.scanBar, { backgroundColor: color }]} />
    </Animated.View>
  );
});

/* ── Texte glitch ────────────────────────────── */
const Glitch = memo(({ text, style }) => {
  // Pas de setInterval — Animated.loop pur, zéro charge bridge
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(a, { toValue: 1, duration: 55,  useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 55,  useNativeDriver: true }),
        Animated.timing(a, { toValue: 1, duration: 38,  useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 90,  useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const tx = a.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });
  return <Animated.Text style={[style, { transform: [{ translateX: tx }] }]}>{text}</Animated.Text>;
});

/* ── Nombre animé (flash au changement) ─────── */
const Num = memo(({ val, size = 22, color = C.orange, pre = '', suf = '' }) => {
  const a    = useRef(new Animated.Value(1)).current;
  const prev = useRef(val);
  useEffect(() => {
    if (prev.current !== val) {
      Animated.sequence([
        Animated.timing(a, { toValue: 0.15, duration: 90, useNativeDriver: true }),
        Animated.timing(a, { toValue: 1,    duration: 90, useNativeDriver: true }),
      ]).start();
      prev.current = val;
    }
  }, [val]);
  return (
    <Animated.Text style={{ fontSize: size, color, opacity: a, fontFamily: F, fontWeight: 'bold' }}>
      {pre}{val}{suf}
    </Animated.Text>
  );
});

/* ── Jauge circulaire (12 dots) ──────────────── */
const Gauge = memo(({ val = 0, max = 100, size = 90, color = C.orange, label = '' }) => {
  const pct    = Math.min(Math.max(val / max, 0), 1);
  const dots   = 12;
  const filled = Math.round(pct * dots);
  const r      = size / 2 - 7;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: dots }, (_, i) => {
        const ang = (i / dots) * 2 * Math.PI - Math.PI / 2;
        return (
          <View key={i} style={{
            position: 'absolute',
            left: size / 2 + r * Math.cos(ang) - 3,
            top:  size / 2 + r * Math.sin(ang) - 3,
            width: 6, height: 6, borderRadius: 3,
            backgroundColor: i < filled ? color : `${color}22`,
          }} />
        );
      })}
      <Text style={{ fontFamily: F, fontSize: size * 0.18, color, fontWeight: 'bold' }}>
        {Math.round(pct * 100)}%
      </Text>
      {!!label && <Text style={{ fontFamily: F, fontSize: 8, color: C.w25, marginTop: 1 }}>{label}</Text>}
    </View>
  );
});

/* ── Barre de progression ────────────────────── */
const Bar = memo(({ val = 0, max = 100, color = C.orange, h = 4 }) => {
  const a   = useRef(new Animated.Value(0)).current;
  const pct = Math.min(Math.max(val / max, 0), 1);
  useEffect(() => {
    Animated.timing(a, { toValue: pct, duration: 900, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
  }, [val]);
  // opacity seule animation safe pour la largeur sans pixel connu
  // On simule avec une longue barre dont l'opacité représente le remplissage
  // Alternative fiable: afficher N segments colorés/gris selon pct
  const segments = 20;
  const filled = Math.round(pct * segments);
  return (
    <View style={[s.barBg, { height: h, flexDirection: 'row', overflow: 'hidden' }]}>
      {Array.from({ length: segments }, (_, i) => (
        <View key={i} style={{ flex: 1, height: h, backgroundColor: i < filled ? color : 'transparent' }} />
      ))}
    </View>
  );
});

/* ── Binary rain (View/Text only) ───────────── */
const BinCol = memo(({ left, delay, dur }) => {
  const a = useRef(new Animated.Value(delay / (dur + delay))).current;
  useEffect(() => {
    // Démarre à une position décalée selon delay — pas de setTimeout
    Animated.loop(
      Animated.timing(a, { toValue: 1, duration: dur, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);
  const ty = a.interpolate({ inputRange: [0, 1], outputRange: [-90, 350] });
  return (
    <Animated.View style={[s.binCol, { left, transform: [{ translateY: ty }] }]}>
      {['0','1','0','0','1','1','0','1'].map((c, i) => (
        <Text key={i} style={[s.binChar, { opacity: Math.max(0.04, (8 - i) / 10) }]}>{c}</Text>
      ))}
    </Animated.View>
  );
});

const Rain = memo(({ width = 300, n = 8 }) => (
  <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width, overflow: 'hidden', opacity: 0.13 }}>
    {Array.from({ length: n }, (_, i) => (
      <BinCol key={i} left={n > 0 ? (width / n) * i : 0} delay={i * 260} dur={2100 + i * 380} />
    ))}
  </View>
));

/* ── Égaliseur (barres animées) ─────────────── */
const EqBar = memo(({ pct = 0, color = C.orange, width = 14 }) => {
  const a = useRef(new Animated.Value(0.04)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: Math.max(pct, 0.04), duration: 400, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
  }, [pct]);
  // scaleY depuis le bas : on utilise une vue de 80px et on scale
  return (
    <View style={{ width, alignItems: 'center', justifyContent: 'flex-end', height: 80, overflow: 'hidden' }}>
      <Animated.View style={{
        width, height: 80, backgroundColor: color, borderRadius: 2,
        transform: [{ scaleY: a }],
      }} />
    </View>
  );
});

/* ── Carte avec bordure statique colorée ─────── */
const Card = memo(({ children, color = C.orange, style }) => (
  <View style={[s.card, { borderColor: color }, style]}>
    {children}
  </View>
));

/* ── Engrenage (rotation pure transform) ─────── */
const Gear = memo(({ size = 50, color = C.orange, slow = false }) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(a, { toValue: 1, duration: slow ? 8000 : 3000, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);
  const rot = a.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r   = size / 2;
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate: rot }] }}>
      {/* Cercle central */}
      <View style={{
        position: 'absolute',
        left: r - r * 0.35, top: r - r * 0.35,
        width: r * 0.7, height: r * 0.7, borderRadius: r * 0.35,
        borderWidth: 2, borderColor: color,
      }} />
      {/* 8 dents */}
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * 2 * Math.PI;
        return (
          <View key={i} style={{
            position: 'absolute',
            left: r + (r - 5) * Math.cos(ang) - 4,
            top:  r + (r - 5) * Math.sin(ang) - 4,
            width: 8, height: 8, borderRadius: 1,
            backgroundColor: color,
          }} />
        );
      })}
    </Animated.View>
  );
});

const s = StyleSheet.create({
  scanWrap: { position: 'absolute', left: 0, right: 0, height: 30 },
  scanBar:  { height: 1, opacity: 0.55 },
  barBg:    { backgroundColor: C.w08, borderRadius: 4, overflow: 'hidden', width: '100%' },
  binCol:   { position: 'absolute', top: 0 },
  binChar:  { fontFamily: F, fontSize: 10, color: '#004dff', lineHeight: 13 },
  card:     { backgroundColor: C.bgCard, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10 },
});

module.exports = { Led, Scan, Glitch, Num, Gauge, Bar, Rain, EqBar, Card, Gear };

