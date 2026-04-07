const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const {
  View, Text, StyleSheet, Animated,
  SafeAreaView, Easing,
} = require('react-native');
const { Led, Scan, Glitch, Num, Gauge, Card } = require('../components/Atoms');
const { useAllCarts, useDashboardStats } = require('../hooks/useFirestore');
const { C, F, W } = require('../constants');

/* ── Log système — interval 3s, pas 80ms ── */
const SysLog = memo(() => {
  const MSGS = [
    { msg: 'HEARTBEAT_OK',       type: 'ok'  },
    { msg: 'DATA_STREAM_ACTIVE', type: 'sys' },
    { msg: 'SYNC_PULSE',         type: 'sys' },
    { msg: 'ORDER_RECEIVED',     type: 'ok'  },
    { msg: 'CART_STATUS_CHECK',  type: 'sys' },
  ];
  const [logs, setLogs] = useState([
    { t: '00:00:00', msg: 'SYSTEM_BOOT_OK',     type: 'ok'  },
    { t: '00:00:01', msg: 'FIREBASE_CONNECTED', type: 'ok'  },
    { t: '00:00:02', msg: 'CARTS_SYNC_INIT',    type: 'sys' },
  ]);
  useEffect(() => {
    // 3000ms — safe, pas de surcharge bridge
    const iv = setInterval(() => {
      const now  = new Date().toLocaleTimeString('fr-FR');
      const pick = MSGS[Math.floor(Math.random() * MSGS.length)];
      setLogs(p => [{ t: now, ...pick }, ...p].slice(0, 10));
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  const col = { ok: C.cyan, sys: C.w60, warn: C.amber, err: C.red };
  return (
    <View style={st.logPanel}>
      <Text style={[st.label, { color: C.amber }]}>// SYS_LOG</Text>
      <View style={[st.hr, { borderColor: C.bOrange }]} />
      {logs.map((l, i) => (
        <View key={i} style={{ marginBottom: 4 }}>
          <Text style={[st.tiny, { color: C.w25 }]}>{l.t}</Text>
          <Text style={[st.tiny, { color: col[l.type] || C.w60 }]}>{l.msg}</Text>
        </View>
      ))}
    </View>
  );
});

/* ── Cadran rotatif — animation pure transform, safe ── */
const RotDial = memo(({ children, color = C.orange, size = 108 }) => {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const r  = size / 2;
  useEffect(() => {
    Animated.loop(Animated.timing(a1, {
      toValue: 1, duration: 20000, useNativeDriver: true, easing: Easing.linear,
    })).start();
    Animated.loop(Animated.timing(a2, {
      toValue: 1, duration: 12000, useNativeDriver: true, easing: Easing.linear,
    })).start();
  }, []);
  const rot1 = a1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rot2 = a2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: size, height: size, transform: [{ rotate: rot1 }] }}>
        {Array.from({ length: 8 }, (_, i) => {
          const ang = (i / 8) * 2 * Math.PI;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: r + (r - 5) * Math.cos(ang) - 3,
              top:  r + (r - 5) * Math.sin(ang) - 3,
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: color,
            }} />
          );
        })}
      </Animated.View>
      <Animated.View style={{ position: 'absolute', width: size * 0.7, height: size * 0.7, transform: [{ rotate: rot2 }] }}>
        {Array.from({ length: 6 }, (_, i) => {
          const ang = (i / 6) * 2 * Math.PI;
          const ri  = size * 0.35 - 4;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: size * 0.35 + ri * Math.cos(ang) - 2,
              top:  size * 0.35 + ri * Math.sin(ang) - 2,
              width: 4, height: 4, borderRadius: 2,
              backgroundColor: color + '88',
            }} />
          );
        })}
      </Animated.View>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
});

/* ── Panel stats droite — PAS de setInterval ── */
const StatsPanel = memo(({ stats, carts }) => {
  const online = carts.filter(c =>
    c.updatedAt && (Date.now() / 1000 - c.updatedAt.seconds) < 300
  ).length;
  return (
    <View style={st.rightPanel}>
      <Text style={[st.label, { color: C.cyan }]}>// ANALYTICS</Text>
      <View style={[st.hr, { borderColor: C.bCyan }]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
        <Gauge
          val={stats.totalOrders}
          max={Math.max(stats.totalOrders, 50)}
          size={68} color={C.orange} label="VENTES"
        />
        <Gauge
          val={online}
          max={Math.max(carts.length, 1)}
          size={68} color={C.cyan} label="ONLINE"
        />
      </View>
      {/* Barre sync statique — segments fixes, pas d'animation layout */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Led color={C.amber} size={5} />
          <Text style={[st.tiny, { color: C.amber, marginLeft: 5 }]}>FIRESTORE LIVE</Text>
        </View>
        <View style={{ flexDirection: 'row', height: 3, overflow: 'hidden', borderRadius: 2 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 3, backgroundColor: i < 18 ? C.amber : C.w08 }} />
          ))}
        </View>
      </View>
      {[
        { label: 'CARTS',      val: String(carts.length),                           color: C.white  },
        { label: 'TOTAL',      val: (stats.totalToday || 0).toLocaleString('fr-FR') + 'F', color: C.orange },
        { label: 'MOYENNE',    val: (stats.avgBasket  || 0).toLocaleString('fr-FR') + 'F', color: C.amber  },
        { label: 'PEAK',       val: '13:00',                                         color: C.cyan   },
      ].map(m => (
        <View key={m.label} style={st.metricRow}>
          <Text style={[st.tiny, { color: C.w25 }]}>{m.label}</Text>
          <Text style={[st.tiny, { color: m.color, fontWeight: 'bold' }]}>{m.val}</Text>
        </View>
      ))}
    </View>
  );
});

/* ── ÉCRAN PRINCIPAL ── */
const DashboardScreen = () => {
  const { carts } = useAllCarts();
  const raw       = useDashboardStats(carts);
  const stats     = {
    totalToday:  raw ? (raw.totalToday  || 0) : 0,
    totalOrders: raw ? (raw.totalOrders || 0) : 0,
    avgBasket:   raw ? (raw.avgBasket   || 0) : 0,
  };
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).toUpperCase();

  return (
    <SafeAreaView style={st.root}>
      <Scan color={C.orange} h={700} />
      <View style={st.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Led color={C.orange} size={7} />
          <Glitch text="NINJA'S CORP" style={[st.title, { marginLeft: 8 }]} />
          <Text style={[st.tiny, { color: C.w25, marginLeft: 10 }]}>COMMAND_CENTER</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[st.tiny, { color: C.amber, marginRight: 8 }]}>{today}</Text>
          <Led color={C.cyan} size={5} fast />
        </View>
      </View>
      <View style={st.body}>
        <SysLog />
        {/* Centre */}
        <View style={st.center}>
          <Text style={[st.tiny, { color: C.w25, letterSpacing: 2, marginBottom: 14 }]}>
            DEEP_SPACE_ORANGE · v3.0
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <RotDial color={C.orange} size={106}>
              <Text style={[st.tiny, { color: C.w25, textAlign: 'center' }]}>C.A. JOUR</Text>
              <Num val={(stats.totalToday || 0).toLocaleString('fr-FR')} size={16} color={C.orange} suf=" F" />
            </RotDial>
            <View style={{ width: 1, height: 60, backgroundColor: C.bOrange, marginHorizontal: 10 }} />
            <RotDial color={C.cyan} size={106}>
              <Text style={[st.tiny, { color: C.w25, textAlign: 'center' }]}>COMMANDES</Text>
              <Num val={String(stats.totalOrders || 0)} size={22} color={C.cyan} />
            </RotDial>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {carts.map(cart => {
              const on = cart.updatedAt && (Date.now() / 1000 - cart.updatedAt.seconds) < 300;
              return (
                <View key={cart.id} style={[st.pill, { borderColor: on ? C.cyan : C.red, marginRight: 6, marginBottom: 4 }]}>
                  <Led color={on ? C.cyan : C.red} size={5} />
                  <Text style={[st.tiny, { color: C.w60, marginLeft: 4 }]}>{cart.cartName || cart.id}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <StatsPanel stats={stats} carts={carts} />
      </View>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.bOrange, backgroundColor: C.bgPanel },
  title:     { fontFamily: F, fontSize: 13, color: C.orange, letterSpacing: 2 },
  body:      { flex: 1, flexDirection: 'row' },
  logPanel:  { width: W * 0.22, backgroundColor: C.bgPanel, borderRightWidth: 1, borderRightColor: C.bOrange, padding: 8 },
  label:     { fontFamily: F, fontSize: 9, letterSpacing: 1.5, marginBottom: 6 },
  hr:        { height: 1, borderBottomWidth: 1, marginBottom: 8, opacity: 0.5 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rightPanel:{ width: W * 0.26, backgroundColor: C.bgPanel, borderLeftWidth: 1, borderLeftColor: C.bCyan, padding: 8 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.w08 },
  tiny:      { fontFamily: F, fontSize: 8 },
  pill:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderRadius: 3 },
});

module.exports = DashboardScreen;
                    
