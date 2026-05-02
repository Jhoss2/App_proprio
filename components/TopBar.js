import React, { useRef, useEffect, memo } from 'react';
import { View, StyleSheet, Animated, Pressable, useWindowDimensions } from 'react-native';
import Svg, {
  Defs, G, Path, Rect, Circle, Text as SvgText,
  LinearGradient, RadialGradient, Stop, ClipPath, Image as SvgImage,
} from 'react-native-svg';

const TopBar = memo(({ cartCount=3, annualPct=100, logoUri=null, onLogoPress }) => {
  const { width: SW, height: SH } = useWindowDimensions();
  const W = SW, H = SH * 0.155;
  const VW = 1000, VH = 140;

  const neonA = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(neonA, { toValue:1,   duration:1400, useNativeDriver:true }),
      Animated.timing(neonA, { toValue:0.5, duration:1400, useNativeDriver:true }),
    ])).start();
  }, []);

  if (!SW || !SH) return null;

  return (
    <View style={{ position:'absolute', top:0, left:0, width:W, height:H }}>
      <Svg width={W} height={H} viewBox={'0 0 ' + VW + ' ' + VH} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="armGradTB" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#4a2510"/>
            <Stop offset="50%"  stopColor="#050302"/>
            <Stop offset="100%" stopColor="#2a150a"/>
          </LinearGradient>
          <LinearGradient id="rainbowGTB" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#00bfff"/>
            <Stop offset="33%"  stopColor="#ffea00"/>
            <Stop offset="66%"  stopColor="#39ff14"/>
            <Stop offset="100%" stopColor="#ff1493"/>
          </LinearGradient>
          <RadialGradient id="sphereGTB" cx="30%" cy="30%" r="70%">
            <Stop offset="0%"   stopColor="#ffae42"/>
            <Stop offset="50%"  stopColor="#d65100"/>
            <Stop offset="100%" stopColor="#3d1a00"/>
          </RadialGradient>
          <ClipPath id="logoClipLTB"><Circle cx="0" cy="0" r="52"/></ClipPath>
          <ClipPath id="logoClipRTB"><Circle cx="0" cy="0" r="52"/></ClipPath>
        </Defs>

        {/* Barre */}
        <Rect x="0" y="18" width={VW} height="100" fill="url(#armGradTB)" rx="4"/>
        {/* Honeycomb gauche */}
        {Array.from({length:80},(_,i) => {
          const col = i % 8, row = Math.floor(i/8);
          const x = 105 + col*14 + (row%2)*7, y = 22 + row*9;
          if (x > 300 || y > 116) return null;
          return <Path key={i} d={'M '+(x+4)+' '+y+' L '+(x+8)+' '+y+' L '+(x+10)+' '+(y+4)+' L '+(x+8)+' '+(y+8)+' L '+(x+4)+' '+(y+8)+' L '+(x+2)+' '+(y+4)+' Z'} fill="none" stroke="#ff8000" strokeWidth="0.6" opacity="0.45"/>;
        })}
        {/* Honeycomb droite */}
        {Array.from({length:80},(_,i) => {
          const col = i % 8, row = Math.floor(i/8);
          const x = 685 + col*14 + (row%2)*7, y = 22 + row*9;
          if (x > 890 || y > 116) return null;
          return <Path key={'r'+i} d={'M '+(x+4)+' '+y+' L '+(x+8)+' '+y+' L '+(x+10)+' '+(y+4)+' L '+(x+8)+' '+(y+8)+' L '+(x+4)+' '+(y+8)+' L '+(x+2)+' '+(y+4)+' Z'} fill="none" stroke="#ff8000" strokeWidth="0.6" opacity="0.45"/>;
        })}
        {/* Contour orange */}
        <Path d="M 20 18 L 980 18 L 995 30 L 995 110 L 980 122 L 20 122 L 5 110 L 5 30 Z" fill="none" stroke="#ff8000" strokeWidth="3"/>
        {/* Zone 03 */}
        <Path d="M 315 22 L 445 22 L 455 30 L 455 112 L 445 120 L 315 120 L 305 112 L 305 30 Z" fill="#000000cc" stroke="#ff8000" strokeWidth="1.5"/>
        {/* Zone 100% */}
        <Path d="M 555 22 L 685 22 L 695 30 L 695 112 L 685 120 L 555 120 L 545 112 L 545 30 Z" fill="#000000cc" stroke="#ff8000" strokeWidth="1.5"/>
        {/* Chiffres */}
        <SvgText x="380" y="80" textAnchor="middle" fontSize="44" fontWeight="bold" fill="#e8d8c0" fontFamily="monospace" letterSpacing="3">{String(cartCount).padStart(2,'0')}</SvgText>
        <SvgText x="620" y="80" textAnchor="middle" fontSize="44" fontWeight="bold" fill="#e8d8c0" fontFamily="monospace" letterSpacing="3">{annualPct + '%'}</SvgText>
        {/* Hexagone central */}
        <Path d="M 500 118 L 484 106 L 516 106 Z" fill="#ff8000"/>
        <Path d="M 430 22 L 470 22 L 490 45 L 510 45 L 530 22 L 570 22 L 590 60 L 570 98 L 530 98 L 510 75 L 490 75 L 470 98 L 430 98 L 410 60 Z" fill="#000000" stroke="#ff8000" strokeWidth="2"/>
        <Path d="M 410 60 L 395 60 L 385 50 L 385 70 L 395 60" fill="#ff8000"/>
        <Path d="M 590 60 L 605 60 L 615 50 L 615 70 L 605 60" fill="#ff8000"/>
        <SvgText x="500" y="68" textAnchor="middle" fontSize="22" fontWeight="bold" fill="url(#rainbowGTB)" fontFamily="monospace" letterSpacing="2">NINJA'S CORP</SvgText>
        {/* Logo gauche */}
        <G transform="translate(62,70)" onPress={onLogoPress}>
          <Circle r="55" fill="url(#sphereGTB)" stroke="#ffae42" strokeWidth="2"/>
          {logoUri
            ? <SvgImage x="-52" y="-52" width="104" height="104" clipPath="url(#logoClipLTB)" href={logoUri} preserveAspectRatio="xMidYMid slice"/>
            : <SvgText y="8" textAnchor="middle" fontSize="28" fill="#ffae42" fontWeight="bold" fontFamily="monospace">N</SvgText>}
          <Circle r="55" fill="none" stroke="#ffae42" strokeWidth="2" opacity="0.5"/>
        </G>
        {/* Logo droit */}
        <G transform="translate(938,70)" onPress={onLogoPress}>
          <Circle r="55" fill="url(#sphereGTB)" stroke="#ffae42" strokeWidth="2"/>
          {logoUri
            ? <SvgImage x="-52" y="-52" width="104" height="104" clipPath="url(#logoClipRTB)" href={logoUri} preserveAspectRatio="xMidYMid slice"/>
            : <SvgText y="8" textAnchor="middle" fontSize="28" fill="#ffae42" fontWeight="bold" fontFamily="monospace">N</SvgText>}
          <Circle r="55" fill="none" stroke="#ffae42" strokeWidth="2" opacity="0.5"/>
        </G>
      </Svg>
    </View>
  );
});

export default TopBar;
