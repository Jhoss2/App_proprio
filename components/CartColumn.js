/**
 * CartColumn — Panneau droit avec carts 3D React Three Fiber
 * 100% natif GPU — zéro WebView
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Image, Pressable, StyleSheet, ScrollView, Dimensions } = require('react-native');
const SvgLib = require('react-native-svg');
const { Svg, Defs, G, Path, Rect, Filter, FeGaussianBlur, FeMerge, FeMergeNode } = SvgLib;

// React Three Fiber + Three.js
let Canvas, useFrame, THREE;
try {
  const R3F = require('@react-three/fiber/native');
  Canvas   = R3F.Canvas;
  useFrame = R3F.useFrame;
  THREE    = require('three');
} catch(e) {
  Canvas   = null;
  useFrame = null;
  THREE    = null;
}

const { width: SW, height: SH } = Dimensions.get('window');
const W = SW * 0.168;
const H = SH * 0.585;

/* ── Modèle 3D d'un cart (R3F) ── */
const Cart3DModel = memo(({ color = 0xff7a1a }) => {
  const groupRef = useRef();
  if (!useFrame) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.015;
  });
  const col = new THREE.Color(color);
  return (
    <group ref={groupRef}>
      {/* Corps principal */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.2, 0.8, 3.2)]}/>
        <lineBasicMaterial color={col} linewidth={2}/>
      </lineSegments>
      {/* Roues */}
      {[[-1.1,-0.4,1.1],[1.1,-0.4,1.1],[-1.1,-0.4,-1.1],[1.1,-0.4,-1.1]].map((pos,i) => (
        <lineSegments key={i} position={pos} rotation={[0, Math.PI/2, 0]}>
          <edgesGeometry args={[new THREE.TorusGeometry(0.3, 0.08, 8, 16)]}/>
          <lineBasicMaterial color={0xffffff} linewidth={1}/>
        </lineSegments>
      ))}
      {/* Tablette au-dessus */}
      <lineSegments position={[0, 0.55, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.0, 0.08, 2.8)]}/>
        <lineBasicMaterial color={col} linewidth={1.5}/>
      </lineSegments>
      {/* Lumière ponctuelle */}
      <pointLight color={col} intensity={1.5} distance={8}/>
    </group>
  );
});

/* ── Item cart individuel (composant séparé = hooks propres) ── */
const CartItem = memo(({ cart, index, imgUri, onPress }) => {
  const COLORS = [0xff7a1a, 0x00f2ff, 0xff7a1a];
  const COLOR_HEX = ['#ff7a1a','#00f2ff','#ff7a1a'];
  const color = COLORS[index % 3];
  const colorHex = COLOR_HEX[index % 3];
  const on = cart.status === 'online';
  const itemH = H * 0.27;

  return (
    <Pressable onPress={onPress} style={[styles.cartItem, { height: itemH }]}>
      {/* Halo couleur */}
      <View style={[styles.cartHalo, { borderColor: on ? colorHex : '#333', height: itemH * 0.75, width: W * 0.78 }]}/>
      {/* Canvas 3D ou image fallback */}
      <View style={[styles.canvasWrap, { height: itemH * 0.65, width: W * 0.78 }]}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.cartImg} resizeMode="contain"/>
        ) : Canvas ? (
          <Canvas
            style={styles.canvas}
            gl={{ antialias:true, alpha:true }}
            camera={{ position:[0, 1.2, 5.5], fov:75 }}>
            <ambientLight intensity={0.3}/>
            <Cart3DModel color={color}/>
          </Canvas>
        ) : (
          /* Fallback si R3F non disponible */
          <View style={[styles.fallbackCart, { borderColor: colorHex }]}>
            <Text style={[styles.fallbackIcon, { color: colorHex }]}>⬡</Text>
          </View>
        )}
      </View>
      {/* Label */}
      <Text style={[styles.cartLabel, { color: colorHex }]}>{cart.name}</Text>
      {/* Statut */}
      <View style={[styles.statusDot, { backgroundColor: on ? '#00ff88' : '#ff3300' }]}/>
    </Pressable>
  );
});

const CartColumn = memo(({ carts = [], cartImages = {}, onCartPress }) => {
  const display = carts.length > 0 ? carts : [
    { id:'c1', name:'CART 01', status:'online'  },
    { id:'c2', name:'CART 02', status:'online'  },
    { id:'c3', name:'CART 03', status:'offline' },
  ];

  return (
    <View style={[styles.root, { width:W, height:H }]}>
      {/* Cadre SVG panneau droit */}
      <Svg width={W} height={H} viewBox="0 0 200 510" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="neonGlowR">
            <FeGaussianBlur stdDeviation="4" result="b1"/>
            <FeGaussianBlur stdDeviation="10" result="b2" in="SourceGraphic"/>
            <FeMerge><FeMergeNode in="b2"/><FeMergeNode in="b1"/><FeMergeNode in="SourceGraphic"/></FeMerge>
          </Filter>
        </Defs>
        {/* Forme du panneau droit */}
        <Path d="M 0 5 L 160 5 L 175 20 L 185 20 L 193 12 L 198 12 L 200 30 L 200 480 L 198 498 L 193 498 L 185 490 L 175 490 L 160 505 L 0 505 L -10 490 L -10 20 Z"
          fill="#1a080088" stroke="#ff7a1a" strokeWidth="2" filter="url(#neonGlowR)"/>
        {/* Fenêtre interne */}
        <Rect x="4" y="10" width="170" height="490" fill="#000000cc" stroke="#ff7a1a" strokeWidth="1.5" rx="2"/>
        {/* Flèche haut */}
        <Path d="M 90 18 L 82 28 L 98 28 Z" fill="#ff8c00"/>
        {/* Flèche bas */}
        <Path d="M 90 492 L 82 482 L 98 482 Z" fill="#ff8c00"/>
        {/* Lignes décoratives droite */}
        <Path d="M 190 80 L 196 80 M 190 160 L 196 160 M 190 240 L 196 240 M 190 320 L 196 320 M 190 400 L 196 400"
          stroke="#ff7a1a" strokeWidth="1" opacity="0.5"/>
        {/* Chevrons droite */}
        <Path d="M 188 450 L 196 445 L 188 440 M 188 460 L 196 455 L 188 450"
          fill="none" stroke="#ff7a1a" strokeWidth="1.5"/>
      </Svg>

      {/* ScrollView des carts */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {display.map((cart, i) => (
          <CartItem
            key={cart.id}
            cart={cart}
            index={i}
            imgUri={cartImages[cart.id] || cart.imageUri}
            onPress={() => onCartPress && onCartPress(cart)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  root:          { position:'absolute' },
  scroll:        { flex:1, paddingTop:H*0.06, paddingHorizontal:W*0.05 },
  scrollContent: { alignItems:'center', paddingBottom:20 },
  cartItem:      { width:'100%', alignItems:'center', justifyContent:'center', marginBottom:8, position:'relative' },
  cartHalo:      { position:'absolute', borderRadius:6, borderWidth:1.5, opacity:0.5 },
  canvasWrap:    { borderRadius:4, overflow:'hidden' },
  canvas:        { flex:1 },
  cartImg:       { width:'100%', height:'100%' },
  fallbackCart:  { flex:1, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderRadius:4 },
  fallbackIcon:  { fontSize:32 },
  cartLabel:     { fontSize:8.5, fontFamily:'monospace', letterSpacing:1, marginTop:3, fontWeight:'bold' },
  statusDot:     { width:5, height:5, borderRadius:2.5, marginTop:2 },
});

module.exports = CartColumn;
                         
