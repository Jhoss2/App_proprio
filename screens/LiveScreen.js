const React = require('react');
const { useState, useEffect, useRef, useCallback, memo } = React;
const { View, Text, Pressable, StyleSheet, Animated, SafeAreaView, Modal, Easing } = require('react-native');
const { Led, Scan, Glitch, Card } = require('../components/Atoms');
const { useAllCarts } = require('../hooks/useFirestore');
const { C, F, W, H } = require('../constants');

/* ── CRT overlay (lignes horizontales fixes) ── */
const CRT = memo(() => (
  <View style={StyleSheet.absoluteFill}>
    {Array.from({ length: 30 }, (_, i) => (
      <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * (H / 30), height: 1, backgroundColor: '#000', opacity: 0.07 }} />
    ))}
  </View>
));

/* ── Réticule de ciblage ── */
const Reticle = memo(({ color = C.orange, alert = false }) => {
  const spin = useRef(new Animated.Value(0)).current;
  const ab   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, useNativeDriver: true, easing: Easing.linear })).start();
  }, []);
  useEffect(() => {
    if (alert) {
      Animated.loop(Animated.sequence([
        Animated.timing(ab, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(ab, { toValue: 0, duration: 180, useNativeDriver: true }),
      ])).start();
    } else { ab.stopAnimation(); ab.setValue(0); }
  }, [alert]);
  const rot  = spin.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
  const alOp = ab.interpolate({ inputRange: [0,1], outputRange: [0, 0.18] });
  const c14  = 14;
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Coins */}
      {[
        { top: 8,    left: 8,    borderTopWidth: 2,    borderLeftWidth: 2    },
        { top: 8,    right: 8,   borderTopWidth: 2,    borderRightWidth: 2   },
        { bottom: 8, left: 8,    borderBottomWidth: 2, borderLeftWidth: 2    },
        { bottom: 8, right: 8,   borderBottomWidth: 2, borderRightWidth: 2   },
      ].map((p, i) => (
        <View key={i} style={[{ position: 'absolute', width: c14, height: c14, borderColor: alert ? C.red : color }, p]} />
      ))}
      {/* Croix */}
      <View style={{ position: 'absolute', top: '50%', left: '12%', right: '12%', height: 1, backgroundColor: color, opacity: 0.25 }} />
      <View style={{ position: 'absolute', left: '50%', top: '12%', bottom: '12%', width: 1, backgroundColor: color, opacity: 0.25 }} />
      {/* Anneau rotatif */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: `${color}60`, transform: [{ rotate: rot }] }} />
      </View>
      {/* Flash alerte */}
      {alert && <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.red, opacity: alOp }]} />}
    </View>
  );
});

/* ── Télémétrie ── */
const Tele = memo(({ cart, connected }) => {
  const rows = [
    { label: 'CART_ID',  val: cart?.id || '---',                    color: C.orange },
    { label: 'STATUS',   val: connected ? 'LIVE_P2P' : 'OFFLINE',  color: connected ? C.cyan : C.red },
    { label: 'PROTOCOL', val: 'WebRTC',                             color: C.w25   },
    { label: 'FPS',      val: connected ? '24' : '0',               color: C.cyan  },
    { label: 'LATENCY',  val: connected ? '<200ms' : 'N/A',         color: C.amber },
  ];
  return (
    <View style={st.tele}>
      {rows.map(r => (
        <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
          <Text style={[st.micro, { color: C.w25 }]}>{r.label}</Text>
          <Text style={[st.micro, { color: r.color, fontWeight: 'bold' }]}>{r.val}</Text>
        </View>
      ))}
    </View>
  );
});

/* ── Feed d'une caméra ── */
const Feed = memo(({ cart }) => {
  const [connected, setConnected]   = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [motionAlert, setMotion]    = useState(false);

  const connect = () => {
    // Placeholder — WebRTC sera intégré en phase 2
    setConnecting(false);
  };
  const disconnect = () => { setConnected(false); };

  return (
    <Card color={motionAlert ? C.red : connected ? C.cyan : C.bOrange} style={st.feedCard}>
      {/* Zone vidéo */}
      <View style={st.feedArea}>
        <View style={st.feedPlaceholder}>
          {connected
            ? <><Led color={C.red} size={6} fast /><Text style={[st.micro, { color: C.red, marginLeft: 6 }]}>● P2P LIVE</Text></>
            : <Text style={[st.micro, { color: C.w25 }]}>{connecting ? 'LINK_INIT...' : 'FLUX_INACTIF'}</Text>
          }
        </View>
        <Reticle color={connected ? C.cyan : C.orange} alert={motionAlert} />
        <CRT />
        <Scan color={connected ? C.cyan : C.orange} h={120} />
        {motionAlert && (
          <View style={st.motionBanner}>
            <Text style={[st.micro, { color: C.red }]}>⚠ MOTION_DETECT_LOCK</Text>
          </View>
        )}
      </View>
      <Tele cart={cart} connected={connected} />
      {/* Contrôles */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: C.w08 }}>
        <Text style={[st.micro, { color: C.orange }]}>{(cart.cartName || cart.id).toUpperCase()}</Text>
        <Pressable
          onPress={connected ? disconnect : connect}
          style={[st.ctrlBtn, { borderColor: connected ? C.red : C.cyan }]}
        >
          <Text style={[st.micro, { color: connected ? C.red : C.cyan }]}>
            {connecting ? '⟳ LINK' : connected ? '■ CUT' : '▶ LINK'}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
});

const LiveScreen = () => {
  const { carts } = useAllCarts();
  return (
    <SafeAreaView style={st.root}>
      <Scan color={C.orange} h={H} />
      <View style={st.header}>
        <Led color={C.red} size={6} fast />
        <Glitch text="SURVEILLANCE · HUD TACTIQUE" style={[st.headerTitle, { marginLeft: 8 }]} />
        <Text style={[st.micro, { color: C.w25, marginLeft: 8 }]}>WebRTC P2P · {carts.length} CART(S)</Text>
      </View>
      <View style={st.grid}>
        {carts.length === 0
          ? <Text style={[st.micro, { color: C.w25, alignSelf: 'center', marginTop: 40 }]}>NO_SIGNAL</Text>
          : carts.map(c => <Feed key={c.id} cart={c} />)
        }
      </View>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.bOrange, backgroundColor: C.bgPanel },
  headerTitle:  { fontFamily: F, fontSize: 11, color: C.orange, letterSpacing: 2 },
  grid:         { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  feedCard:     { width: (W - 28) / 2, marginRight: 8, marginBottom: 8 },
  feedArea:     { height: 130, backgroundColor: '#050508', borderRadius: 4, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  feedPlaceholder: { flexDirection: 'row', alignItems: 'center' },
  motionBanner: { position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: C.redD, padding: 3, alignItems: 'center', borderRadius: 2 },
  tele:         { paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.w08, borderBottomWidth: 1, borderBottomColor: C.w08, marginBottom: 6 },
  ctrlBtn:      { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderRadius: 3 },
  micro:        { fontFamily: F, fontSize: 8 },
});

module.exports = LiveScreen;
                 
