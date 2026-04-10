/**
 * TopBar — barre supérieure
 * Logos coins | 03 carts | NINJA'S CORP néon | 100% objectif annuel
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Image, StyleSheet, Animated, Easing, Dimensions } = require('react-native');

const { width: W } = Dimensions.get('window');
const F = 'monospace';

/* ── Cadre hexagonal métal ── */
const HexFrame = memo(({ children, width = 120, height = 50, color = '#304060' }) => (
  <View style={[s.hexFrame, { width, height, borderColor: color }]}>
    {/* Biseaux coins */}
    <View style={[s.hexCornerTL, { borderTopColor: color, borderLeftColor: color }]} />
    <View style={[s.hexCornerTR, { borderTopColor: color, borderRightColor: color }]} />
    <View style={[s.hexCornerBL, { borderBottomColor: color, borderLeftColor: color }]} />
    <View style={[s.hexCornerBR, { borderBottomColor: color, borderRightColor: color }]} />
    {children}
  </View>
));

/* ── Grille hexagonale fond ── */
const HexGrid = memo(({ width = 200, height = 60 }) => {
  const cols = Math.ceil(width / 18);
  const rows = Math.ceil(height / 18);
  return (
    <View style={{ position: 'absolute', width, height, overflow: 'hidden', opacity: 0.3 }}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <View key={i} style={{
            position: 'absolute',
            left: col * 18 + (row % 2) * 9,
            top: row * 16,
            width: 14, height: 14,
            borderWidth: 0.5, borderColor: '#304060',
            borderRadius: 2,
          }} />
        );
      })}
    </View>
  );
});

/* ── NINJA'S CORP en néon animé ── */
const NeonTitle = memo(() => {
  const glow = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={[s.neonText, { opacity: glow }]}>
      NINJA'S CORP
    </Animated.Text>
  );
});

/* ── Logo cercle coin ── */
const LogoCircle = memo(({ logoUri }) => (
  <View style={s.logoOuter}>
    <View style={s.logoInner}>
      {logoUri
        ? <Image source={{ uri: logoUri }} style={s.logoImg} resizeMode="contain" />
        : <Text style={[s.logoPlaceholder]}>N</Text>
      }
    </View>
    {/* Bague dorée */}
    <View style={s.logoRing} />
  </View>
));

/* ── TopBar principal ── */
const TopBar = memo(({ cartCount = 0, annualPct = 100, logoUri = null }) => (
  <View style={s.root}>
    {/* Logo gauche */}
    <LogoCircle logoUri={logoUri} />

    {/* Bloc "03" — nombre de carts */}
    <HexFrame width={110} height={52} color="#3a5a7a">
      <HexGrid width={110} height={52} />
      <Text style={s.statNumber}>{String(cartCount).padStart(2, '0')}</Text>
    </HexFrame>

    {/* Centre : NINJA'S CORP dans octogone noir */}
    <View style={s.centerBlock}>
      {/* Flèches latérales */}
      <View style={[s.arrow, s.arrowLeft]} />
      <View style={s.nameBox}>
        <NeonTitle />
      </View>
      <View style={[s.arrow, s.arrowRight]} />
    </View>

    {/* Bloc "100%" — objectif annuel */}
    <HexFrame width={130} height={52} color="#3a5a7a">
      <HexGrid width={130} height={52} />
      <Text style={s.statNumber}>{annualPct}%</Text>
    </HexFrame>

    {/* Logo droit */}
    <LogoCircle logoUri={logoUri} />
  </View>
));

const s = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: 'transparent', height: 72,
  },
  // Cadre biseauté
  hexFrame: {
    backgroundColor: '#0a1422', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, position: 'relative',
  },
  hexCornerTL: { position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTopWidth: 2, borderLeftWidth: 2 },
  hexCornerTR: { position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTopWidth: 2, borderRightWidth: 2 },
  hexCornerBL: { position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
  hexCornerBR: { position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottomWidth: 2, borderRightWidth: 2 },
  statNumber: { fontFamily: F, fontSize: 22, color: '#c8e8ff', fontWeight: 'bold', letterSpacing: 3, zIndex: 1 },
  // Centre néon
  centerBlock: { flexDirection: 'row', alignItems: 'center' },
  arrow: { width: 0, height: 0 },
  arrowLeft:  { borderTopWidth: 18, borderBottomWidth: 18, borderRightWidth: 22, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: '#1a3a5a' },
  arrowRight: { borderTopWidth: 18, borderBottomWidth: 18, borderLeftWidth: 22, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#1a3a5a' },
  nameBox: { backgroundColor: '#000000', paddingHorizontal: 20, height: 52, alignItems: 'center', justifyContent: 'center', minWidth: 200 },
  neonText: { fontFamily: F, fontSize: 20, color: '#00ffcc', fontWeight: 'bold', letterSpacing: 3,
    textShadowColor: '#00ffcc', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  // Logo
  logoOuter: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  logoInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#0a1525', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#c8a040' },
  logoRing:  { position: 'absolute', width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderColor: '#c8a04080' },
  logoImg:   { width: 48, height: 48, borderRadius: 24 },
  logoPlaceholder: { fontFamily: F, fontSize: 22, color: '#c8a040', fontWeight: 'bold' },
});

module.exports = TopBar;
