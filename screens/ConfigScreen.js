const React = require('react');
const { useState, useEffect } = React;
const { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, TextInput, Switch } = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { Led, Scan, Glitch, Card } = require('../components/Atoms');
const { C, F } = require('../constants');

const ConfigScreen = () => {
  const [ownerName, setOwnerName] = useState('');
  const [pin,       setPin]       = useState('');
  const [notifAlerts, setNA]      = useState(true);
  const [notifOrders, setNO]      = useState(true);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('proprio_config').then(v => {
      if (!v) return;
      const c = JSON.parse(v);
      setOwnerName(c.ownerName || '');
      setNA(c.notifAlerts !== false);
      setNO(c.notifOrders !== false);
    });
  }, []);

  const save = async () => {
    await AsyncStorage.setItem('proprio_config', JSON.stringify({ ownerName, pin, notifAlerts, notifOrders }));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const info = [
    { label: 'APP',       val: "NINJA'S CORP",    color: C.orange },
    { label: 'VERSION',   val: '3.0 · DSO',        color: C.w60   },
    { label: 'FIREBASE',  val: 'ninja-s-fries',     color: C.cyan  },
    { label: 'WEBRTC',    val: 'P2P · TURN RELAY', color: C.amber },
    { label: 'PLATFORM',  val: 'Android · Expo 51',color: C.w25   },
  ];

  return (
    <SafeAreaView style={st.root}>
      <Scan color={C.amber} h={700} />
      <View style={st.header}>
        <Led color={C.amber} size={6} />
        <Glitch text="SYSTEM_CONFIG" style={[st.mono11, { color: C.amber, letterSpacing: 2, marginLeft: 8 }]} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card color={C.orange} style={{ marginBottom: 12 }}>
          <Text style={[st.micro, { color: C.amber, letterSpacing: 2, marginBottom: 10 }]}>// IDENTITY</Text>
          <TextInput style={st.input} placeholder="Nom du propriétaire" placeholderTextColor={C.w25}
            value={ownerName} onChangeText={setOwnerName} />
          <TextInput style={[st.input, { marginTop: 8 }]} placeholder="Code PIN (optionnel)" placeholderTextColor={C.w25}
            value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" maxLength={6} />
        </Card>
        <Card color={C.cyan} style={{ marginBottom: 12 }}>
          <Text style={[st.micro, { color: C.amber, letterSpacing: 2, marginBottom: 10 }]}>// NOTIFICATIONS</Text>
          {[
            { label: 'CART_ALERTS',  val: notifAlerts, set: setNA },
            { label: 'ORDER_STREAM', val: notifOrders, set: setNO },
          ].map(s => (
            <View key={s.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
              <Text style={[st.micro, { color: C.w60, letterSpacing: 1 }]}>{s.label}</Text>
              <Switch value={s.val} onValueChange={s.set}
                trackColor={{ false: '#1a1a2e', true: C.cyanD }}
                thumbColor={s.val ? C.cyan : '#444'} />
            </View>
          ))}
        </Card>
        <Card color={C.amber} style={{ marginBottom: 14 }}>
          <Text style={[st.micro, { color: C.amber, letterSpacing: 2, marginBottom: 10 }]}>// SYSTEM_INFO</Text>
          {info.map(r => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.w08 }}>
              <Text style={[st.micro, { color: C.w25 }]}>{r.label}</Text>
              <Text style={[st.micro, { color: r.color, fontWeight: 'bold' }]}>{r.val}</Text>
            </View>
          ))}
        </Card>
        <Pressable style={[st.saveBtn, saved && { borderColor: C.cyan }]} onPress={save}>
          <Text style={[st.mono11, { color: saved ? C.cyan : C.orange, letterSpacing: 2 }]}>
            {saved ? '✓ CONFIG_SAVED' : '▶ SAVE_CONFIG'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.amberD, backgroundColor: C.bgPanel },
  mono11:  { fontFamily: F, fontSize: 11 },
  micro:   { fontFamily: F, fontSize: 8 },
  input:   { backgroundColor: C.bgCard, color: C.white, borderWidth: 1, borderColor: C.w08, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, fontFamily: F, fontSize: 12 },
  saveBtn: { borderWidth: 1, borderColor: C.orange, borderRadius: 4, padding: 14, alignItems: 'center' },
});

module.exports = ConfigScreen;
                                            
