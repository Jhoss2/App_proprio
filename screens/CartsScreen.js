const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const {
  View, Text, ScrollView, StyleSheet, Animated,
  SafeAreaView, Pressable, TextInput, Alert, Easing,
} = require('react-native');
const { doc, setDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');

const { GlowBorder, BlinkLed, CircularGauge, AnimatedNumber, ScanLine } = require('../components/Animations');
const { useAllCarts, useCartOrders } = require('../hooks/useFirestore');
const { COLORS, FONT } = require('../constants');

/* ─── Gear — engrenage holographique ─── */
const HoloGear = memo(({ color = COLORS.orange, size = 60, rpm = 1, label = '', status = 'ok' }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: status === 'low' ? 6000 / rpm : 3000 / rpm,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [rpm, status]);

  const rotate   = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const gearColor = status === 'critical' ? COLORS.red : status === 'low' ? COLORS.amber : color;

  return (
    <View style={[styles.gearWrapper, { width: size, height: size }]}>
      <Animated.View style={[styles.gearOuter, {
        width: size, height: size, borderRadius: size / 2,
        borderColor: gearColor, transform: [{ rotate }],
        shadowColor: gearColor,
      }]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <View key={deg} style={[styles.gearTooth, {
            transform: [{ rotate: `${deg}deg` }, { translateY: -(size / 2 - 2) }],
            backgroundColor: gearColor, width: 4, height: 6,
          }]} />
        ))}
      </Animated.View>
      <View style={styles.gearCenter}>
        <Text style={[styles.gearLabel, { color: gearColor, fontSize: size * 0.12 }]}>{label}</Text>
      </View>
    </View>
  );
});

/* ─── Stock Level ─── */
const StockBar = memo(({ label, value, max = 100 }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const pct   = Math.min(value / max, 1);
  const color = pct < 0.2 ? COLORS.red : pct < 0.5 ? COLORS.amber : COLORS.cyan;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 1000, useNativeDriver: false, easing: Easing.out(Easing.cubic) }).start();
  }, [value]);

  const status = pct < 0.2 ? 'critical' : pct < 0.5 ? 'low' : 'ok';

  return (
    <View style={styles.stockRow}>
      <HoloGear color={color} size={28} rpm={pct < 0.2 ? 0.3 : pct < 0.5 ? 0.6 : 1.2} label="" status={status} />
      <View style={{ flex: 1 }}>
        <View style={styles.stockLabelRow}>
          <Text style={styles.stockLabel}>{label}</Text>
          <AnimatedNumber value={Math.round(pct * 100)} suffix="%" fontSize={10} color={color} />
        </View>
        <View style={styles.stockBarBg}>
          <Animated.View style={[styles.stockBarFill, {
            width: anim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }),
            backgroundColor: color, shadowColor: color,
          }]} />
        </View>
        {pct < 0.2 && (
          <Text style={styles.stockAlert}>⚠ STOCK_CRITIQUE</Text>
        )}
      </View>
    </View>
  );
});

/* ─── Cart Card ─── */
const CartCard = memo(({ cart, onDelete }) => {
  const { orders } = useCartOrders(cart.id, 5);
  const today      = new Date().toLocaleDateString('fr-FR');
  const todayOrd   = orders.filter(o => o.date === today);
  const todayTotal = todayOrd.reduce((s, o) => s + (o.total || 0), 0);
  const isOnline   = cart.updatedAt ? (Date.now()/1000 - cart.updatedAt.seconds) < 300 : false;

  // Stocks simulés — seront remplacés par vraies données Firestore
  const stocks = [
    { label: 'HUILE',   value: 65 },
    { label: 'FRITES',  value: 42 },
    { label: 'BOISSONS',value: 78 },
    { label: 'EMBALL.', value: 15 },
  ];

  return (
    <GlowBorder color={isOnline ? COLORS.orange : COLORS.red} style={styles.cartCard}>
      {/* En-tête */}
      <View style={styles.cartHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BlinkLed color={isOnline ? COLORS.cyan : COLORS.red} size={7} />
          <View>
            <Text style={styles.cartName}>{(cart.cartName || cart.id).toUpperCase()}</Text>
            <Text style={styles.cartId}>ID: {cart.id}</Text>
          </View>
        </View>
        <View style={styles.cartHeaderRight}>
          <AnimatedNumber value={todayTotal.toLocaleString('fr-FR')} suffix=" F" fontSize={14} color={COLORS.orange} />
          <Pressable onPress={() => Alert.alert('Supprimer', `Supprimer "${cart.cartName || cart.id}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: () => deleteDoc(doc(db, 'carts', cart.id)) },
          ])} style={{ padding: 4 }}>
            <Text style={{ color: COLORS.red, fontFamily: FONT.mono, fontSize: 14 }}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Jauges + stocks en colonnes */}
      <View style={styles.cartBody}>
        {/* Gauche : jauges circulaires */}
        <View style={styles.gaugesCol}>
          <CircularGauge value={todayOrd.length} max={50} size={64} color={COLORS.orange} label="CMD" />
          <CircularGauge value={isOnline ? 95 : 0} max={100} size={64} color={COLORS.cyan} label="UPTIME" />
        </View>

        {/* Droite : stocks */}
        <View style={styles.stocksCol}>
          {stocks.map(s => <StockBar key={s.label} {...s} />)}
        </View>
      </View>
    </GlowBorder>
  );
});

/* ─── ÉCRAN PRINCIPAL ─── */
const CartsScreen = () => {
  const { carts, loading } = useAllCarts();
  const [newId,   setNewId]   = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    const id = newId.trim();
    if (!id) return;
    try {
      await setDoc(doc(db, 'carts', id), {
        cartId: id, cartName: newName.trim() || id,
        createdAt: serverTimestamp(),
      });
      setNewId(''); setNewName('');
    } catch (e) { Alert.alert('Erreur', e.message); }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScanLine color={COLORS.amber} height={600} />

      <View style={styles.header}>
        <BlinkLed color={COLORS.amber} size={6} />
        <Text style={styles.headerTitle}>CONSOLE MÉCANIQUE · CARTS</Text>
        <Text style={styles.headerSub}>{carts.length} ENREGISTRÉ(S)</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Formulaire */}
        <GlowBorder color={COLORS.amber} style={styles.addForm}>
          <Text style={styles.formTitle}>// DEPLOY_NEW_CART</Text>
          <TextInput
            style={styles.input}
            placeholder="cart_id (ex: cart_01)"
            placeholderTextColor={COLORS.textMuted}
            value={newId} onChangeText={setNewId} autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Nom affiché (ex: Cart Centre)"
            placeholderTextColor={COLORS.textMuted}
            value={newName} onChangeText={setNewName}
          />
          <Pressable style={styles.deployBtn} onPress={handleAdd}>
            <Text style={styles.deployBtnText}>▶ DEPLOY_CART</Text>
          </Pressable>
        </GlowBorder>

        {loading && <Text style={styles.loadingText}>SCANNING_NETWORK...</Text>}
        {carts.map(cart => <CartCard key={cart.id} cart={cart} onDelete={() => {}} />)}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.amberDim,
    backgroundColor: COLORS.bgPanel,
  },
  headerTitle: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.amber, letterSpacing: 2, flex: 1 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 8,  color: COLORS.textMuted },
  scroll:      { padding: 12, paddingBottom: 30 },

  addForm:   { padding: 12, marginBottom: 14 },
  formTitle: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.amber, letterSpacing: 1.5, marginBottom: 10 },
  input:     { backgroundColor: COLORS.bgCard, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.borderMuted, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, fontFamily: FONT.mono, fontSize: 11, marginBottom: 8 },
  deployBtn: { backgroundColor: COLORS.amberDim, borderWidth: 1, borderColor: COLORS.amber, borderRadius: 4, padding: 10, alignItems: 'center' },
  deployBtnText: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.amber, letterSpacing: 2 },

  cartCard:  { padding: 12, marginBottom: 12 },
  cartHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cartName:  { fontFamily: FONT.mono, fontSize: 13, color: COLORS.textPrimary, letterSpacing: 1 },
  cartId:    { fontFamily: FONT.mono, fontSize: 8,  color: COLORS.textMuted, marginTop: 2 },
  cartHeaderRight: { alignItems: 'flex-end', gap: 4 },
  cartBody:  { flexDirection: 'row', gap: 12 },
  gaugesCol: { gap: 8, alignItems: 'center' },
  stocksCol: { flex: 1, gap: 8 },

  gearWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  gearOuter:   { borderWidth: 2, position: 'absolute', alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  gearTooth:   { position: 'absolute', borderRadius: 1 },
  gearCenter:  { alignItems: 'center', justifyContent: 'center' },
  gearLabel:   { fontFamily: FONT.mono, fontWeight: 'bold', textAlign: 'center' },

  stockRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stockLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  stockLabel:    { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted },
  stockBarBg:    { height: 3, backgroundColor: COLORS.borderMuted, borderRadius: 2, overflow: 'hidden' },
  stockBarFill:  { height: '100%', borderRadius: 2, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  stockAlert:    { fontFamily: FONT.mono, fontSize: 7, color: COLORS.red, marginTop: 2 },

  loadingText: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.textMuted, textAlign: 'center', padding: 20 },
});

module.exports = CartsScreen;
