/**
 * GalaxyBg — fond galaxie + étoiles + points lumineux sur circuits
 * 100% Animated React Native, useNativeDriver:true uniquement
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Animated, StyleSheet, Easing, Dimensions } = require('react-native');

const { width: W, height: H } = Dimensions.get('window');

/* ── Étoile scintillante ── */
const Star = memo(({ x, y, size, delay }) => {
  const a = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(a, { toValue: 1,   duration: 800 + Math.random()*600, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.1, duration: 800 + Math.random()*600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#ffffff', opacity: a,
    }} />
  );
});

/* ── Point lumineux sur circuit (suit un chemin prédéfini) ── */
const CircuitDot = memo(({ points, color = '#00ffff', delay = 0, duration = 3000 }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1, duration, useNativeDriver: true, easing: Easing.linear,
        }),
      ])
    ).start();
    return () => progress.setValue(0);
  }, []);

  // On calcule les positions interpolées pour chaque segment
  const n = points.length;
  if (n < 2) return null;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const steps = points.map((_, i) => i / (n - 1));

  const tx = progress.interpolate({ inputRange: steps, outputRange: xs, extrapolate: 'clamp' });
  const ty = progress.interpolate({ inputRange: steps, outputRange: ys, extrapolate: 'clamp' });

  return (
    <Animated.View style={{
      position: 'absolute',
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: color,
      transform: [{ translateX: tx }, { translateY: ty }],
      shadowColor: color, shadowRadius: 6, shadowOpacity: 1,
      shadowOffset: { width: 0, height: 0 }, elevation: 4,
    }} />
  );
});

/* ── Fond galaxie principal ── */
const GalaxyBg = memo(() => {
  // Étoiles fixes pseudo-aléatoires (seed fixe pour cohérence)
  const stars = [
    { x: 50,  y: 80,  s: 1.5, d: 0    },
    { x: 120, y: 200, s: 1,   d: 200  },
    { x: 200, y: 50,  s: 2,   d: 400  },
    { x: 350, y: 150, s: 1.5, d: 100  },
    { x: 500, y: 90,  s: 1,   d: 600  },
    { x: 650, y: 180, s: 2,   d: 300  },
    { x: 800, y: 60,  s: 1.5, d: 500  },
    { x: 950, y: 170, s: 1,   d: 150  },
    { x: 1050,y: 80,  s: 2,   d: 700  },
    { x: 1100,y: 220, s: 1.5, d: 250  },
    { x: 80,  y: 400, s: 1,   d: 350  },
    { x: 180, y: 550, s: 2,   d: 450  },
    { x: 900, y: 400, s: 1.5, d: 550  },
    { x: 1050,y: 500, s: 1,   d: 650  },
    { x: 30,  y: 600, s: 2,   d: 800  },
    { x: 750, y: 620, s: 1.5, d: 200  },
    { x: 400, y: 700, s: 1,   d: 900  },
    { x: 600, y: 680, s: 2,   d: 100  },
  ];

  // Chemins de points lumineux cyan — contours des cadres principaux
  const circuitPaths = [
    // Contour cadre gauche SYS.LOG
    {
      color: '#00ffff', duration: 4000, delay: 0,
      points: [
        { x: 20,  y: 200 }, { x: 20,  y: 560 },
        { x: 240, y: 560 }, { x: 240, y: 200 }, { x: 20, y: 200 },
      ],
    },
    // Contour cadre central haut
    {
      color: '#00ffff', duration: 5000, delay: 800,
      points: [
        { x: 280, y: 200 }, { x: 280, y: 580 },
        { x: 760, y: 580 }, { x: 760, y: 200 }, { x: 280, y: 200 },
      ],
    },
    // Contour cadre droite carts
    {
      color: '#00ff88', duration: 4500, delay: 400,
      points: [
        { x: 820, y: 200 }, { x: 820, y: 560 },
        { x: 1100, y: 560 }, { x: 1100, y: 200 }, { x: 820, y: 200 },
      ],
    },
    // Contour bande bas gauche
    {
      color: '#00aaff', duration: 3500, delay: 1200,
      points: [
        { x: 20, y: 600 }, { x: 550, y: 600 },
        { x: 550, y: 790 }, { x: 20, y: 790 }, { x: 20, y: 600 },
      ],
    },
    // Contour bande bas droite
    {
      color: '#ff7700', duration: 3500, delay: 600,
      points: [
        { x: 570, y: 600 }, { x: 1100, y: 600 },
        { x: 1100, y: 790 }, { x: 570, y: 790 }, { x: 570, y: 600 },
      ],
    },
    // Diagonal top-left vers centre
    {
      color: '#00ffff', duration: 2500, delay: 300,
      points: [
        { x: 240, y: 300 }, { x: 280, y: 380 }, { x: 300, y: 420 },
      ],
    },
    // Diagonal top-right vers centre
    {
      color: '#00ff88', duration: 2500, delay: 900,
      points: [
        { x: 820, y: 300 }, { x: 780, y: 380 }, { x: 760, y: 420 },
      ],
    },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fond noir profond */}
      <View style={s.bg} />
      {/* Nébuleuse gauche — cercle flou sombre */}
      <View style={[s.nebula, { left: -60, top: 100, backgroundColor: '#001133' }]} />
      {/* Nébuleuse droite */}
      <View style={[s.nebula, { right: -60, bottom: 100, backgroundColor: '#110022' }]} />
      {/* Étoiles */}
      {stars.map((st, i) => (
        <Star key={i} x={st.x} y={st.y} size={st.s} delay={st.d} />
      ))}
      {/* Points lumineux sur circuits */}
      {circuitPaths.map((p, i) => (
        <CircuitDot key={i} points={p.points} color={p.color} delay={p.delay} duration={p.duration} />
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  bg:     { ...StyleSheet.absoluteFillObject, backgroundColor: '#020810' },
  nebula: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    opacity: 0.35,
  },
});

module.exports = GalaxyBg;
