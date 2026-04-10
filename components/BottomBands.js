/**
 * BottomBands — bandes inférieures scrollables
 * Gauche : Chiffre d'affaires/Jour (bleu cyan)
 * Droite : Commandes/Jour (orange)
 * Chaque bande : jauge aiguille moyenne + scroll horizontal des carts
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, ScrollView, Pressable, StyleSheet, Animated, Easing, Dimensions } = require('react-native');

const { width: W } = Dimensions.get('window');
const F = 'monospace';

/* ── Jauge circulaire à aiguille (mini) ── */
const MiniNeedle = memo(({ pct = 75, size = 80, color = '#00aaff' }) => {
  const rot = useRef(new Animated.Value(-120)).current;
  const target = -120 + (pct / 100) * 240;

  useEffect(() => {
    Animated.timing(rot, {
      toValue: target, duration: 1200,
      useNativeDriver: true, easing: Easing.out(Easing.cubic),
    }).start();
  }, [pct]);

  const rotate = rot.interpolate({
    inputRange: [-120, 120], outputRange: ['-120deg', '120deg'],
  });
  const r = size / 2;
  const needleLen = r * 0.72;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Fond circulaire */}
      <View style={{
        width: size, height: size, borderRadius: r,
        backgroundColor: '#050e1a', borderWidth: 2, borderColor: `${color}40`,
        alignItems: 'center', justifyContent: 'center', position: 'absolute',
      }} />
      {/* Ticks */}
      {Array.from({ length: 9 }, (_, i) => {
        const ang = -120 + (i / 8) * 240;
        const rad = (ang * Math.PI) / 180;
        const r2 = r - 5;
        return (
          <View key={i} style={{
            position: 'absolute',
            left: r + r2 * Math.cos(rad) - 1,
            top:  r + r2 * Math.sin(rad) - 1,
            width: 2, height: i % 4 === 0 ? 6 : 3,
            backgroundColor: `${color}88`,
            transform: [{ rotate: `${ang + 90}deg` }],
          }} />
        );
      })}
      {/* Aiguille */}
      <Animated.View style={{
        position: 'absolute',
        width: needleLen, height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate }, { translateX: needleLen / 2 }],
        left: r - needleLen,
        top: r - 1,
      }} />
      {/* Pivot */}
      <View style={{
        position: 'absolute', width: 7, height: 7, borderRadius: 3.5,
        backgroundColor: color, left: r - 3.5, top: r - 3.5,
      }} />
    </View>
  );
});

/* ── Jauge circulaire cart (bague remplie en segments) ── */
const CartGauge = memo(({ pct = 75, label = 'CART 01', color = '#00aaff', size = 62 }) => {
  const r = size / 2;
  const dots = 16;
  const filled = Math.round((pct / 100) * dots);

  return (
    <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Fond */}
        <View style={{
          width: size, height: size, borderRadius: r,
          backgroundColor: '#050e1a', borderWidth: 1.5,
          borderColor: `${color}30`, position: 'absolute',
        }} />
        {/* Points de progression */}
        {Array.from({ length: dots }, (_, i) => {
          const ang = (i / dots) * 2 * Math.PI - Math.PI / 2;
          const rr  = r - 5;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: r + rr * Math.cos(ang) - 3,
              top:  r + rr * Math.sin(ang) - 3,
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: i < filled ? color : `${color}20`,
            }} />
          );
        })}
        {/* Pourcentage central */}
        <Text style={{ fontFamily: F, fontSize: size * 0.2, color, fontWeight: 'bold' }}>
          {pct}%
        </Text>
      </View>
      <Text style={{ fontFamily: F, fontSize: 8, color: '#667788', marginTop: 4, letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
});

/* ── Bande individuelle ── */
const Band = memo(({ title, carts = [], color = '#00aaff', avgPct = 0 }) => {
  // Graduation de la mini-jauge
  const ticks = ['0', '20', '40', '60', '80', '100'];

  return (
    <View style={[s.band, { borderTopColor: `${color}40` }]}>
      {/* En-tête */}
      <View style={s.bandHeader}>
        <Text style={[s.bandTitle, { color }]}>{title}</Text>
      </View>

      <View style={s.bandBody}>
        {/* Jauge aiguille (moyenne) */}
        <View style={s.avgBlock}>
          {/* Ticks texte */}
          <View style={s.ticksHoriz}>
            {ticks.map(t => (
              <Text key={t} style={s.horizTick}>{t}</Text>
            ))}
          </View>
          <MiniNeedle pct={avgPct} size={72} color={color} />
        </View>

        {/* Scroll horizontal des carts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          style={{ flex: 1 }}
        >
          {carts.map((cart, i) => (
            <CartGauge
              key={cart.id}
              pct={cart.pct}
              label={cart.name}
              color={color}
              size={62}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

const BottomBands = memo(({ carts = [] }) => {
  // Données par défaut si aucun cart
  const defaultCarts = carts.length > 0 ? carts : [
    { id: 'cart_01', name: 'CART 01', caPct: 81, cmdPct: 63 },
    { id: 'cart_02', name: 'CART 02', caPct: 87, cmdPct: 70 },
    { id: 'cart_03', name: 'CART 03', caPct: 85, cmdPct: 50 },
  ];

  const caAvg  = Math.round(defaultCarts.reduce((s, c) => s + c.caPct,  0) / defaultCarts.length);
  const cmdAvg = Math.round(defaultCarts.reduce((s, c) => s + c.cmdPct, 0) / defaultCarts.length);

  return (
    <View style={s.root}>
      {/* Icône paramètres (coin gauche) */}
      <View style={s.settingsBtn}>
        <Text style={s.settingsIcon}>⚙</Text>
      </View>

      {/* Bande CA/Jour */}
      <Band
        title="CHIFFRE D'AFFAIRES/JOUR"
        carts={defaultCarts.map(c => ({ ...c, pct: c.caPct }))}
        color="#00aaff"
        avgPct={caAvg}
      />

      {/* Séparateur */}
      <View style={s.sep} />

      {/* Bande Commandes/Jour */}
      <Band
        title="Commandes/Jour"
        carts={defaultCarts.map(c => ({ ...c, pct: c.cmdPct }))}
        color="#ff7700"
        avgPct={cmdAvg}
      />
    </View>
  );
});

const s = StyleSheet.create({
  root:         { flexDirection: 'row', height: 170, backgroundColor: '#030c18', borderTopWidth: 1, borderTopColor: '#1a3a5a' },
  settingsBtn:  { width: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#1a3a5a' },
  settingsIcon: { color: '#446688', fontSize: 18 },
  band:         { flex: 1, borderTopWidth: 1, padding: 6 },
  bandHeader:   { marginBottom: 4 },
  bandTitle:    { fontFamily: F, fontSize: 9, letterSpacing: 1 },
  bandBody:     { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avgBlock:     { alignItems: 'center', marginRight: 8 },
  ticksHoriz:   { flexDirection: 'row', justifyContent: 'space-between', width: 72, marginBottom: 2 },
  horizTick:    { fontFamily: F, fontSize: 6, color: '#446688' },
  scrollContent:{ alignItems: 'center', paddingRight: 10 },
  sep:          { width: 1, backgroundColor: '#1a3a5a', marginVertical: 8 },
});

module.exports = BottomBands;
