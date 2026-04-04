const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const {
  View, Text, ScrollView, StyleSheet, Animated,
  SafeAreaView, Pressable, Easing,
} = require('react-native');

const { GlowBorder, BlinkLed, AnimatedNumber, WaveGraph, ScanLine } = require('../components/Animations');
const { useAllCarts, useCartOrders } = require('../hooks/useFirestore');
const { COLORS, FONT, SCREEN_WIDTH } = require('../constants');

/* ─── Equalizer Bar ─── */
const EqBar = memo(({ order, index, onPress, expanded }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  const pct     = Math.min((order.total || 0) / 3000, 1);
  const barColor = pct > 0.7 ? COLORS.cyan : pct > 0.4 ? COLORS.orange : COLORS.amber;

  useEffect(() => {
    Animated.spring(heightAnim, { toValue: pct, useNativeDriver: false, tension: 80, friction: 8 }).start();
  }, [order.total]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
    onPress(order);
  };

  const barHeight = heightAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 80] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <Pressable style={styles.eqBarWrapper} onPress={handlePress}>
      <Animated.View style={[styles.eqBarGlow, { backgroundColor: barColor, opacity: glowOpacity }]} />
      <Animated.View style={[styles.eqBar, { height: barHeight, backgroundColor: barColor, shadowColor: barColor }]} />
      <Text style={[styles.eqLabel, { color: barColor }]}>{order.time?.split(':').slice(0,2).join(':') || '--'}</Text>
    </Pressable>
  );
});

/* ─── Ticket Detail ─── */
const TicketDetail = memo(({ order, onClose }) => {
  if (!order) return null;
  const items = JSON.parse(order.items || '[]');

  return (
    <View style={styles.ticket}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle}>TICKET #{String(order.id).slice(-4)}</Text>
        <Pressable onPress={onClose}><Text style={styles.ticketClose}>✕</Text></Pressable>
      </View>
      <View style={styles.ticketDivider} />
      <Text style={styles.ticketMeta}>{order.date} · {order.time} · {order.cartId}</Text>
      {items.map((it, i) => {
        const extras = JSON.parse(it.extras || '{}');
        return (
          <View key={i} style={styles.ticketItem}>
            <Text style={styles.ticketItemName}>
              <Text style={{ color: COLORS.orange }}>{it.quantity}×</Text> {it.name}
            </Text>
            {(extras.garnitures || []).map((g, j) => (
              <Text key={j} style={styles.ticketExtra}>+ {g.name} · {g.price}F</Text>
            ))}
          </View>
        );
      })}
      <View style={styles.ticketDivider} />
      <View style={styles.ticketTotal}>
        <Text style={styles.ticketTotalLabel}>TOTAL</Text>
        <Text style={styles.ticketTotalVal}>{order.total} F</Text>
      </View>
    </View>
  );
});

/* ─── ÉCRAN PRINCIPAL ─── */
const VentesScreen = () => {
  const { carts }           = useAllCarts();
  const [selectedCart, setSelectedCart] = useState(null);
  const cartId              = selectedCart || carts[0]?.id;
  const { orders, loading } = useCartOrders(cartId, 100);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterDate, setFilterDate]       = useState(null);

  const today     = new Date().toLocaleDateString('fr-FR');
  const todayOrd  = orders.filter(o => o.date === today);
  const totalDay  = todayOrd.reduce((s, o) => s + (o.total || 0), 0);
  const avgBasket = todayOrd.length > 0 ? Math.round(totalDay / todayOrd.length) : 0;

  // Données pour le wave graph — totaux par heure
  const waveData = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return todayOrd
      .filter(o => o.time && parseInt(o.time.split(':')[0]) === hour)
      .reduce((s, o) => s + (o.total || 0), 0);
  });

  const displayOrders = filterDate
    ? orders.filter(o => o.date === filterDate)
    : todayOrd;

  return (
    <SafeAreaView style={styles.root}>
      <ScanLine color={COLORS.cyan} height={600} />

      {/* Header */}
      <View style={styles.header}>
        <BlinkLed color={COLORS.cyan} size={6} />
        <Text style={styles.headerTitle}>TRANSCEIVER · ANALYTICS</Text>
        <Text style={styles.headerSub}>{today}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Sélecteur cart */}
        {carts.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {carts.map(c => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCart(c.id)}
                style={[styles.cartChip, cartId === c.id && styles.cartChipActive]}
              >
                <Text style={[styles.cartChipText, cartId === c.id && { color: COLORS.orange }]}>
                  {c.cartName || c.id}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'CMD_COUNT', val: todayOrd.length, color: COLORS.orange,   accent: true },
            { label: 'TOTAL_XOF', val: totalDay.toLocaleString('fr-FR'), unit: 'F', color: COLORS.cyan },
            { label: 'AVG_VALUE', val: avgBasket.toLocaleString('fr-FR'), unit: 'F', color: COLORS.amber },
          ].map(s => (
            <GlowBorder key={s.label} color={s.color} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <AnimatedNumber value={s.val} suffix={s.unit || ''} fontSize={18} color={s.color} />
            </GlowBorder>
          ))}
        </View>

        {/* Wave graph holographique */}
        <GlowBorder color={COLORS.cyan} style={styles.waveCard}>
          <View style={styles.waveHeader}>
            <Text style={styles.waveTitle}>ENTITÉ HOLOGRAPHIQUE · VENTES/HEURE</Text>
            <BlinkLed color={COLORS.cyan} size={5} />
          </View>
          <WaveGraph data={waveData} width={SCREEN_WIDTH - 64} height={90} color={COLORS.cyan} />
          <View style={styles.waveLabels}>
            {['8h','10h','12h','14h','16h','18h'].map(h => (
              <Text key={h} style={styles.waveLabel}>{h}</Text>
            ))}
          </View>
        </GlowBorder>

        {/* Égaliseur matriciel */}
        <GlowBorder color={COLORS.orange} style={styles.eqCard}>
          <Text style={styles.eqTitle}>MATRIX_EQ · TOUCHER POUR DÉTAILS</Text>
          {loading ? (
            <Text style={styles.loadingText}>LOADING_DATA...</Text>
          ) : (
            <View style={styles.eqContainer}>
              {displayOrders.slice(0, 20).map((o, i) => (
                <EqBar
                  key={o.id}
                  order={o}
                  index={i}
                  onPress={setSelectedOrder}
                  expanded={selectedOrder?.id === o.id}
                />
              ))}
            </View>
          )}
        </GlowBorder>

        {/* Ticket détail */}
        {selectedOrder && (
          <TicketDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderCyan,
    backgroundColor: COLORS.bgPanel,
  },
  headerTitle: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.cyan, letterSpacing: 2, flex: 1 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 8,  color: COLORS.textMuted },
  scroll:      { padding: 12, paddingBottom: 30 },

  cartChip:     { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.borderMuted, borderRadius: 3, marginRight: 6 },
  cartChipActive:{ borderColor: COLORS.orange },
  cartChipText: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.textSecondary },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, padding: 10, alignItems: 'center' },
  statLabel:{ fontFamily: FONT.mono, fontSize: 7, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4 },

  waveCard:   { padding: 10, marginBottom: 12 },
  waveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  waveTitle:  { fontFamily: FONT.mono, fontSize: 8, color: COLORS.cyan, letterSpacing: 1 },
  waveLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  waveLabel:  { fontFamily: FONT.mono, fontSize: 7, color: COLORS.textMuted },

  eqCard:      { padding: 10, marginBottom: 12 },
  eqTitle:     { fontFamily: FONT.mono, fontSize: 8, color: COLORS.orange, letterSpacing: 1, marginBottom: 10 },
  eqContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 3 },
  eqBarWrapper:{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  eqBar:       { width: '80%', borderRadius: 1, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  eqBarGlow:   { position: 'absolute', inset: 0, borderRadius: 2 },
  eqLabel:     { fontFamily: FONT.mono, fontSize: 6, marginTop: 3 },
  loadingText: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.textMuted, textAlign: 'center', padding: 20 },

  ticket:       { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderOrange, borderRadius: 8, padding: 14, marginBottom: 12 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketTitle:  { fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange, letterSpacing: 2 },
  ticketClose:  { fontFamily: FONT.mono, fontSize: 14, color: COLORS.textMuted, padding: 4 },
  ticketDivider:{ height: 1, backgroundColor: COLORS.borderOrange, opacity: 0.4, marginVertical: 8 },
  ticketMeta:   { fontFamily: FONT.mono, fontSize: 9, color: COLORS.textMuted, marginBottom: 10 },
  ticketItem:   { marginBottom: 6 },
  ticketItemName:{ fontFamily: FONT.mono, fontSize: 11, color: COLORS.textPrimary },
  ticketExtra:  { fontFamily: FONT.mono, fontSize: 9, color: COLORS.textMuted, paddingLeft: 16 },
  ticketTotal:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketTotalLabel: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.textMuted },
  ticketTotalVal:   { fontFamily: FONT.mono, fontSize: 16, color: COLORS.orange, fontWeight: 'bold' },
});

module.exports = VentesScreen;
