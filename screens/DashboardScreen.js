const React = require('react');
const { useState } = React;
const {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, RefreshControl,
} = require('react-native');

const GlowCard      = require('../components/GlowCard');
const LedIndicator  = require('../components/LedIndicator');
const StatBadge     = require('../components/StatBadge');
const HexBackground = require('../components/HexBackground');
const { useAllCarts, useCartOrders, useDashboardStats } = require('../hooks/useFirestore');
const { COLORS, FONT } = require('../constants');

/* ── Ligne commande récente ── */
const OrderRow = ({ order, index }) => {
  const items = JSON.parse(order.items || '[]');
  const label = items.map(i => `${i.quantity}× ${i.name}`).join(', ');
  return (
    <View style={[styles.orderRow, index > 0 && styles.orderRowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.orderMeta}>{order.cartId || '—'} · {order.time}</Text>
      </View>
      <Text style={styles.orderTotal}>{order.total}F</Text>
    </View>
  );
};

/* ── Cart status card ── */
const CartStatusCard = ({ cart }) => {
  const { orders } = useCartOrders(cart.id, 5);
  const todayTotal = orders.reduce((s, o) => s + (o.total || 0), 0);
  const isOnline   = cart.updatedAt
    ? (Date.now() / 1000 - cart.updatedAt.seconds) < 300
    : false;

  return (
    <GlowCard style={styles.cartCard}>
      <View style={styles.cartHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LedIndicator status={isOnline ? 'online' : 'offline'} />
          <Text style={styles.cartName}>{(cart.cartName || cart.id).toUpperCase()}</Text>
        </View>
        <Text style={styles.cartTotal}>{todayTotal.toLocaleString('fr-FR')} F</Text>
      </View>
      <Text style={styles.cartSub}>
        {orders.length} commande(s) · {isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
      </Text>
    </GlowCard>
  );
};

/* ── Écran principal ── */
const DashboardScreen = () => {
  const { carts, loading }  = useAllCarts();
  const stats               = useDashboardStats(carts);
  const [refreshing, setRefreshing] = useState(false);

  // Agréger les dernières commandes de tous les carts
  const { orders: recentOrders } = useCartOrders(
    carts.length > 0 ? carts[0].id : null, 10
  );

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).toUpperCase();

  return (
    <SafeAreaView style={styles.root}>
      <HexBackground opacity={0.04} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>NINJA'S CORP</Text>
          <Text style={styles.headerSub}>{today}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <LedIndicator status="online" size={8} />
          <Text style={styles.onlineText}>{carts.length} CART(S)</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={COLORS.orange} />
        }
      >
        {/* Stats globales */}
        <View style={styles.statsRow}>
          <StatBadge
            label="VENTES JOUR"
            value={stats.totalOrders}
            accent
          />
          <StatBadge
            label="TOTAL FCFA"
            value={stats.totalToday.toLocaleString('fr-FR')}
          />
          <StatBadge
            label="MOY. PANIER"
            value={stats.avgBasket.toLocaleString('fr-FR')}
            unit="F"
          />
        </View>

        {/* Statut des carts */}
        <Text style={styles.sectionTitle}>STATUT DES CARTS</Text>
        {loading
          ? <Text style={styles.emptyText}>Chargement...</Text>
          : carts.map(cart => <CartStatusCard key={cart.id} cart={cart} />)
        }
        {!loading && carts.length === 0 && (
          <Text style={styles.emptyText}>Aucun cart configuré</Text>
        )}

        {/* Dernières commandes */}
        <Text style={styles.sectionTitle}>FLUX EN TEMPS RÉEL</Text>
        <GlowCard>
          {recentOrders.length === 0
            ? <Text style={styles.emptyText}>Aucune commande aujourd'hui</Text>
            : recentOrders.map((o, i) => (
              <OrderRow key={o.id} order={o} index={i} />
            ))
          }
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
  headerSub:   { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade, marginTop: 2 },
  onlineText:  { fontFamily: FONT.mono, fontSize: 10, color: COLORS.online },
  scroll: { padding: 14, paddingBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  sectionTitle: {
    fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade,
    letterSpacing: 2, marginBottom: 8, marginTop: 4,
  },
  cartCard:   { marginBottom: 8 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cartName:   { fontFamily: FONT.mono, fontSize: 13, color: COLORS.textPrimary, letterSpacing: 1 },
  cartTotal:  { fontFamily: FONT.mono, fontSize: 14, color: COLORS.orange, fontWeight: 'bold' },
  cartSub:    { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.textSecondary },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  orderRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  orderLabel: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textPrimary },
  orderMeta:  { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade, marginTop: 2 },
  orderTotal: { fontFamily: FONT.mono, fontSize: 13, color: COLORS.orange, fontWeight: 'bold' },
  emptyText:  { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', padding: 16 },
});

module.exports = DashboardScreen;
