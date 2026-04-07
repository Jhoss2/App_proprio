const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const { View, Text, ScrollView, StyleSheet, Animated, SafeAreaView, Easing } = require('react-native');
const { Led, Scan, Glitch, Num, Gauge, Rain, Card } = require('../components/Atoms');
const { useAllCarts, useDashboardStats } = require('../hooks/useFirestore');
const { C, F, W } = require('../constants');

/* ── Log système ── */
const SysLog = memo(() => {
  const [logs, setLogs] = useState([
    { t: '00:00:00', msg: 'SYSTEM_BOOT_OK',     type: 'ok'  },
    { t: '00:00:01', msg: 'FIREBASE_CONNECTED', type: 'ok'  },
    { t: '00:00:02', msg: 'CARTS_SYNC_INIT',    type: 'sys' },
  ]);
  useEffect(() => {
    const msgs = [
      { msg: 'HEARTBEAT_OK',       type: 'ok'  },
      { msg: 'DATA_STREAM_ACTIVE', type: 'sys' },
      { msg: 'SYNC_PULSE',         type: 'sys' },
      { msg: 'ORDER_RECEIVED',     type: 'ok'  },
      { msg: 'CART_STATUS_CHECK',  type: 'sys' },
    ];
    const iv = setInterval(() => {
      const now  = new Date().toLocaleTimeString('fr-FR');
      const pick = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(p => [{ t: now, ...pick }, ...p].slice(0, 14));
    }, 2800);
    return () => clearInterval(iv);
  }, []);
  const col = { ok: C.cyan, sys: C.w60, warn: C.amber, err: C.red };
  return (
    <View style={st.logPanel}>
      <Text style={[st.panelTitle, { color: C.amber }]}>// SYS_LOG</Text>
      <View style={st.divider} />
      {logs.map((l, i) => (
        <View key={i} style={{ marginBottom: 5 }}>
          <Text style={[st.logTime]}>{l.t}</Text>
          <Text style={[st.logMsg, { color: col[l.type] || C.w60 }]}>{l.msg}</Text>
        </View>
      ))}
    </View>
  );
});

/* ── Cadran rotatif ── */
const RotDial = memo(({ children, color = C.orange, size = 110 }) => {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(a1, { toValue: 1, duration: 18000, useNativeDriver: true, easing: Easing.linear })).start();
    Animated.loop(Animated.timing(a2, { toValue: 1, duration: 10000, useNativeDriver: true, easing: Easing.linear })).start();
  }, []);
  const r1 = a1.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
  const r2 = a2.interpolate({ inputRange: [0,1], outputRange: ['360deg','0deg'] });
  const r  = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Anneau extérieur */}
      <Animated.View style={{ position: 'absolute', width: size, height: size, transform: [{ rotate: r1 }] }}>
        {Array.from({ length: 8 }, (_, i) => {
          const ang = (i / 8) * 2 * Math.PI;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: r + (r - 4) * Math.cos(ang) - 3,
              top:  r + (r - 4) * Math.sin(ang) - 3,
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: color,
            }} />
          );
        })}
      </Animated.View>
      {/* Anneau intérieur */}
      <Animated.View style={{ position: 'absolute', width: size * 0.72, height: size * 0.72, transform: [{ rotate: r2 }] }}>
        {Array.from({ length: 6 }, (_, i) => {
          const ang = (i / 6) * 2 * Math.PI;
          const ri  = size * 0.36 - 4;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: size * 0.36 + ri * Math.cos(ang) - 2,
              top:  size * 0.36 + ri * Math.sin(ang) - 2,
              width: 4, height: 4, borderRadius: 2,
              backgroundColor: `${color}88`,
            }} />
          );
        })}
      </Animated.View>
      {/* Contenu central */}
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
});

/* ── Panel stats droite ── */
const StatsPanel = memo(({ stats, carts }) => {
  const syncA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(syncA, { toValue: 1, duration: 3200, useNativeDriver: false })).start();
  }, []);
  const syncW = syncA.interpolate({ inputRange: [0,1], outputRange: ['65%','100%'] });
  const online = carts.filter(c => c.updatedAt && (Date.now()/1000 - c.updatedAt.seconds) < 300).length;

  return (
    <View style={st.rightPanel}>
      <Text style={[st.panelTitle, { color: C.cyan }]}>// ANALYTICS</Text>
      <View style={[st.divider, { borderColor: C.bCyan }]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
        <Gauge val={stats.totalOrders} max={Math.max(stats.totalOrders, 50)} size={70} color={C.orange} label="VENTES" />
        <Gauge val={online} max={Math.max(carts.length, 1)} size={70} color={C.cyan} label="ONLINE" />
      </View>
      {/* Sync bar */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <Led color={C.amber} size={5} />
          <Text style={[st.micro, { color: C.amber, marginLeft: 5 }]}>CLOUD_SYNC</Text>
        </View>
        <View style={[st.barBg, { height: 3 }]}>
          <Animated.View style={{ height: 3, width: syncW, backgroundColor: C.amber, borderRadius: 2 }} />
        </View>
        <Text style={[st.micro, { color: C.amberD, marginTop: 2 }]}>FIRESTORE ● LIVE</Text>
      </View>
      {/* Métriques */}
      {[
        { label: 'CARTS_TOTAL', val: String(carts.length),                          color: C.white  },
        { label: 'TOTAL_JOUR',  val: stats.totalToday.toLocaleString('fr-FR') + 'F', color: C.orange },
        { label: 'MOY_CMD',     val: stats.avgBasket.toLocaleString('fr-FR') + 'F',  color: C.amber  },
        { label: 'PEAK_HOUR',   val: '13:00',                                        color: C.cyan   },
      ].map(m => (
        <View key={m.label} style={st.metricRow}>
          <Text style={st.metricLabel}>{m.label}</Text>
          <Text style={[st.metricVal, { color: m.color }]}>{m.val}</Text>
        </View>
      ))}
    </View>
  );
});

/* ── ÉCRAN PRINCIPAL ── */
const DashboardScreen = () => {
  const { carts }  = useAllCarts();
  const stats      = useDashboardStats(carts);
  const today      = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <SafeAreaView style={st.root}>
      <Scan color={C.orange} h={800} />
      {/* Header */}
      <View style={st.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Led color={C.orange} size={7} />
          <Glitch text="NINJA'S CORP" style={[st.headerTitle, { marginLeft: 8 }]} />
          <Text style={[st.micro, { marginLeft: 10, color: C.w25 }]}>COMMAND_CENTER</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[st.micro, { color: C.amber, marginRight: 8 }]}>{today}</Text>
          <Led color={C.cyan} size={5} fast />
        </View>
      </View>
      {/* Corps 3 colonnes */}
      <View style={st.body}>
        <SysLog />
        {/* Centre */}
        <View style={st.center}>
          <Rain width={W * 0.38} n={10} />
          <Text style={st.centerSub}>DEEP_SPACE_ORANGE · v2.0</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <RotDial color={C.orange} size={108}>
              <Text style={[st.micro, { color: C.w25, textAlign: 'center' }]}>C.A. JOUR</Text>
              <Num val={stats.totalToday.toLocaleString('fr-FR')} size={17} color={C.orange} suf=" F" />
            </RotDial>
            <View style={{ width: 1, height: 70, backgroundColor: C.bOrange, marginHorizontal: 12 }} />
            <RotDial color={C.cyan} size={108}>
              <Text style={[st.micro, { color: C.w25, textAlign: 'center' }]}>COMMANDES</Text>
              <Num val={String(stats.totalOrders)} size={22} color={C.cyan} />
            </RotDial>
          </View>
          {/* Carts status */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {carts.map(cart => {
              const on = cart.updatedAt && (Date.now()/1000 - cart.updatedAt.seconds) < 300;
              return (
                <View key={cart.id} style={[st.cartPill, { borderColor: on ? C.cyan : C.red, marginRight: 6, marginBottom: 6 }]}>
                  <Led color={on ? C.cyan : C.red} size={5} />
                  <Text style={[st.micro, { color: C.w60, marginLeft: 4 }]}>{cart.cartName || cart.id}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Text style={[st.micro, { color: C.w25 }]}>MOY/CMD</Text>
            <Num val={stats.avgBasket.toLocaleString('fr-FR')} size={13} color={C.amber} suf=" F" />
          </View>
        </View>
        <StatsPanel stats={stats} carts={carts} />
      </View>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.bOrange, backgroundColor: C.bgPanel },
  headerTitle: { fontFamily: F, fontSize: 13, color: C.orange, letterSpacing: 2 },
  body:        { flex: 1, flexDirection: 'row' },
  logPanel:    { width: W * 0.22, backgroundColor: C.bgPanel, borderRightWidth: 1, borderRightColor: C.bOrange, padding: 8 },
  panelTitle:  { fontFamily: F, fontSize: 9, letterSpacing: 1.5, marginBottom: 6 },
  divider:     { height: 1, borderBottomWidth: 1, borderColor: C.bOrange, marginBottom: 8, opacity: 0.6 },
  logTime:     { fontFamily: F, fontSize: 7, color: C.w25 },
  logMsg:      { fontFamily: F, fontSize: 8, letterSpacing: 0.4 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  centerSub:   { fontFamily: F, fontSize: 8, color: C.w25, letterSpacing: 2, marginBottom: 16 },
  rightPanel:  { width: W * 0.26, backgroundColor: C.bgPanel, borderLeftWidth: 1, borderLeftColor: C.bCyan, padding: 8 },
  cartPill:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderRadius: 4 },
  metricRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.w08 },
  metricLabel: { fontFamily: F, fontSize: 8, color: C.w25 },
  metricVal:   { fontFamily: F, fontSize: 9, fontWeight: 'bold' },
  micro:       { fontFamily: F, fontSize: 8 },
  barBg:       { backgroundColor: C.w08, borderRadius: 2, overflow: 'hidden', width: '100%' },
});

module.exports = DashboardScreen;
        
