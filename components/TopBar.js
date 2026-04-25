/**
 * TopBar — Cadran supérieur SVG
 * Reproduction fidèle : honeycomb + neon orange + logos sphériques + NINJA'S CORP arc-en-ciel
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, StyleSheet, Animated, Easing, Pressable, Dimensions } = require('react-native');
const _svg          = require('react-native-svg');
const Svg           = _svg.Svg            || (_svg.default && _svg.default.Svg)            || _svg;
const Defs          = _svg.Defs           || (_svg.default && _svg.default.Defs);
const G             = _svg.G              || (_svg.default && _svg.default.G);
const Path          = _svg.Path           || (_svg.default && _svg.default.Path);
const Circle        = _svg.Circle         || (_svg.default && _svg.default.Circle);
const Rect          = _svg.Rect           || (_svg.default && _svg.default.Rect);
const Line          = _svg.Line           || (_svg.default && _svg.default.Line);
const SvgText       = _svg.Text           || (_svg.default && _svg.default.Text);
const LinearGradient= _svg.LinearGradient || (_svg.default && _svg.default.LinearGradient);
const RadialGradient= _svg.RadialGradient || (_svg.default && _svg.default.RadialGradient);
const Stop          = _svg.Stop           || (_svg.default && _svg.default.Stop);
const Filter        = _svg.Filter         || (_svg.default && _svg.default.Filter);
const FeGaussianBlur= _svg.FeGaussianBlur || (_svg.default && _svg.default.FeGaussianBlur);
const FeMerge       = _svg.FeMerge        || (_svg.default && _svg.default.FeMerge);
const FeMergeNode   = _svg.FeMergeNode    || (_svg.default && _svg.default.FeMergeNode);
const ClipPath      = _svg.ClipPath       || (_svg.default && _svg.default.ClipPath);
const Pattern       = _svg.Pattern        || (_svg.default && _svg.default.Pattern);
const SvgImage      = _svg.Image          || (_svg.default && _svg.default.Image);
const {
  Svg, Defs, G, Path, Rect, Circle, Text: SvgText,
  LinearGradient, RadialGradient, Stop, Pattern, Filter,
  FeGaussianBlur, FeMerge, FeMergeNode, Image: SvgImage,
  ClipPath, Use, Mask,
} = SvgLib;

const { width: SW, height: SH } = Dimensions.get('window');
const W = SW, H = SH * 0.155;
// Viewbox source cadran supérieur : 1000×140 environ (portion du 1000×450)
const VW = 1000, VH = 140;
const sx = W / VW, sy = H / VH;

const TopBar = memo(({ cartCount = 3, annualPct = 100, logoUri = null, onLogoPress }) => {
  // Pulsation néon
  const neonA = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(neonA, { toValue:1,   duration:1400, useNativeDriver:true }),
      Animated.timing(neonA, { toValue:0.5, duration:1400, useNativeDriver:true }),
    ])).start();
  }, []);

  const scale = Math.min(sx, sy);

  return (
    <View style={[styles.root, { width: W, height: H }]}>
      <Svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          {/* Honeycomb pattern */}
          <Pattern id="hc" width="18" height="10.4" patternUnits="userSpaceOnUse">
            <Path d="M3 0 L9 0 L12 5.2 L9 10.4 L3 10.4 L0 5.2 Z"
              fill="none" stroke="#ff8000" strokeWidth="0.8" opacity="0.5"/>
          </Pattern>
          {/* Gradients */}
          <LinearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#4a2510"/>
            <Stop offset="50%"  stopColor="#050302"/>
            <Stop offset="100%" stopColor="#2a150a"/>
          </LinearGradient>
          <LinearGradient id="bevelG" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#000000"/>
            <Stop offset="40%"  stopColor="#4d2200"/>
            <Stop offset="100%" stopColor="#ff8000"/>
          </LinearGradient>
          <LinearGradient id="rainbowG" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#00bfff"/>
            <Stop offset="33%"  stopColor="#ffea00"/>
            <Stop offset="66%"  stopColor="#39ff14"/>
            <Stop offset="100%" stopColor="#ff1493"/>
          </LinearGradient>
          <RadialGradient id="sphereG" cx="30%" cy="30%" r="70%">
            <Stop offset="0%"   stopColor="#ffae42"/>
            <Stop offset="50%"  stopColor="#d65100"/>
            <Stop offset="100%" stopColor="#3d1a00"/>
          </RadialGradient>
          <ClipPath id="logoClipL"><Circle cx="0" cy="0" r="52"/></ClipPath>
          <ClipPath id="logoClipR"><Circle cx="0" cy="0" r="52"/></ClipPath>
        </Defs>

        {/* ── BARRE CENTRALE ORANGE ── */}
        <Rect x="0" y="18" width={VW} height="100" fill="url(#armGrad)" rx="4"/>
        {/* Honeycomb gauche */}
        <Rect x="100" y="20" width="210" height="96" fill="url(#hc)" rx="2" opacity="0.7"/>
        {/* Honeycomb droite */}
        <Rect x="680" y="20" width="210" height="96" fill="url(#hc)" rx="2" opacity="0.7"/>

        {/* ── NÉON CONTOUR ORANGE ── */}
        <Path d="M 20 18 L 980 18 L 995 30 L 995 110 L 980 122 L 20 122 L 5 110 L 5 30 Z"
          fill="none" stroke="#ff8000" strokeWidth="3"
          filter="url(#orangeGlow)"/>

        {/* ── BISEAUX STATS ── */}
        {/* "03" zone */}
        <Path d="M 315 22 L 445 22 L 455 30 L 455 112 L 445 120 L 315 120 L 305 112 L 305 30 Z"
          fill="#000000cc" stroke="#ff8000" strokeWidth="1.5"/>
        {/* "100%" zone */}
        <Path d="M 555 22 L 685 22 L 695 30 L 695 112 L 685 120 L 555 120 L 545 112 L 545 30 Z"
          fill="#000000cc" stroke="#ff8000" strokeWidth="1.5"/>

        {/* ── TEXTES STATS ── */}
        <SvgText x="380" y="80" textAnchor="middle" fontSize="44" fontWeight="bold"
          fill="#e8d8c0" fontFamily="monospace" letterSpacing="3">
          {String(cartCount).padStart(2, '0')}
        </SvgText>
        <SvgText x="620" y="80" textAnchor="middle" fontSize="44" fontWeight="bold"
          fill="#e8d8c0" fontFamily="monospace" letterSpacing="3">
          {annualPct}%
        </SvgText>

        {/* ── HEXAGONE CENTRAL "NINJA'S CORP" ── */}
        {/* Pointe basse */}
        <Path d="M 500 118 L 484 106 L 516 106 Z" fill="#ff8000"/>
        {/* Hexagone */}
        <Path d="M 430 22 L 470 22 L 490 45 L 510 45 L 530 22 L 570 22 L 590 60 L 570 98 L 530 98 L 510 75 L 490 75 L 470 98 L 430 98 L 410 60 Z"
          fill="#000000" stroke="#ff8000" strokeWidth="2"/>
        {/* Flèches latérales de l'hexagone */}
        <Path d="M 410 60 L 395 60 L 385 50 L 385 70 L 395 60" fill="#ff8000"/>
        <Path d="M 590 60 L 605 60 L 615 50 L 615 70 L 605 60" fill="#ff8000"/>

        {/* NINJA'S CORP arc-en-ciel */}
        <SvgText x="500" y="68" textAnchor="middle" fontSize="22" fontWeight="bold"
          fill="url(#rainbowG)" fontFamily="monospace" letterSpacing="2">
          NINJA'S CORP
        </SvgText>

        {/* ── LOGO GAUCHE ── */}
        <G transform="translate(62,70)" onPress={onLogoPress}>
          <Circle r="55" fill="url(#sphereG)" stroke="#ffae42" strokeWidth="2"/>
          {logoUri
            ? <SvgImage x="-52" y="-52" width="104" height="104"
                clipPath="url(#logoClipL)"
                href={logoUri} preserveAspectRatio="xMidYMid slice"/>
            : <SvgText y="8" textAnchor="middle" fontSize="28"
                fill="#ffae42" fontWeight="bold" fontFamily="monospace">N</SvgText>
          }
          <Circle r="55" fill="none" stroke="#ffae42" strokeWidth="2" opacity="0.5"/>
        </G>

        {/* ── LOGO DROIT ── */}
        <G transform="translate(938,70)" onPress={onLogoPress}>
          <Circle r="55" fill="url(#sphereG)" stroke="#ffae42" strokeWidth="2"/>
          {logoUri
            ? <SvgImage x="-52" y="-52" width="104" height="104"
                clipPath="url(#logoClipR)"
                href={logoUri} preserveAspectRatio="xMidYMid slice"/>
            : <SvgText y="8" textAnchor="middle" fontSize="28"
                fill="#ffae42" fontWeight="bold" fontFamily="monospace">N</SvgText>
          }
          <Circle r="55" fill="none" stroke="#ffae42" strokeWidth="2" opacity="0.5"/>
        </G>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { position:'absolute', top:0, left:0 },
});

module.exports = TopBar;
