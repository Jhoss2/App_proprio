import React, { useRef, useEffect, memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, Animated, Easing, useWindowDimensions } from 'react-native';
import Svg, {
  Defs, Path, Rect, Filter, FeGaussianBlur, FeMerge, FeMergeNode,
} from 'react-native-svg';

const CartSVG = memo(({ color, W }) => {
  const size = W * 0.82;
  const rotAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(rotAnim, { toValue:1, duration:2800, useNativeDriver:true, easing:Easing.inOut(Easing.sin) }),
      Animated.timing(rotAnim, { toValue:0, duration:2800, useNativeDriver:true, easing:Easing.inOut(Easing.sin) }),
    ])).start();
  }, []);
  const sx = rotAnim.interpolate({ inputRange:[0,0.5,1], outputRange:[1,0.75,1] });
  if (!size || size <= 0) return null;
  return (
    <Animated.View style={{ width:size, height:size*0.75, transform:[{scaleX:sx}] }}>
      <Svg width={size} height={size*0.75} viewBox="0 0 120 90">
        <Rect x="10" y="20" width="100" height="50" rx="4" fill={color + '18'} stroke={color} strokeWidth="2"/>
        <Rect x="15" y="12" width="90"  height="12" rx="2" fill={color + '30'} stroke={color} strokeWidth="1.5"/>
        <Rect x="20" y="28" width="30" height="20" rx="2" fill={color + '25'} stroke={color + '88'} strokeWidth="1"/>
        <Rect x="70" y="28" width="30" height="20" rx="2" fill={color + '25'} stroke={color + '88'} strokeWidth="1"/>
      </Svg>
    </Animated.View>
  );
});

const CartItem = memo(({ cart, index, imgUri, onPress, W, H }) => {
  const COLOR_HEX = ['#ff7a1a','#00f2ff','#ff7a1a'];
  const colorHex  = COLOR_HEX[index % 3];
  const on        = cart.status === 'online';
  const itemH     = H * 0.27;
  const cartSize  = W * 0.82;
  return (
    <Pressable onPress={onPress} style={{ width:'100%', height:itemH, alignItems:'center', justifyContent:'center', marginBottom:6, position:'relative' }}>
      <View style={{ position:'absolute', borderRadius:6, borderWidth:1.5, borderColor:on?colorHex:'#333', opacity:0.45, width:cartSize*1.05, height:itemH*0.78 }}/>
      <View style={{ width:cartSize, height:itemH*0.65, alignItems:'center', justifyContent:'center' }}>
        {imgUri
          ? <Image source={{uri:imgUri}} style={{ width:'100%', height:'100%', borderRadius:4 }} resizeMode="contain"/>
          : <CartSVG color={colorHex} W={W}/>
        }
      </View>
      <Text style={{ fontSize:8, fontFamily:'monospace', letterSpacing:1, marginTop:3, fontWeight:'bold', color:colorHex }}>
        {cart.name || 'CART 0' + (index+1)}
      </Text>
      <View style={{ width:5, height:5, borderRadius:2.5, marginTop:2, backgroundColor:on?'#00ff88':'#ff3300' }}/>
    </Pressable>
  );
});

const CartColumn = memo(({ carts=[], cartImages={}, onCartPress }) => {
  const { width: SW, height: SH } = useWindowDimensions();
  const W = SW * 0.168;
  const H = SH * 0.585;

  const display = carts.length > 0 ? carts : [
    { id:'c1', name:'CART 01', status:'online'  },
    { id:'c2', name:'CART 02', status:'online'  },
    { id:'c3', name:'CART 03', status:'offline' },
  ];

  if (!SW || !SH) return null;

  return (
    <View style={{ position:'absolute', width:W, height:H }}>
      <Svg width={W} height={H} viewBox="0 0 200 510" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="neonGlowCC" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur stdDeviation="4" result="b1"/>
            <FeGaussianBlur stdDeviation="10" result="b2" in="SourceGraphic"/>
            <FeMerge><FeMergeNode in="b2"/><FeMergeNode in="b1"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
        </Defs>
        <Path d="M 0 5 L 158 5 L 173 18 L 183 18 L 191 10 L 196 10 L 198 28 L 198 482 L 196 500 L 191 500 L 183 492 L 173 492 L 158 505 L 0 505 L -8 492 L -8 18 Z"
          fill="#1a080088" stroke="#ff7a1a" strokeWidth="2" filter="url(#neonGlowCC)"/>
        <Rect x="4" y="10" width="168" height="490" fill="#000000bb" stroke="#ff7a1a" strokeWidth="1.5" rx="2"/>
        <Path d="M 88 16 L 80 26 L 96 26 Z" fill="#ff8c00"/>
        <Path d="M 88 494 L 80 484 L 96 484 Z" fill="#ff8c00"/>
      </Svg>
      <ScrollView
        style={{ flex:1, paddingTop:H*0.07, paddingHorizontal:W*0.04 }}
        contentContainerStyle={{ alignItems:'center', paddingBottom:20 }}
        showsVerticalScrollIndicator={false}>
        {display.map((cart,i) => (
          <CartItem key={cart.id} cart={cart} index={i}
            imgUri={cartImages[cart.id] || cart.imageUri || null}
            onPress={() => onCartPress && onCartPress(cart)}
            W={W} H={H}/>
        ))}
      </ScrollView>
    </View>
  );
});

export default CartColumn;
