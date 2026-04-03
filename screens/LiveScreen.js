const React = require('react');
const { useState, useCallback } = React;
const {
  View, Text, Pressable, StyleSheet,
  SafeAreaView, ScrollView, Modal,
} = require('react-native');
const { RTCView } = require('react-native-webrtc');

const GlowCard      = require('../components/GlowCard');
const LedIndicator  = require('../components/LedIndicator');
const HexBackground = require('../components/HexBackground');
const { useWebRTCViewer } = require('../hooks/useWebRTC');
const { useAllCarts }     = require('../hooks/useFirestore');
const { COLORS, FONT } = require('../constants');

/* ── Composant flux d'un cart ── */
const CamFeed = ({ cart, onFullscreen }) => {
  const { remoteStream, connected, connecting, connect, disconnect } =
    useWebRTCViewer(cart.id);

  return (
    <GlowCard style={[styles.camCard, connected && styles.camCardActive]}>
      {/* En-tête */}
      <View style={styles.camHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <LedIndicator status={connected ? 'online' : connecting ? 'warning' : 'offline'} size={6} />
          <Text style={styles.camTitle}>{(cart.cartName || cart.id).toUpperCase()}</Text>
        </View>
        <Text style={styles.camStatus}>
          {connected ? '● LIVE P2P' : connecting ? '⟳ CONNEXION...' : '○ HORS LIGNE'}
        </Text>
      </View>

      {/* Flux vidéo */}
      <View style={styles.feedBox}>
        {connected && remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.rtcView}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <View style={styles.feedPlaceholder}>
            <Text style={styles.feedPlaceholderText}>
              {connecting ? 'CONNEXION EN COURS...' : 'FLUX INACTIF'}
            </Text>
          </View>
        )}
        {/* Scanline animée quand connecté */}
        {connected && <View style={styles.scanLine} />}
        {/* Overlay infos */}
        <View style={styles.feedOverlay}>
          <Text style={styles.feedCartId}>{cart.id}</Text>
        </View>
      </View>

      {/* Contrôles */}
      <View style={styles.camControls}>
        <Pressable
          style={[styles.ctrlBtn, connected && styles.ctrlBtnDanger]}
          onPress={connected ? disconnect : connect}
        >
          <Text style={styles.ctrlBtnText}>
            {connected ? 'DÉCONNECTER' : connecting ? '...' : 'CONNECTER'}
          </Text>
        </Pressable>
        {connected && (
          <Pressable
            style={styles.ctrlBtnFull}
            onPress={() => onFullscreen(remoteStream, cart)}
          >
            <Text style={styles.ctrlBtnText}>PLEIN ÉCRAN</Text>
          </Pressable>
        )}
      </View>
    </GlowCard>
  );
};

/* ── Modal plein écran ── */
const FullscreenModal = ({ stream, cart, onClose }) => (
  <Modal visible={!!stream} animationType="fade" statusBarTranslucent>
    <View style={styles.fullscreenContainer}>
      {stream && (
        <RTCView
          streamURL={stream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
        />
      )}
      {/* Overlay HUD */}
      <View style={styles.hudTopLeft}>
        <Text style={styles.hudText}>NINJA CORP · {cart?.cartName || cart?.id}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <LedIndicator status="online" size={6} />
          <Text style={styles.hudSubText}>LIVE · P2P WebRTC</Text>
        </View>
      </View>
      {/* Coins décoratifs cyberpunk */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
      {/* Bouton fermer */}
      <Pressable style={styles.closeFullBtn} onPress={onClose}>
        <Text style={styles.closeFullText}>✕ FERMER</Text>
      </Pressable>
    </View>
  </Modal>
);

/* ── Écran principal ── */
const LiveScreen = () => {
  const { carts } = useAllCarts();
  const [fullStream, setFullStream] = useState(null);
  const [fullCart, setFullCart]     = useState(null);

  const handleFullscreen = useCallback((stream, cart) => {
    setFullStream(stream);
    setFullCart(cart);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <HexBackground opacity={0.04} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>SURVEILLANCE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <LedIndicator status="online" size={6} />
          <Text style={styles.headerSub}>WebRTC P2P · ZÉRO CLOUD</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.infoText}>
          Les flux vidéo transitent directement de la tablette vers ce téléphone.
          Aucune donnée vidéo ne passe par Firebase.
        </Text>

        {carts.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun cart configuré.{'\n'}
            Ajoutez des carts depuis l'onglet CONFIG.
          </Text>
        )}

        {carts.map(cart => (
          <CamFeed
            key={cart.id}
            cart={cart}
            onFullscreen={handleFullscreen}
          />
        ))}
      </ScrollView>

      <FullscreenModal
        stream={fullStream}
        cart={fullCart}
        onClose={() => { setFullStream(null); setFullCart(null); }}
      />
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
  headerSub:   { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.online },
  scroll: { padding: 14, paddingBottom: 30 },
  infoText: {
    fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade,
    textAlign: 'center', marginBottom: 14, lineHeight: 16,
  },

  camCard: { marginBottom: 12 },
  camCardActive: { borderColor: COLORS.orange },
  camHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  camTitle:  { fontFamily: FONT.mono, fontSize: 12, color: COLORS.textPrimary, letterSpacing: 1 },
  camStatus: { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orange },

  feedBox: { height: 180, borderRadius: 8, overflow: 'hidden', backgroundColor: '#050508', marginBottom: 10, position: 'relative' },
  rtcView: { flex: 1 },
  feedPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  feedPlaceholderText: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.orangeFade },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: '#f9731640',
  },
  feedOverlay: { position: 'absolute', top: 6, left: 8 },
  feedCartId: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade },

  camControls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 6,
    borderWidth: 1, borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeGlow, alignItems: 'center',
  },
  ctrlBtnDanger: { borderColor: COLORS.offline, backgroundColor: '#ef444415' },
  ctrlBtnFull: {
    flex: 1, paddingVertical: 8, borderRadius: 6,
    borderWidth: 1, borderColor: COLORS.orangeFade,
    backgroundColor: 'transparent', alignItems: 'center',
  },
  ctrlBtnText: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.orange, letterSpacing: 1 },

  // Plein écran
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },
  hudTopLeft: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  hudText:    { fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange, letterSpacing: 1 },
  hudSubText: { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.online },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: COLORS.orange, zIndex: 10 },
  cornerTL: { top: 44, left: 14,  borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 44, right: 14, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 80, left: 14,  borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 80, right: 14, borderBottomWidth: 2, borderRightWidth: 2 },
  closeFullBtn: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    borderWidth: 1, borderColor: COLORS.orange, borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: COLORS.orangeGlow, zIndex: 10,
  },
  closeFullText: { fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange, letterSpacing: 2 },

  emptyText: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, lineHeight: 22 },
});

module.exports = LiveScreen;
