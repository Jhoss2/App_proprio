/**
 * ANIMATIONS.JS — Deep Space Orange
 * Uniquement View, Text, Animated de react-native
 * Aucun SVG animé, aucun style non supporté Android
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Animated, StyleSheet, Easing } = require('react-native');
const { COLORS, FONT } = require('../constants');

/* ══ GlowBorder ══════════════════════════════════════ */
const GlowBorder = memo(({ children, color = COLORS.orange, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${color}50`, color],
  });
  return (
    <Animated.View style={[styles.glowBorder, { borderColor }, style]}>
      {children}
    </Animated.View>
  );
});

/* ══ ScanLine ════════════════════════════════════════ */
const ScanLine = memo(({ color = COLORS.orange, containerHeight = 300 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1, duration: 2500,
        useNativeDriver: true, easing: Easing.linear,
      })
    ).start();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerHeight],
  });
  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
    >
      <View style={[styles.scanLineBar, { backgroundColor: color }]} />
    </Animated.View>
  );
});

/* ══ BlinkLed ════════════════════════════════════════ */
const BlinkLed = memo(({ color = COLORS.orange, size = 8, fast = false }) => {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.15, duration: fast ? 250 : 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,    duration: fast ? 250 : 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: anim,
    }} />
  );
});

/* ══ AnimatedNumber ══════════════════════════════════ */
const AnimatedNumber = memo(({ value, fontSize = 24, color = COLORS.orange, prefix = '', suffix = '' }) => {
  const anim    = useRef(new Animated.Value(1)).current;
  const prevVal = useRef(value);
  useEffect(() => {
    if (prevVal.current !== value) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 100, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: 100, useNativeDriver: true }),
      ]).start();
      prevVal.current = value;
    }
  }, [value]);
  return (
    <Animated.Text style={{ fontSize, color, opacity: anim, fontFamily: FONT.mono, fontWeight: 'bold' }}>
      {prefix}{value}{suffix}
    </Animated.Text>
  );
});

/* ══ BinaryRain ══════════════════════════════════════ */
const BinaryColumn = memo(({ left, delay, duration }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const chars = ['0','1','0','0','1','1','0','1'];
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true, easing: Easing.linear })
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-80, 300] });
  return (
    <Animated.View style={[styles.binCol, { left, transform: [{ translateY }] }]}>
      {chars.map((c, i) => (
        <Text key={i} style={[styles.binChar, { opacity: Math.max(0.05, (8 - i) / 10) }]}>{c}</Text>
      ))}
    </Animated.View>
  );
});

const BinaryRain = memo(({ width = 300, count = 8 }) => (
  <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width, overflow: 'hidden', opacity: 0.15 }}>
    {Array.from({ length: count }, (_, i) => (
      <BinaryColumn
        key={i}
        left={(width / count) * i}
        delay={i * 280}
        duration={2200 + i * 350}
      />
    ))}
  </View>
));

/* ══ CircularGauge — pur View/Text, pas de SVG animé ═ */
const CircularGauge = memo(({ value = 0, max = 100, size = 100, color = COLORS.orange, label = '' }) => {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const pctDisplay = Math.round(pct * 100);

  // On simule une jauge avec des barres Views empilées
  const bars = 12;
  const filled = Math.round(pct * bars);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Cercle extérieur simulé avec des segments */}
      <View style={{ width: size, height: size, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: bars }, (_, i) => {
          const angle = (i / bars) * 2 * Math.PI - Math.PI / 2;
          const r     = size / 2 - 6;
          const x     = r * Math.cos(angle);
          const y     = r * Math.sin(angle);
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: size / 2 + x - 2,
                top:  size / 2 + y - 2,
                width: 4, height: 4, borderRadius: 2,
                backgroundColor: i < filled ? color : `${color}25`,
              }}
            />
          );
        })}
      </View>
      {/* Valeur centrale */}
      <Text style={{ fontFamily: FONT.mono, fontSize: size * 0.18, color, fontWeight: 'bold' }}>
        {pctDisplay}%
      </Text>
      {!!label && (
        <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted, marginTop: 2 }}>
          {label}
        </Text>
      )}
    </View>
  );
});

/* ══ GlitchText ══════════════════════════════════════ */
const GlitchText = memo(({ text, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 50,  useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 50,  useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 35,  useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    };
    const iv = setInterval(run, 4500 + Math.random() * 2500);
    return () => clearInterval(iv);
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });
  return (
    <Animated.Text style={[style, { transform: [{ translateX }] }]}>{text}</Animated.Text>
  );
});

/* ══ WaveGraph — barres simples, pas de SVG ══════════ */
const WaveGraph = memo(({ data = [], width = 300, height = 80, color = COLORS.cyan }) => {
  if (!data || data.length < 2) {
    return <View style={{ width, height, backgroundColor: COLORS.bgCard, borderRadius: 4 }} />;
  }
  const maxVal = Math.max(...data, 1);
  const barW   = Math.floor(width / data.length) - 2;

  return (
    <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {data.map((v, i) => {
        const barH = Math.max(4, Math.round((v / maxVal) * (height - 8)));
        const pct  = v / maxVal;
        const barColor = pct > 0.7 ? COLORS.cyan : pct > 0.4 ? COLORS.orange : COLORS.amber;
        return (
          <View
            key={i}
            style={{
              width: barW, height: barH,
              backgroundColor: barColor,
              borderRadius: 2,
              opacity: 0.85,
            }}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  glowBorder: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 30,
  },
  scanLineBar: {
    height: 1,
    opacity: 0.6,
  },
  binCol: {
    position: 'absolute',
    top: 0,
  },
  binChar: {
    fontFamily: FONT.mono,
    fontSize: 10,
    color: '#0055ff',
    lineHeight: 13,
  },
});

module.exports = {
  GlowBorder,
  ScanLine,
  BlinkLed,
  AnimatedNumber,
  BinaryRain,
  CircularGauge,
  GlitchText,
  WaveGraph,
};
      
