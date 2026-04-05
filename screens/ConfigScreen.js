const React = require('react');
const { useState, useEffect } = React;
const {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Pressable, TextInput, Switch,
} = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { GlowBorder, BlinkLed, ScanLine, GlitchText } = require('../components/Animations');
const { COLORS, FONT } = require('../constants');

const ConfigScreen = () => {
  const [ownerName, setOwnerName]     = useState('');
  const [pin, setPin]                 = useState('');
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifOrders, setNotifOrders] = useState(true);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('proprio_config').then(v => {
      if (v) { const c = JSON.parse(v); setOwnerName(c.ownerName||''); setNotifAlerts(c.notifAlerts!==false); setNotifOrders(c.notifOrders!==false); }
    });
  }, []);

  const handleSave = async () => {
    await AsyncStorage.setItem('proprio_config', JSON.stringify({ ownerName, pin, notifAlerts, notifOrders }));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const rows = [
    { label: 'APPLICATION',  val: "NINJA'S CORP",      color: COLORS.orange },
    { label: 'VERSION',      val: '2.0.0 · DSO',       color: COLORS.textSecondary },
    { label: 'FIREBASE_ID',  val: 'ninja-s-fries',      color: COLORS.cyan },
    { label: 'WEBRTC',       val: 'P2P · TURN RELAY',  color: COLORS.amber },
    { label: 'RENDER',       val: 'React Native 0.74', color: COLORS.textMuted },
    { label: 'DESIGN',       val: 'Deep Space Orange', color: COLORS.orange },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScanLine color={COLORS.amber} containerHeight={600} />
      <View style={styles.header}>
        <BlinkLed color={COLORS.amber} size={6} />
        <GlitchText text="SYSTEM_CONFIG" style={styles.headerTitle} />
        <Text style={styles.headerSub}>NINJA CORP v2.0</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <GlowBorder color={COLORS.orange} style={styles.section}>
          <Text style={styles.sTitle}>// IDENTITY</Text>
          <TextInput style={styles.input} placeholder="Nom du propriétaire" placeholderTextColor={COLORS.textMuted} value={ownerName} onChangeText={setOwnerName} />
          <TextInput style={styles.input} placeholder="Code PIN (optionnel)" placeholderTextColor={COLORS.textMuted} value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" maxLength={6} />
        </GlowBorder>

        <GlowBorder color={COLORS.cyan} style={styles.section}>
          <Text style={styles.sTitle}>// NOTIFICATIONS</Text>
          {[
            { label: 'CART_ALERTS',   val: notifAlerts, set: setNotifAlerts },
            { label: 'ORDER_STREAM',  val: notifOrders, set: setNotifOrders },
          ].map(s => (
            <View key={s.label} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{s.label}</Text>
              <Switch value={s.val} onValueChange={s.set} trackColor={{ false:'#1a1a2e', true: COLORS.cyanDim }} thumbColor={s.val ? COLORS.cyan : '#444'} />
            </View>
          ))}
        </GlowBorder>

        <GlowBorder color={COLORS.amber} style={styles.section}>
          <Text style={styles.sTitle}>// SYSTEM_INFO</Text>
          {rows.map(r => (
            <View key={r.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{r.label}</Text>
              <Text style={[styles.infoVal, { color: r.color }]}>{r.val}</Text>
            </View>
          ))}
        </GlowBorder>

        <Pressable style={[styles.saveBtn, saved && styles.saveBtnOk]} onPress={handleSave}>
          <Text style={[styles.saveBtnText, saved && { color: COLORS.cyan }]}>
            {saved ? '✓ CONFIG_SAVED' : '▶ SAVE_CONFIG'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.amberDim, backgroundColor: COLORS.bgPanel },
  headerTitle: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.amber, letterSpacing: 2, flex: 1 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 8,  color: COLORS.textMuted },
  scroll:      { padding: 12, paddingBottom: 40 },
  section:     { padding: 12, marginBottom: 12 },
  sTitle:      { fontFamily: FONT.mono, fontSize: 9, color: COLORS.amber, letterSpacing: 2, marginBottom: 10 },
  input:       { backgroundColor: COLORS.bgCard, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.borderMuted, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, fontFamily: FONT.mono, fontSize: 12, marginBottom: 8 },
  switchRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  switchLabel: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.textSecondary, letterSpacing: 1 },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: COLORS.borderMuted },
  infoLabel:   { fontFamily: FONT.mono, fontSize: 8, color: COLORS.textMuted },
  infoVal:     { fontFamily: FONT.mono, fontSize: 9, fontWeight: 'bold' },
  saveBtn:     { backgroundColor: COLORS.orangeGlow, borderWidth: 1, borderColor: COLORS.orange, borderRadius: 4, padding: 14, alignItems: 'center', shadowColor: COLORS.orange, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: {width:0,height:0}, elevation: 6 },
  saveBtnOk:   { borderColor: COLORS.cyan },
  saveBtnText: { fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange, letterSpacing: 2 },
});

module.exports = ConfigScreen;
              
