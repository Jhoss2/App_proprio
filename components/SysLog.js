/**
 * SysLog — colonne gauche SYS.LOG
 * Logs défilants + 3 LEDs indicateurs (cyan/vert/jaune)
 */
const React = require('react');
const { useState, useEffect, useRef, memo } = React;
const { View, Text, StyleSheet, Animated, Easing } = require('react-native');

const F = 'monospace';

const LOG_MSGS = [
  { msg: 'DATA-CARD',      type: 'info' },
  { msg: 'ORDER-RECEPTION',type: 'ok'   },
  { msg: 'HEART-BREAK',    type: 'warn' },
  { msg: 'SYNC-PULS',      type: 'info' },
  { msg: 'DATA-SYSTEM',    type: 'info' },
  { msg: 'CART-STATUS',    type: 'ok'   },
  { msg: 'FIREBASE-SYNC',  type: 'ok'   },
  { msg: 'AUTH-CHECK',     type: 'info' },
  { msg: 'CAM-STREAM',     type: 'warn' },
  { msg: 'ORDER-SENT',     type: 'ok'   },
];

/* ── LED clignotante ── */
const Led = memo(({ color, delay = 0 }) => {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(a, { toValue: 0.1, duration: 600, useNativeDriver: true }),
        Animated.timing(a, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: 7, height: 7, borderRadius: 3.5,
      backgroundColor: color, opacity: a,
      marginBottom: 10,
    }} />
  );
});

/* ── Bordure lumineuse animée ── */
const GlowBorder = memo(({ children, style }) => {
  const a = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1,   duration: 2000, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0.4, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const borderColor = '#00ffff';
  return (
    <View style={[s.glowBox, style, { borderColor }]}>
      {children}
    </View>
  );
});

const SysLog = memo(() => {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long' }).toUpperCase();
  const [logs, setLogs] = useState([
    { t: '20:30', msg: 'SYSTEM_BOOT',   type: 'ok'   },
    { t: '20:31', msg: 'DATA-CARD',     type: 'info' },
    { t: '20:31', msg: 'ORDER-RECEPTION', type: 'ok' },
    { t: '20:31', msg: 'HEART-BREAK',   type: 'warn' },
    { t: '20:33', msg: 'SYNC-PULS',     type: 'info' },
    { t: '20:33', msg: 'DATA-SYSTEM',   type: 'info' },
    { t: '20:33', msg: 'CART STATUS',   type: 'ok'   },
  ]);

  useEffect(() => {
    const iv = setInterval(() => {
      const now  = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const pick = LOG_MSGS[Math.floor(Math.random() * LOG_MSGS.length)];
      setLogs(p => [{ t: now, ...pick }, ...p].slice(0, 8));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const typeColor = { ok: '#00ff88', info: '#00ccff', warn: '#ffcc00' };

  return (
    <GlowBorder style={s.root}>
      {/* Titre */}
      <Text style={s.title}>//SYS.LOG</Text>

      {/* Corps : logs + LEDs */}
      <View style={s.body}>
        {/* Colonne logs */}
        <View style={{ flex: 1 }}>
          {logs.map((l, i) => (
            <View key={i} style={s.logRow}>
              <Text style={s.logTime}>{l.t}</Text>
              <Text style={[s.logMsg, { color: typeColor[l.type] || '#aaa' }]}>
                {l.msg}
              </Text>
            </View>
          ))}
          {/* Date en bas */}
          <Text style={s.dateText}>{today}</Text>
        </View>
        {/* Colonne LEDs */}
        <View style={s.ledCol}>
          <Led color="#00ffff" delay={0}   />
          <Led color="#00ff88" delay={400} />
          <Led color="#ffcc00" delay={800} />
          <Led color="#00ffff" delay={200} />
          <Led color="#00ff88" delay={600} />
        </View>
      </View>

      {/* Flèche indicateur */}
      <View style={s.arrow}>
        <Text style={s.arrowText}>›</Text>
      </View>
    </GlowBorder>
  );
});

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#050e1a', borderWidth: 1, borderRadius: 2, padding: 8 },
  glowBox: { borderWidth: 1, borderRadius: 2 },
  title:   { fontFamily: F, fontSize: 10, color: '#00ccff', letterSpacing: 1.5, marginBottom: 8, fontWeight: 'bold' },
  body:    { flexDirection: 'row', flex: 1 },
  logRow:  { marginBottom: 5 },
  logTime: { fontFamily: F, fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 12 },
  logMsg:  { fontFamily: F, fontSize: 9, letterSpacing: 0.5, lineHeight: 13 },
  dateText:{ fontFamily: F, fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 6 },
  ledCol:  { width: 16, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  arrow:   { position: 'absolute', left: -12, top: '40%' },
  arrowText: { color: '#00ccff', fontSize: 18, fontWeight: 'bold' },
});

module.exports = SysLog;
