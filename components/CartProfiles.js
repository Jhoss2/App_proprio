/**
 * CartProfiles — colonne droite avec carts en rotation simulée
 * Flèches nav haut/bas, labels CART 01/02/03
 */
const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Image, Pressable, StyleSheet, Animated, Easing } = require('react-native');

const F = 'monospace';

/* ── Cart en rotation simulée ── */
const CartItem = memo(({ cart, onPress }) => {
  const rot = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation continue simulée par oscillation perspective
    Animated.loop(
      Animated.sequence([
        Animated.timing(rot, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(rot, { toValue: 0, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const scaleX = rot.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 1] });

  const isOnline = cart.status === 'online';

  return (
    <Pressable onPress={onPress} style={s.cartItem}>
      {/* Halo de statut */}
      <View style={[s.halo, { borderColor: isOnline ? '#00aaff' : '#333' }]} />
      {/* Image cart */}
      <Animated.View style={[s.imgWrap, { transform: [{ scaleX }] }]}>
        {cart.imageUri
          ? <Image source={{ uri: cart.imageUri }} style={s.cartImg} resizeMode="contain" />
          : <CartPlaceholder index={cart.index} />
        }
      </Animated.View>
      {/* Label */}
      <Text style={s.cartLabel}>{cart.name}</Text>
      {/* Indicateur online/offline */}
      <View style={[s.statusDot, { backgroundColor: isOnline ? '#00ff88' : '#ff3300' }]} />
    </Pressable>
  );
});

/* ── Placeholder cart si pas d'image ── */
const CartPlaceholder = memo(({ index }) => {
  const colors = ['#00aaff', '#00ffcc', '#aaaaff'];
  const c = colors[index % colors.length];
  return (
    <View style={[s.placeholder, { borderColor: c }]}>
      {/* Corps du cart */}
      <View style={[s.cartBody, { backgroundColor: `${c}22`, borderColor: c }]}>
        <View style={[s.cartTop, { backgroundColor: `${c}44` }]} />
        <View style={s.cartWheels}>
          <View style={[s.wheel, { borderColor: c }]} />
          <View style={[s.wheel, { borderColor: c }]} />
        </View>
      </View>
    </View>
  );
});

const CartProfiles = memo(({ carts = [], onCartPress }) => {
  const displayCarts = carts.length > 0 ? carts : [
    { id: 'cart_01', name: 'CART 01', status: 'online',  index: 0 },
    { id: 'cart_02', name: 'CART 02', status: 'online',  index: 1 },
    { id: 'cart_03', name: 'CART 03', status: 'offline', index: 2 },
  ];

  return (
    <View style={s.root}>
      {/* Flèche haut */}
      <Pressable style={s.arrowBtn}>
        <Text style={s.arrowText}>▲</Text>
      </Pressable>

      {/* Liste carts */}
      {displayCarts.map((cart, i) => (
        <CartItem
          key={cart.id}
          cart={cart}
          onPress={() => onCartPress && onCartPress(cart)}
        />
      ))}

      {/* Flèche bas */}
      <Pressable style={s.arrowBtn}>
        <Text style={s.arrowText}>▼</Text>
      </Pressable>
    </View>
  );
});

const s = StyleSheet.create({
  root:      { flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 8 },
  arrowBtn:  { padding: 6 },
  arrowText: { color: '#446688', fontSize: 14 },
  cartItem:  { alignItems: 'center', position: 'relative', marginVertical: 4 },
  halo:      { position: 'absolute', width: 74, height: 74, borderRadius: 37, borderWidth: 1.5, opacity: 0.5 },
  imgWrap:   { width: 68, height: 60, alignItems: 'center', justifyContent: 'center' },
  cartImg:   { width: 68, height: 60 },
  cartLabel: { fontFamily: F, fontSize: 8, color: '#88aacc', letterSpacing: 1, marginTop: 3 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5, position: 'absolute', top: 0, right: 0 },
  placeholder: { width: 60, height: 52, alignItems: 'center', justifyContent: 'center' },
  cartBody:  { width: 52, height: 40, borderWidth: 1, borderRadius: 3, overflow: 'hidden' },
  cartTop:   { height: 18, width: '100%' },
  cartWheels:{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8, marginTop: 6 },
  wheel:     { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
});

module.exports = CartProfiles;
