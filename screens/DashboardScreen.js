const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const {
  View, Text, ScrollView, StyleSheet, Animated,
  SafeAreaView, Pressable, Easing, Vibration,
} = require('react-native');

const {
  GlowBorder, BlinkLed, AnimatedNumber,
  BinaryRain, CircularGauge, GlitchText, ScanLine,
} = require('../components/Animations');
const { useAllCarts, useCartOrders, useDashboardStats } = require('../hooks/useFirestore');
const { COLORS, FONT, SCREEN_WIDTH } = require('../constants');

/* ── Colonne log système ── */
const SystemLog = memo(({ carts }) => {
  const [logs, setLogs] = useState([
    { t: '22:47:01', msg: 'SYSTEM_BOOT_OK',         type: 'ok'  },
    { t: '22:47:02', msg: 'FIRESTORE_CONNECTED',     type: 'ok'  },
    { t: '22:47:03', msg: 'CARTS_SYNC_INIT',         type: 'sys' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('fr-FR');
      const msgs = [
        { msg: 'HEARTBEAT_OK',       type: 'ok'  },
        { msg: 'DATA_STREAM_ACTIVE', type: 'sys' },
        { msg: 'SYNC_PULSE',         type: 'sys' },
        { msg: 'CARTS_STATUS_CHECK', type: 'ok'  },
      ];
      const pick = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [{ t: now, ...pick }, ...prev].slice(0, 12));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.logPanel}>
      <Text style={styles.panelTitle}>// SYS_LOG</Text>
      <View style={styles.logDivider} />
      {logs.map((l, i) => (
        <View key={i} style={styles.logRow}>
          <Text style={styles.logTime}>{l.t}</Text>
          <Text style={[
            styles.logMsg,
            l.type === 'ok'   && { color: COLORS.cyan },
            l.type === 'warn' && { color: COLORS.amber },
            l.type === 'err'  && { color: COLORS.red },
          ]}>{l.msg}</Text>
        </View>
      ))}
    </View>
  );
});

/* ── Cadran central avec binary rain ── */
const CommandCenter = memo(({ stats, carts }) => {
  const rotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotAnim, { toValue: 1, duration: 20000, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  const rotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateRev = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <View style={styles.centerPanel}>
      <BinaryRain width={SCREEN_WIDTH * 0.38} count={10} />

      {/* Titre */}
      <GlitchText
        text="NINJA'S CORP"
        style={styles.centerTitle}
      />
      <Text style={styles.centerSub}>COMMAND_CENTER_v2.0</Text>

      {/* Cadrans rotatifs */}
      <View style={styles.gaugesRow}>
        {/* Cadran CA */}
        <View style={styles.gaugeWrapper}>
          <Animated.View style={[styles.ringOuter, { transform: [{ rotate }] }]}>
            {[0,1,2,3,4,5,6,7].map(i => (
              <View key={i} style={[styles.ringDot, {
                transform: [
                  { rotate: `${i * 45}deg` },
                  { translateY: -44 },
                ],
              }]} />
            ))}
          </Animated.View>
          <Animated.View style={[styles.ringInner, { transform: [{ rotate: rotateRev }] }]}>
            {[0,1,2,3,4,5].map(i => (
              <View key={i} style={[styles.ringDotSmall, {
                transform: [
                  { rotate: `${i * 60}deg` },
                  { translateY: -30 },
                ],
              }]} />
            ))}
          </Animated.View>
          <View style={styles.gaugeCenter}>
            <Text style={styles.gaugeLabelTop}>CHIFFRE D'AFFAIRES</Text>
            <AnimatedNumber
              value={stats.totalToday.toLocaleString('fr-FR')}
              fontSize={20}
              color={COLORS.orange}
              suffix=" F"
            />
            <Text style={styles.gaugeLabelBot}>AUJOURD'HUI</Text>
          </View>
        </View>

        {/* Séparateur */}
        <View style={styles.centerSep} />

        {/* Cadran commandes */}
        <View style={styles.gaugeWrapper}>
          <Animated.View style={[styles.ringOuter, styles.ringOuterCyan, { transform: [{ rotate: rotateRev }] }]}>
            {[0,1,2,3,4,5,6,7].map(i => (
              <View key={i} style={[styles.ringDotCyan, {
                transform: [{ rotate: `${i * 45}deg` }, { translateY: -44 }],
              }]} />
            ))}
          </Animated.View>
          <View style={styles.gaugeCenter}>
            <Text style={styles.gaugeLabelTop}>COMMANDES</Text>
            <AnimatedNumber value={stats.totalOrders} fontSize={24} color={COLORS.cyan} />
            <Text style={[styles.gaugeLabelBot, { color: COLORS.cyanDim }]}>TOTAL JOUR</Text>
          </View>
        </View>
      </View>

      {/* Statuts carts en bas */}
      <View style={styles.cartStatusRow}>
        {carts.map(cart => {
          const isOnline = cart.updatedAt
            ? (Date.now() / 1000 - cart.updatedAt.seconds) < 300
            : false;
          return (
            <View key={cart.id} style={styles.cartPill}>
              <BlinkLed color={isOnline ? COLORS.cyan : COLORS.red} size={5} />
              <Text style={styles.cartPillText}>{cart.cartName || cart.id}</Text>
            </View>
          );
        })}
      </View>

      {/* Panier moyen */}
      <View style={styles.avgRow}>
        <Text style={styles.avgLabel}>MOY/CMD</Text>
        <AnimatedNumber value={stats.avgBasket.toLocaleString('fr-FR')} fontSize={14} color={COLORS.amber} suffix=" F" />
      </View>
    </View>
  );
});

/* ── Panel stats droite ── */
const StatsPanel = memo(({ stats, carts }) => {
  const syncAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(syncAnim, { toValue: 1, duration: 3000, useNativeDriver: false })
    ).start();
  }, []);

  const syncPct = syncAnim.interpolate({ inputRange: [0, 1], outputRange: [70, 100] });

  return (
    <View style={styles.rightPanel}>
      <Text style={styles.panelTitle}>// ANALYTICS</Text>
      <View style={styles.logDivider} />

      {/* Jauges circulaires */}
      <View style={styles.circlesRow}>
        <View style={styles.circleItem}>
          <CircularGauge
            value={stats.totalOrders}
            max={Math.max(stats.totalOrders, 50)}
            size={72}
            color={COLORS.orange}
            label="VENTES"
          />
        </View>
        <View style={styles.circleItem}>
          <CircularGauge
            value={carts.filter(c => c.updatedAt && (Date.now()/1000 - c.updatedAt.seconds) < 300).length}
            max={Math.max(carts.length, 1)}
            size={72}
            color={COLORS.cyan}
            label="ONLINE"
          />
        </View>
      </View>

      {/* Sync cloud */}
      <View style={styles.syncBlock}>
        <View style={styles.syncHeader}>
          <BlinkLed color={COLORS.amber} size={5} />
          <Text style={styles.syncLabel}>CLOUD_SYNC</Text>
        </View>
        <View style={styles.syncBarBg}>
          <Animated.View style={[styles.syncBarFill, {
            width: syncAnim.interpolate({ inputRange: [0,1], outputRange: ['70%','100%'] }),
          }]} />
        </View>
        <Text style={styles.syncPct}>FIRESTORE ● LIVE</Text>
      </View>

      {/* Métriques texte */}
      <View style={styles.metricsBlock}>
        {[
          { label: 'CARTS_TOTAL',  val: carts.length,                    color: COLORS.textPrimary },
          { label: 'BEST_SELLER',  val: 'FRITES XL',                     color: COLORS.orange      },
          { label: 'PEAK_HOUR',    val: '13:00',                          color: COLORS.cyan        },
          { label: 'AVG_BASKET',   val: `${stats.avgBasket.toLocaleString('fr-FR')}F`, color: COLORS.amber },
        ].map(m => (
          <View key={m.label} style={styles.metricRow}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={[styles.metricVal, { color: m.color }]}>{m.val}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

/* ── ÉCRAN PRINCIPAL ── */
const DashboardScreen = () => {
  const { carts }  = useAllCarts();
  const stats      = useDashboardStats(carts);

  return (
    <SafeAreaView style={styles.root}>
      <ScanLine color={COLORS.orange} containerHeight={SCREEN_HEIGHT} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BlinkLed color={COLORS.orange} size={6} />
          <Text style={styles.headerTitle}>DEEP_SPACE_ORANGE</Text>
          <Text style={styles.headerSub}>NINJA'S CORP · COMMAND INTERFACE</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.clockText}>{new Date().toLocaleTimeString('fr-FR')}</Text>
          <BlinkLed color={COLORS.cyan} size={5} fast />
        </View>
      </View>

      {/* Corps en 3 colonnes */}
      <View style={styles.body}>
        <SystemLog carts={carts} />
        <CommandCenter stats={stats} carts={carts} />
        <StatsPanel stats={stats} carts={carts} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderOrange,
    backgroundColor: COLORS.bgPanel,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.orange, letterSpacing: 2 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 8,  color: COLORS.textMuted, marginLeft: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clockText:   { fontFamily: FONT.mono, fontSize: 11, color: COLORS.amber },

  body: { flex: 1, flexDirection: 'row' },

  // LOG
  logPanel:   { width: SCREEN_WIDTH * 0.22, backgroundColor: COLORS.bgPanel, borderRightWidth: 1, borderRightColor: COLORS.borderOrange, padding: 8 },
  panelTitle: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.amber, letterSpacing: 1.5, marginBottom: 6 },
  logDivider: { height: 1, backgroundColor: COLORS.borderOrange, marginBottom: 8, opacity: 0.5 },
  logRow:     { marginBottom: 5 },
  logTime:    { fontFamily: FONT.mono, fontSize: 7, color: COLORS.textMuted },
  logMsg:     { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textSecondary, letterSpacing: 0.5 },

  // CENTER
  centerPanel: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg, overflow: 'hidden', position: 'relative',
  },
  centerTitle: { fontFamily: FONT.mono, fontSize: 14, color: COLORS.orange, letterSpacing: 4, fontWeight: 'bold' },
  centerSub:   { fontFamily: FONT.mono, fontSize: 8,  color: COLORS.textMuted, letterSpacing: 2, marginBottom: 16 },

  gaugesRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gaugeWrapper: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  gaugeCenter:  { position: 'absolute', alignItems: 'center' },
  gaugeLabelTop:{ fontFamily: FONT.mono, fontSize: 7, color: COLORS.textMuted, letterSpacing: 1, textAlign: 'center' },
  gaugeLabelBot:{ fontFamily: FONT.mono, fontSize: 7, color: COLORS.orangeDim, textAlign: 'center' },

  ringOuter: { position: 'absolute', width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', width: 70,  height: 70,  alignItems: 'center', justifyContent: 'center' },
  ringOuterCyan: {},
  ringDot:      { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.orange },
  ringDotSmall: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.orangeDim },
  ringDotCyan:  { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.cyan },
  centerSep:    { width: 1, height: 80, backgroundColor: COLORS.borderOrange, opacity: 0.4 },

  cartStatusRow: { flexDirection: 'row', gap: 6, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  cartPill:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.borderOrange, borderRadius: 4 },
  cartPillText:  { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textSecondary },

  avgRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  avgLabel: { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted },

  // RIGHT
  rightPanel: { width: SCREEN_WIDTH * 0.26, backgroundColor: COLORS.bgPanel, borderLeftWidth: 1, borderLeftColor: COLORS.borderCyan, padding: 8 },
  circlesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  circleItem: { alignItems: 'center' },

  syncBlock:  { marginBottom: 12 },
  syncHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  syncLabel:  { fontFamily: FONT.mono, fontSize: 8, color: COLORS.amber },
  syncBarBg:  { height: 3, backgroundColor: COLORS.borderMuted, borderRadius: 2, overflow: 'hidden' },
  syncBarFill:{ height: '100%', backgroundColor: COLORS.amber, borderRadius: 2 },
  syncPct:    { fontFamily: FONT.mono, fontSize: 7, color: COLORS.amberDim, marginTop: 3 },

  metricsBlock: {},
  metricRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: COLORS.borderMuted },
  metricLabel:  { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted },
  metricVal:    { fontFamily: FONT.mono, fontSize: 9, fontWeight: 'bold' },
});

module.exports = DashboardScreen;
                           
