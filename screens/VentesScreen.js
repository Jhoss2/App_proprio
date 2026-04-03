const React = require('react');
const { useState } = React;
const {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Pressable,
} = require('react-native');

const GlowCard      = require('../components/GlowCard');
const StatBadge     = require('../components/StatBadge');
const HexBackground = require('../components/HexBackground');
const { useAllCarts, useCartOrders } = require('../hooks/useFirestore');
const { COLORS, FONT } = require('../constants');

/* ── Mini bar chart ── */
const MiniChart = ({ orders }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const hourly = Array(8).fill(0);

  orders
    .filter(o => o.date === today)
    .forEach(o => {
      if (o.time) {
        const hour = parseInt(o.time.split(':')[0]);
        const slot = Math.floor((hour - 8) / 2);
        if (slot >= 0 && slot < 8) hourly[slot] += o.total || 0;
      }
    });

  const max = Math.max(...hourly, 1);
  const labels = ['8h','10h','12h','14h','16h','18h','20h','22h'];

  return (
    <GlowCard>
      <Text style={styles.sectionTitle}>VENTES PAR TRANCHE (FCFA)</Text>
      <View style={styles.chartContainer}>
        {hourly.map((v, i) => (
          <View key={i} style={styles.barWrapper}>
            <View style={[styles.bar, { height: `${Math.round((v / max) * 100)}%` }]} />
            <Text style={styles.barLabel}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </GlowCard>
  );
};

/* ── Ligne commande détaillée ── */
const OrderDetail = ({ order, index }) => {
  const [expanded, setExpanded] = useState(false);
  const items = JSON.parse(order.items || '[]');

  return (
    <Pressable onPress={() => setExpanded(v => !v)}>
      <View style={[styles.orderRow, index > 0 && styles.borderTop]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.orderId}>#{order.id?.toString().slice(-4) || '????'}</Text>
            <Text style={styles.orderTotal}>{order.total?.toLocaleString('fr-FR')} F</Text>
          </View>
          <Text style={styles.orderMeta}>{order.date} · {order.time} · {order.cartId || '—'}</Text>
          {expanded && (
            <View style={styles.expandedBlock}>
              {items.map((it, i) => {
                const extras = JSON.parse(it.extras || '{}');
                return (
                  <View key={i} style={{ marginTop: 4 }}>
                    <Text style={styles.itemLine}>
                      <Text style={{ color: COLORS.orange }}>{it.quantity}×</Text> {it.name}
                    </Text>
                    {(extras.sauces || []).length > 0 && (
                      <Text style={styles.extrasLine}>
                        Sauces : {extras.sauces.map(s => s.name).join(', ')}
                      </Text>
                    )}
                    {(extras.garnitures || []).length > 0 && (
                      <Text style={styles.extrasLine}>
                        Garnitures : {extras.garnitures.map(g => `${g.name}(+${g.price}F)`).join(', ')}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </View>
    </Pressable>
  );
};

/* ── Écran principal ── */
const VentesScreen = () => {
  const { carts }    = useAllCarts();
  const [selectedCart, setSelectedCart] = useState(null);
  const cartId = selectedCart || (carts[0]?.id);
  const { orders, loading } = useCartOrders(cartId, 100);

  const today      = new Date().toLocaleDateString('fr-FR');
  const todayOrd   = orders.filter(o => o.date === today);
  const todayTotal = todayOrd.reduce((s, o) => s + (o.total || 0), 0);
  const avg        = todayOrd.length > 0 ? Math.round(todayTotal / todayOrd.length) : 0;

  return (
    <SafeAreaView style={styles.root}>
      <HexBackground opacity={0.04} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>ANALYTICS</Text>
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
                style={[styles.cartPill, cartId === c.id && styles.cartPillActive]}
              >
                <Text style={[styles.cartPillText, cartId === c.id && styles.cartPillTextActive]}>
                  {c.cartName || c.id}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Stats du jour */}
        <View style={styles.statsRow}>
          <StatBadge label="COMMANDES" value={todayOrd.length} accent />
          <StatBadge label="TOTAL" value={todayTotal.toLocaleString('fr-FR')} unit="F" />
          <StatBadge label="MOY." value={avg.toLocaleString('fr-FR')} unit="F" />
        </View>

        {/* Graphique */}
        <MiniChart orders={orders} />

        {/* Historique */}
        <Text style={styles.sectionTitle}>HISTORIQUE COMPLET</Text>
        <GlowCard>
          {loading && <Text style={styles.emptyText}>Chargement...</Text>}
          {!loading && orders.length === 0 && (
            <Text style={styles.emptyText}>Aucune commande</Text>
          )}
          {orders.map((o, i) => (
            <OrderDetail key={o.id} order={o} index={i} />
          ))}
        </GlowCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontFamily: FONT.mono, fontSize: 16, color: COLORS.orange, letterSpacing: 2 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade },
  scroll: { padding: 14, paddingBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sectionTitle: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade, letterSpacing: 2, marginBottom: 8 },

  cartPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
    marginRight: 8, backgroundColor: 'transparent',
  },
  cartPillActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orangeGlow },
  cartPillText:   { fontFamily: FONT.mono, fontSize: 10, color: COLORS.textSecondary },
  cartPillTextActive: { color: COLORS.orange },

  chartContainer: { flexDirection: 'row', height: 80, alignItems: 'flex-end', gap: 4, marginTop: 4 },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '80%', backgroundColor: COLORS.orangeDim, borderTopWidth: 1, borderTopColor: COLORS.orange, borderRadius: 2 },
  barLabel: { fontFamily: FONT.mono, fontSize: 7, color: COLORS.orangeFade, marginTop: 3 },

  orderRow: { paddingVertical: 10, flexDirection: 'row', alignItems: 'flex-start' },
  borderTop: { borderTopWidth: 1, borderTopColor: COLORS.border },
  orderId:   { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textPrimary },
  orderTotal: { fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange, fontWeight: 'bold' },
  orderMeta:  { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade, marginTop: 2 },
  expandIcon: { fontFamily: FONT.mono, fontSize: 8, color: COLORS.orangeFade, marginLeft: 8, marginTop: 2 },
  expandedBlock: { marginTop: 6, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  itemLine:   { fontFamily: FONT.mono, fontSize: 10, color: COLORS.textPrimary },
  extrasLine: { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.textSecondary },
  emptyText:  { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', padding: 16 },
});

module.exports = VentesScreen;
