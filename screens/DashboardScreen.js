/**
 * DashboardScreen — ASSEMBLAGE FINAL
 * Layout identique à la maquette pixel pour pixel
 * Orientation paysage (landscape) recommandée
 */
const React = require('react');
const { memo } = React;
const { View, StyleSheet, SafeAreaView, Dimensions } = require('react-native');

const GalaxyBg      = require('../components/GalaxyBg');
const TopBar        = require('../components/TopBar');
const SysLog        = require('../components/SysLog');
const MainGauge     = require('../components/MainGauge');
const NavButtons    = require('../components/NavButtons');
const CartProfiles  = require('../components/CartProfiles');
const BottomBands   = require('../components/BottomBands');

const { useAllCarts, useDashboardStats } = require('../hooks/useFirestore');

const { width: W, height: H } = Dimensions.get('window');

/* ── Cadre métal biseauté réutilisable ── */
const MetalFrame = memo(({ children, style, borderColor = '#1a3a5a', bg = '#050e1a' }) => (
  <View style={[s.metalFrame, { borderColor, backgroundColor: bg }, style]}>
    {/* Coins biseautés */}
    <View style={[s.cornerTL, { borderColor }]} />
    <View style={[s.cornerTR, { borderColor }]} />
    <View style={[s.cornerBL, { borderColor }]} />
    <View style={[s.cornerBR, { borderColor }]} />
    {children}
  </View>
));

const DashboardScreen = () => {
  const { carts }  = useAllCarts();
  const raw        = useDashboardStats(carts);
  const stats      = {
    totalToday:    raw ? (raw.totalToday    || 0) : 0,
    totalOrders:   raw ? (raw.totalOrders   || 0) : 0,
    avgBasket:     raw ? (raw.avgBasket     || 0) : 0,
  };

  // Calcul des % par cart (CA vs quota journalier défini)
  const DAILY_QUOTA_CA  = 50000; // FCFA — à configurer
  const DAILY_QUOTA_CMD = 30;    // commandes — à configurer

  const cartData = carts.map((c, i) => ({
    id:     c.id,
    name:   (c.cartName || c.id).toUpperCase(),
    caPct:  Math.min(Math.round(((c.todayTotal  || 0) / DAILY_QUOTA_CA)  * 100), 100),
    cmdPct: Math.min(Math.round(((c.todayOrders || 0) / DAILY_QUOTA_CMD) * 100), 100),
    status: c.updatedAt && (Date.now()/1000 - c.updatedAt.seconds) < 300 ? 'online' : 'offline',
    index:  i,
    imageUri: c.cartImageUrl || null,
  }));

  // % mensuel global
  const caMonthPct  = Math.min(Math.round((stats.totalToday / (DAILY_QUOTA_CA * 30)) * 100), 100) || 75;
  const cmdMonthPct = Math.min(Math.round((stats.totalOrders / (DAILY_QUOTA_CMD * 30)) * 100), 100) || 60;

  return (
    <SafeAreaView style={s.root}>
      {/* ── Fond galaxie ── */}
      <GalaxyBg />

      {/* ── Zone principale ── */}
      <View style={s.main}>

        {/* ── TOP BAR ── */}
        <MetalFrame style={s.topBarFrame} borderColor="#2a4a6a">
          <TopBar
            cartCount={carts.length || 3}
            annualPct={100}
            logoUri={null}
          />
        </MetalFrame>

        {/* ── CORPS CENTRAL (3 colonnes) ── */}
        <View style={s.body}>

          {/* COLONNE GAUCHE — SYS.LOG */}
          <MetalFrame style={s.leftCol} borderColor="#00ffff44">
            <SysLog />
          </MetalFrame>

          {/* COLONNE CENTRE — Jauge + NavButtons */}
          <MetalFrame style={s.centerCol} borderColor="#1a3a5a">
            <View style={s.centerContent}>
              <MainGauge
                caMonthPct={caMonthPct}
                cmdMonthPct={cmdMonthPct}
                logoUri={null}
              />
              <NavButtons
                onRewards={() => {}}
                onLumi={() => {}}
                onStocks={() => {}}
              />
            </View>
          </MetalFrame>

          {/* COLONNE DROITE — Carts 3D */}
          <MetalFrame style={s.rightCol} borderColor="#00aaff33">
            <CartProfiles
              carts={cartData}
              onCartPress={(cart) => {}}
            />
          </MetalFrame>

        </View>

        {/* ── BANDES INFÉRIEURES ── */}
        <MetalFrame style={s.bottomFrame} borderColor="#1a3a5a" bg="#030c18">
          <BottomBands carts={cartData} />
        </MetalFrame>

      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020810' },
  main: { flex: 1 },

  topBarFrame: { height: 76, marginHorizontal: 4, marginTop: 2 },

  body: { flex: 1, flexDirection: 'row', marginHorizontal: 4, marginTop: 4 },

  leftCol:   { width: W * 0.18, marginRight: 4 },
  centerCol: { flex: 1, marginRight: 4 },
  rightCol:  { width: W * 0.14 },

  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },

  bottomFrame: { height: 175, marginHorizontal: 4, marginTop: 4, marginBottom: 2 },

  // Cadre métal biseauté
  metalFrame: { borderWidth: 1, position: 'relative', overflow: 'hidden' },
  cornerTL:   { position: 'absolute', top: -1, left: -1, width: 12, height: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR:   { position: 'absolute', top: -1, right: -1, width: 12, height: 12, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL:   { position: 'absolute', bottom: -1, left: -1, width: 12, height: 12, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR:   { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderBottomWidth: 2, borderRightWidth: 2 },
});

module.exports = DashboardScreen;
