const React = require('react');
const { useState, useEffect, useRef, useCallback, memo } = React;
const {
  View, Text, Pressable, StyleSheet, Animated,
  SafeAreaView, Modal, Vibration, Easing,
} = require('react-native');

const { GlowBorder, BlinkLed, ScanLine, GlitchText } = require('../components/Animations');
const { useWebRTCViewer } = require('../hooks/useWebRTC');
const { useAllCarts }     = require('../hooks/useFirestore');
const { COLORS, FONT, SCREEN_WIDTH, SCREEN_HEIGHT } = require('../constants');

/* ─── CRT Overlay ─── */
const CRTOverlay = memo(() => (
  <View style={StyleSheet.absoluteFill}>
    {Array.from({ length: 40 }, (_, i) => (
      <View key={i} style={[styles.crtLine, { top: i * (SCREEN_HEIGHT / 40) }]} />
    ))}
  </View>
));

/* ─── Targeting Reticle ─── */
const Reticle = memo(({ color = COLORS.orange, alert = false }) => {
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const alertAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 8000, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  useEffect(() => {
    if (alert) {
      Vibration.vibrate([200, 100, 200, 100, 400]);
      Animated.loop(
        Animated.sequence([
          Animated.timing(alertAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
          Animated.timing(alertAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
        ])
      ).start();
    } else {
      alertAnim.stopAnimation();
      alertAnim.setValue(0);
    }
  }, [alert]);

  const rotate    = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const alertColor = alertAnim.interpolate({ inputRange: [0, 1], outputRange: [color, COLORS.red] });

  const cornerSize = 16;
  const cornerStyle = (pos) => ({
    position: 'absolute',
    width: cornerSize, height: cornerSize,
    borderColor: alert ? COLORS.red : color,
    ...pos,
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { borderColor: alertColor, borderWidth: alert ? 2 : 0 }]}>
      {/* Coins biseautés */}
      <View style={[cornerStyle({ top: 8, left: 8 }), { borderTopWidth: 2, borderLeftWidth: 2 }]} />
      <View style={[cornerStyle({ top: 8, right: 8 }), { borderTopWidth: 2, borderRightWidth: 2 }]} />
      <View style={[cornerStyle({ bottom: 8, left: 8 }), { borderBottomWidth: 2, borderLeftWidth: 2 }]} />
      <View style={[cornerStyle({ bottom: 8, right: 8 }), { borderBottomWidth: 2, borderRightWidth: 2 }]} />

      {/* Croix centrale */}
      <View style={styles.crossH} />
      <View style={styles.crossV} />

      {/* Cercle rotatif */}
      <View style={styles.reticleCenter}>
        <Animated.View style={[styles.reticleRing, { transform: [{ rotate }], borderColor: color }]} />
      </View>

      {/* Alert overlay */}
      {alert && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: alertColor, opacity: 0.15 }]} />
      )}
    </Animated.View>
  );
});

/* ─── Telemetry Sidebar ─── */
const TelemetrySidebar = memo(({ cart, connected, side = 'left' }) => {
  const [battery, setBattery] = useState(87);
  const [signal,  setSignal]  = useState(4);

  useEffect(() => {
    const iv = setInterval(() => {
      setBattery(v => Math.max(10, v + (Math.random() > 0.9 ? -1 : 0)));
      setSignal(connected ? 4 : Math.floor(Math.random() * 2));
    }, 5000);
    return () => clearInterval(iv);
  }, [connected]);

  const data = side === 'left' ? [
    { label: 'CART_ID',    val: cart?.id || '---',       color: COLORS.orange },
    { label: 'STATUS',     val: connected ? 'ONLINE' : 'OFFLINE', color: connected ? COLORS.cyan : COLORS.red },
    { label: 'BATTERY',    val: `${battery}%`,           color: battery > 30 ? COLORS.green : COLORS.red },
    { label: 'SIGNAL',     val: '▰'.repeat(signal) + '▱'.repeat(4-signal), color: COLORS.cyan },
    { label: 'PROTOCOL',   val: 'WebRTC/P2P',            color: COLORS.textMuted },
  ] : [
    { label: 'RESOLUTION', val: '1280x720',              color: COLORS.textSecondary },
    { label: 'FPS',        val: connected ? '24' : '0',  color: COLORS.orange },
    { label: 'CODEC',      val: 'VP8',                   color: COLORS.textMuted },
    { label: 'BITRATE',    val: connected ? '~1.2Mb' : '0', color: COLORS.cyan },
    { label: 'LATENCY',    val: connected ? '<200ms' : 'N/A', color: COLORS.amber },
  ];

  return (
    <View style={[styles.telemetry, side === 'right' && styles.telemetryRight]}>
      {data.map(d => (
        <View key={d.label} style={styles.telRow}>
          <Text style={styles.telLabel}>{d.label}</Text>
          <Text style={[styles.telVal, { color: d.color }]}>{d.val}</Text>
        </View>
      ))}
    </View>
  );
});

/* ─── Camera Feed Card ─── */
const CamFeedCard = memo(({ cart, onExpand }) => {
  const { remoteStream, connected, connecting, error, connect, disconnect } = useWebRTCViewer(cart.id);
  const [motionAlert, setMotionAlert] = useState(false);

  // Simuler détection de mouvement (sera remplacé par vraie détection)
  useEffect(() => {
    if (!connected) return;
    const iv = setInterval(() => {
      // Pour démo — dans la vraie version : analyse pixel diff
      const detected = Math.random() > 0.97;
      if (detected) {
        setMotionAlert(true);
        setTimeout(() => setMotionAlert(false), 3000);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [connected]);

  return (
    <Pressable style={styles.camCard} onPress={() => connected && onExpand(remoteStream, cart)}>
      <GlowBorder color={motionAlert ? COLORS.red : connected ? COLORS.cyan : COLORS.borderOrange} style={{ flex: 1 }}>

        {/* Flux vidéo ou placeholder */}
        <View style={styles.feedArea}>
          {connected && remoteStream ? (
            <View style={styles.streamPlaceholder}>
              <BlinkLed color={COLORS.red} size={6} fast />
              <Text style={[styles.liveText, { color: COLORS.red }]}>● P2P LIVE</Text>
              {RTCView ? (
                <RTCView streamURL={remoteStream.toURL()} style={StyleSheet.absoluteFill} objectFit="cover" />
              ) : null}
            </View>
          ) : (
            <View style={styles.offlineFeed}>
              <Text style={styles.offlineIcon}>◉</Text>
              <Text style={styles.offlineText}>
                {connecting ? 'CONNECTING...' : error ? 'CONNECTION_FAILED' : 'FLUX_INACTIF'}
              </Text>
              {error && <Text style={styles.errorText}>{error.slice(0, 40)}</Text>}
            </View>
          )}

          {/* Réticule */}
          <Reticle color={connected ? COLORS.cyan : COLORS.orange} alert={motionAlert} />

          {/* Scanlines CRT */}
          <CRTOverlay />

          {/* Alert Motion */}
          {motionAlert && (
            <View style={styles.motionAlert}>
              <Text style={styles.motionAlertText}>⚠ MOTION_DETECT_LOCK</Text>
            </View>
          )}

          {/* Scan line animée */}
          <ScanLine color={connected ? COLORS.cyan : COLORS.orange} containerHeight={120} />
        </View>

        {/* Télémétrie */}
        <TelemetrySidebar cart={cart} connected={connected} side="left" />

        {/* Boutons contrôle */}
        <View style={styles.camControls}>
          <Text style={styles.camCartName}>{(cart.cartName || cart.id).toUpperCase()}</Text>
          <Pressable
            style={[styles.ctrlBtn, connected && styles.ctrlBtnActive]}
            onPress={connected ? disconnect : connect}
          >
            <Text style={[styles.ctrlBtnText, { color: connected ? COLORS.red : COLORS.cyan }]}>
              {connecting ? '⟳ LINK...' : connected ? '■ CUT' : '▶ LINK'}
            </Text>
          </Pressable>
        </View>
      </GlowBorder>
    </Pressable>
  );
});

/* ─── Fullscreen Modal ─── */
const FullscreenModal = memo(({ stream, cart, onClose }) => {
  if (!stream && !cart) return null;

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={styles.fullscreen}>
        <View style={styles.fullFeed}>
          <Text style={styles.fullPlaceholder}>FLUX VIDÉO{'\n'}{cart?.id}</Text>
          <Reticle color={COLORS.orange} />
          <CRTOverlay />
          <ScanLine color={COLORS.orange} containerHeight={SCREEN_HEIGHT} />
        </View>

        {/* HUD overlay */}
        <View style={styles.fullHud}>
          <View style={styles.fullHudLeft}>
            <GlitchText text="NINJA CORP · SURVEILLANCE" style={styles.fullHudTitle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <BlinkLed color={COLORS.red} size={6} fast />
              <Text style={styles.fullHudSub}>REC · WebRTC P2P · ZERO CLOUD</Text>
            </View>
          </View>
          <Pressable style={styles.closeFullBtn} onPress={onClose}>
            <Text style={styles.closeFullText}>✕ CLOSE_STREAM</Text>
          </Pressable>
        </View>

        <TelemetrySidebar cart={cart} connected side="left" />
        <TelemetrySidebar cart={cart} connected side="right" />
      </View>
    </Modal>
  );
});

/* ─── ÉCRAN PRINCIPAL ─── */
const LiveScreen = () => {
  const { carts }   = useAllCarts();
  const [fullStream, setFullStream] = useState(null);
  const [fullCart,   setFullCart]   = useState(null);

  const handleExpand = useCallback((stream, cart) => {
    setFullStream(stream);
    setFullCart(cart);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScanLine color={COLORS.orange} containerHeight={SCREEN_HEIGHT} />

      {/* Header */}
      <View style={styles.header}>
        <BlinkLed color={COLORS.red} size={6} fast />
        <GlitchText text="SURVEILLANCE · HUD TACTIQUE" style={styles.headerTitle} />
        <Text style={styles.headerSub}>WebRTC P2P · {carts.length} CART(S)</Text>
        <BlinkLed color={COLORS.cyan} size={5} />
      </View>

      {/* Grille caméras */}
      <View style={styles.grid}>
        {carts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>NO_SIGNAL · Configurez les carts</Text>
          </View>
        ) : (
          carts.map(cart => (
            <CamFeedCard key={cart.id} cart={cart} onExpand={handleExpand} />
          ))
        )}
      </View>

      <FullscreenModal
        stream={fullStream}
        cart={fullCart}
        onClose={() => { setFullStream(null); setFullCart(null); }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderOrange,
    backgroundColor: COLORS.bgPanel,
  },
  headerTitle: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.orange, letterSpacing: 2, flex: 1 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted },

  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8 },

  camCard:   { width: (SCREEN_WIDTH - 32) / 2, height: 200 },
  feedArea:  { flex: 1, backgroundColor: '#050508', overflow: 'hidden', position: 'relative', minHeight: 120 },

  streamPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  liveText:  { fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1 },

  offlineFeed:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineIcon:  { fontSize: 24, color: COLORS.borderOrange, marginBottom: 6 },
  offlineText:  { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.textMuted, letterSpacing: 1 },
  errorText:    { fontFamily: FONT.mono, fontSize: 7,  color: COLORS.red, marginTop: 4, textAlign: 'center', paddingHorizontal: 8 },

  motionAlert: {
    position: 'absolute', bottom: 4, left: 4, right: 4,
    backgroundColor: COLORS.redGlow, padding: 3, alignItems: 'center',
  },
  motionAlertText: { fontFamily: FONT.mono, fontSize: 8, color: COLORS.red, letterSpacing: 1 },

  telemetry:      { padding: 6, borderTopWidth: 1, borderTopColor: COLORS.borderMuted },
  telemetryRight: { borderTopColor: COLORS.borderCyan },
  telRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  telLabel:  { fontFamily: FONT.mono, fontSize: 7, color: COLORS.textMuted },
  telVal:    { fontFamily: FONT.mono, fontSize: 7, fontWeight: 'bold' },

  camControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 6, borderTopWidth: 1, borderTopColor: COLORS.borderOrange },
  camCartName: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.orange, letterSpacing: 1 },
  ctrlBtn:      { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.borderCyan, borderRadius: 3 },
  ctrlBtnActive:{ borderColor: COLORS.red },
  ctrlBtnText:  { fontFamily: FONT.mono, fontSize: 9, letterSpacing: 1 },

  crossH: { position: 'absolute', top: '50%', left: '10%', right: '10%', height: 1, backgroundColor: COLORS.orange, opacity: 0.3 },
  crossV: { position: 'absolute', left: '50%', top: '10%', bottom: '10%', width: 1, backgroundColor: COLORS.orange, opacity: 0.3 },
  reticleCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  reticleRing:   { width: 40, height: 40, borderRadius: 20, borderWidth: 1, opacity: 0.5 },

  crtLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#000', opacity: 0.08 },

  // Fullscreen
  fullscreen: { flex: 1, backgroundColor: '#000', position: 'relative' },
  fullFeed:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020205' },
  fullPlaceholder: { fontFamily: FONT.mono, fontSize: 14, color: COLORS.orange, textAlign: 'center', letterSpacing: 2 },
  fullHud:    { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fullHudLeft:{ flex: 1 },
  fullHudTitle: { fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange, letterSpacing: 2, marginBottom: 4 },
  fullHudSub:   { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted },
  closeFullBtn: { borderWidth: 1, borderColor: COLORS.orange, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 3 },
  closeFullText: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.orange, letterSpacing: 1 },

  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textMuted, letterSpacing: 2 },
});

module.exports = LiveScreen;
                     
