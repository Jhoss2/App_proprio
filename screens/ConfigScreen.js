const React = require('react');
const { useState, useEffect } = React;
const {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Pressable, TextInput,
  Switch, Alert,
} = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const GlowCard      = require('../components/GlowCard');
const HexBackground = require('../components/HexBackground');
const { COLORS, FONT } = require('../constants');

/* ── Ligne de paramètre avec switch ── */
const SettingRow = ({ label, sub, value, onToggle }) => (
  <View style={styles.settingRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.settingLabel}>{label}</Text>
      {sub && <Text style={styles.settingSub}>{sub}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#333', true: COLORS.orangeDim }}
      thumbColor={value ? COLORS.orange : '#555'}
    />
  </View>
);

/* ── Ligne info ── */
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* ── Écran principal ── */
const ConfigScreen = () => {
  const [ownerName,  setOwnerName]  = useState('');
  const [pin,        setPin]        = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [notifAlerts,  setNotifAlerts]  = useState(true);
  const [notifOrders,  setNotifOrders]  = useState(true);
  const [autoBroadcast, setAutoBroadcast] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('proprio_config').then(val => {
      if (val) {
        const cfg = JSON.parse(val);
        setOwnerName(cfg.ownerName || '');
        setNotifAlerts(cfg.notifAlerts !== false);
        setNotifOrders(cfg.notifOrders !== false);
        setAutoBroadcast(cfg.autoBroadcast === true);
      }
    });
  }, []);

  const handleSave = async () => {
    if (pin && pin !== pinConfirm) {
      Alert.alert('Erreur', 'Les codes PIN ne correspondent pas.');
      return;
    }
    const cfg = { ownerName, notifAlerts, notifOrders, autoBroadcast };
    if (pin) cfg.pin = pin;
    await AsyncStorage.setItem('proprio_config', JSON.stringify(cfg));
    setPin('');
    setPinConfirm('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.root}>
      <HexBackground opacity={0.04} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONFIGURATION</Text>
        <Text style={styles.headerSub}>NINJA'S CORP v1.0</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >

        {/* Identité */}
        <Text style={styles.sectionTitle}>IDENTITÉ</Text>
        <GlowCard>
          <Text style={styles.inputLabel}>NOM DU PROPRIÉTAIRE</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre nom"
            placeholderTextColor={COLORS.orangeFade}
            value={ownerName}
            onChangeText={setOwnerName}
          />
        </GlowCard>

        {/* Sécurité */}
        <Text style={styles.sectionTitle}>SÉCURITÉ</Text>
        <GlowCard>
          <Text style={styles.inputLabel}>NOUVEAU CODE PIN (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Code PIN (4-6 chiffres)"
            placeholderTextColor={COLORS.orangeFade}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.inputLabel}>CONFIRMER LE CODE PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Répéter le code PIN"
            placeholderTextColor={COLORS.orangeFade}
            value={pinConfirm}
            onChangeText={setPinConfirm}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />
        </GlowCard>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <GlowCard>
          <SettingRow
            label="ALERTES CARTS"
            sub="Hors ligne, anomalie détectée"
            value={notifAlerts}
            onToggle={setNotifAlerts}
          />
          <View style={styles.divider} />
          <SettingRow
            label="NOUVELLES COMMANDES"
            sub="Notification à chaque vente"
            value={notifOrders}
            onToggle={setNotifOrders}
          />
        </GlowCard>

        {/* WebRTC */}
        <Text style={styles.sectionTitle}>SURVEILLANCE</Text>
        <GlowCard>
          <SettingRow
            label="BROADCAST AUTO"
            sub="Diffuser la caméra au démarrage de l'app vendeur"
            value={autoBroadcast}
            onToggle={setAutoBroadcast}
          />
          <View style={styles.divider} />
          <InfoRow label="PROTOCOLE"   value="WebRTC P2P" />
          <InfoRow label="SIGNALISATION" value="Firebase Realtime DB" />
          <InfoRow label="FLUX VIDÉO"  value="Zéro transit cloud" />
          <InfoRow label="AUDIO"       value="Inclus (WebRTC)" />
        </GlowCard>

        {/* Infos app */}
        <Text style={styles.sectionTitle}>INFORMATIONS</Text>
        <GlowCard>
          <InfoRow label="APPLICATION"  value="Ninja's Corp" />
          <InfoRow label="VERSION"      value="1.0.0" />
          <InfoRow label="FIREBASE"     value="ninja-s-fries" />
          <InfoRow label="PLATEFORME"   value="Android (Expo)" />
        </GlowCard>

        {/* Bouton sauvegarder */}
        <Pressable
          style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>
            {saved ? '✓ CONFIGURATION SAUVEGARDÉE' : 'ENREGISTRER LES PARAMÈTRES'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontFamily: FONT.mono, fontSize: 16, color: COLORS.orange, letterSpacing: 2 },
  headerSub:   { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade },
  scroll:      { padding: 14, paddingBottom: 40 },
  sectionTitle: {
    fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade,
    letterSpacing: 2, marginBottom: 8, marginTop: 4,
  },
  inputLabel: {
    fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade,
    letterSpacing: 1, marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.bgInput, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: FONT.mono, fontSize: 13, marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textPrimary, letterSpacing: 0.5 },
  settingSub:   { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.textSecondary, marginTop: 2 },
  divider:      { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.textSecondary },
  infoValue: { fontFamily: FONT.mono, fontSize: 10, color: COLORS.orange },
  saveBtn: {
    backgroundColor: COLORS.orangeGlow, borderWidth: 1, borderColor: COLORS.orange,
    borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8,
    shadowColor: COLORS.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  saveBtnSuccess: {
    borderColor: COLORS.online, backgroundColor: '#22c55e15',
  },
  saveBtnText: {
    fontFamily: FONT.mono, fontSize: 12, color: COLORS.orange,
    letterSpacing: 1.5, fontWeight: 'bold',
  },
});

module.exports = ConfigScreen;
