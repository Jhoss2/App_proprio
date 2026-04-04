const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Animated, StyleSheet, Easing } = require('react-native');
const { COLORS, FONT } = require('../constants');

/* ─────────────────────────────────────────
   PULSING GLOW BORDER
   Bordure qui pulse comme un néon
───────────────────────────────────────── */
const GlowBorder = memo(({ children, color = COLORS.orange, style, intensity = 1 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(anim, { toValue: 0, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const borderOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3 * intensity, 0.9 * intensity] });
  const shadowRadius  = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 12 * intensity] });

  return (
    <Animated.View style={[
      styles.glowBorder,
      {
        borderColor: color,
        borderOpacity,
        shadowColor: color,
        shadowRadius,
        shadowOpacity: 0.8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      },
      style,
    ]}>
      {children}
    </Animated.View>
  );
});

/* ─────────────────────────────────────────
   SCANNING LINE — ligne qui balaye
───────────────────────────────────────── */
const ScanLine = memo(({ color = COLORS.orange, height = 200 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, height] });

  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
      <View style={[styles.scanLineInner, { backgroundColor: color }]} />
    </Animated.View>
  );
});

/* ─────────────────────────────────────────
   BLINKING LED
───────────────────────────────────────── */
const BlinkLed = memo(({ color = COLORS.orange, size = 8, fast = false }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.1, duration: fast ? 300 : 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: fast ? 300 : 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: anim,
      shadowColor: color, shadowRadius: size, shadowOpacity: 1,
      shadowOffset: { width: 0, height: 0 }, elevation: 4,
    }} />
  );
});

/* ─────────────────────────────────────────
   ANIMATED NUMBER — les chiffres défilent
───────────────────────────────────────── */
const AnimatedNumber = memo(({ value, fontSize = 28, color = COLORS.orange, prefix = '', suffix = '' }) => {
  const displayAnim = useRef(new Animated.Value(0)).current;
  const prevVal     = useRef(value);

  useEffect(() => {
    if (prevVal.current !== value) {
      Animated.sequence([
        Animated.timing(displayAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(displayAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
      prevVal.current = value;
    }
  }, [value]);

  const opacity = displayAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.2, 1] });

  return (
    <Animated.Text style={[styles.animNumber, { fontSize, color, opacity, fontFamily: FONT.mono }]}>
      {prefix}{value}{suffix}
    </Animated.Text>
  );
});

/* ─────────────────────────────────────────
   BINARY RAIN — colonnes de code binaire
───────────────────────────────────────── */
const BinaryColumn = memo(({ x, delay, speed }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const chars = '01001101001010110100110101001011010100100111'.split('');

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.timing(anim, { toValue: 1, duration: speed, useNativeDriver: true, easing: Easing.linear })
      ).start();
    }, delay);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-200, 400] });

  return (
    <Animated.View style={[styles.binaryCol, { left: x, transform: [{ translateY }] }]}>
      {chars.slice(0, 8).map((c, i) => (
        <Text key={i} style={[styles.binaryChar, { opacity: (8 - i) / 10 }]}>{c}</Text>
      ))}
    </Animated.View>
  );
});

const BinaryRain = memo(({ width = 300, count = 8 }) => (
  <View style={[StyleSheet.absoluteFill, { width, overflow: 'hidden', opacity: 0.12 }]}>
    {Array.from({ length: count }, (_, i) => (
      <BinaryColumn
        key={i}
        x={(width / count) * i}
        delay={i * 300}
        speed={2000 + i * 400}
      />
    ))}
  </View>
));

/* ─────────────────────────────────────────
   CIRCULAR GAUGE — jauge circulaire
───────────────────────────────────────── */
const Svg        = require('react-native-svg').default;
const { Circle, Text: SvgText, G } = require('react-native-svg');

const CircularGauge = memo(({ value = 0, max = 100, size = 120, color = COLORS.orange, label = '' }) => {
  const anim     = useRef(new Animated.Value(0)).current;
  const pct      = Math.min(value / max, 1);
  const radius   = (size / 2) - 10;
  const circumf  = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 1200, useNativeDriver: false, easing: Easing.out(Easing.cubic) }).start();
  }, [value]);

  const strokeDash = anim.interpolate({ inputRange: [0, 1], outputRange: [0, circumf] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle cx={size/2} cy={size/2} r={radius} stroke={COLORS.borderMuted} strokeWidth={3} fill="none" />
        {/* Progress */}
        <AnimatedCircle
          cx={size/2} cy={size/2} r={radius}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeDasharray={circumf}
          strokeDashoffset={anim.interpolate({ inputRange:[0,1], outputRange:[circumf, 0]})}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2},${size/2}`}
        />
        <SvgText
          x={size/2} y={size/2 + 5}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.18}
          fontFamily={FONT.mono}
          fontWeight="bold"
        >
          {Math.round(pct * 100)}%
        </SvgText>
        {label ? (
          <SvgText x={size/2} y={size/2 + size*0.22} textAnchor="middle" fill={COLORS.textMuted} fontSize={8} fontFamily={FONT.mono}>
            {label}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
});

// Animated SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ─────────────────────────────────────────
   GLITCH TEXT — texte avec effet glitch
───────────────────────────────────────── */
const GlitchText = memo(({ text, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glitch = () => {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 60,  useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 60,  useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 40,  useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    };
    const interval = setInterval(glitch, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  return (
    <Animated.Text style={[style, { transform: [{ translateX }] }]}>
      {text}
    </Animated.Text>
  );
});

/* ─────────────────────────────────────────
   WAVE GRAPH — onde sinusoïdale animée
───────────────────────────────────────── */
const { Path, Svg: SvgComp } = require('react-native-svg');

const WaveGraph = memo(({ data = [], width = 300, height = 80, color = COLORS.cyan }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: false, easing: Easing.linear })
    ).start();
  }, []);

  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const maxVal = Math.max(...data, 1);
  const step   = width / (data.length - 1);

  const pathD = data.map((v, i) => {
    const x = i * step;
    const y = height - (v / maxVal) * (height - 10);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <ScanLine color={color} height={height} />
      <SvgComp width={width} height={height}>
        <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill={color} fillOpacity={0.08} />
      </SvgComp>
    </View>
  );
});

const styles = StyleSheet.create({
  glowBorder:    { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  scanLine:      { position: 'absolute', left: 0, right: 0, height: 40, pointerEvents: 'none' },
  scanLineInner: { height: 1, opacity: 0.5 },
  animNumber:    { fontWeight: 'bold', letterSpacing: 1 },
  binaryCol:     { position: 'absolute', flexDirection: 'column' },
  binaryChar:    { fontFamily: FONT.mono, fontSize: 10, color: '#003fff', lineHeight: 14 },
});

module.exports = { GlowBorder, ScanLine, BlinkLed, AnimatedNumber, BinaryRain, CircularGauge, GlitchText, WaveGraph };
    
