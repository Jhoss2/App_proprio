const React = require('react');
const { useState, memo } = React;
const { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, TextInput, Alert } = require('react-native');
const { doc, setDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');
const { Led, Scan, Gauge, Bar, Gear, Num, Card } = require('../components/Atoms');
const { useAllCarts, useCartOrders } = require('../hooks/useFirestore');
const { C, F } = require('../constants');

const CartCard = memo(({ cart, onDelete }) => {
  const { orders } = useCartOrders(cart.id, 5);
  const today      = new Date().toLocaleDateString('fr-FR');
  const todayOrd   = orders.filter(o => o.date === today);
  const todayTotal = todayOrd.reduce((s, o) => s + (o.total || 0), 0);
  const isOnline   = cart.updatedAt && (Date.now()/1000 - cart.updatedAt.seconds) < 300;

  const stocks = [
    { label: 'HUILE',    val: 65, max: 100 },
    { label: 'FRITES',   val: 42, max: 100 },
    { label: 'BOISSONS', val: 78, max: 100 },
    { label: 'EMBALL.',  val: 15, max: 100 },
  ];

  return (
    <Card color={isOnline ? C.orange : C.red} style={{ marginBottom: 12 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Led color={isOnline ? C.cyan : C.red} size={7} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[st.mono11, { color: C.white }]}>{(cart.cartName || cart.id).toUpperCase()}</Text>
            <Text style={[st.micro, { color: C.w25, marginTop: 2 }]}>ID: {cart.id}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Num val={todayTotal.toLocaleString('fr-FR')} size={14} color={C.orange} suf=" F" />
          <Pressable onPress={() => Alert.alert('Supprimer', `Supprimer "${cart.cartName || cart.id}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(cart.id) },
          ])} style={{ marginTop: 6 }}>
            <Text style={[st.mono11, { color: C.red }]}>✕</Text>
          </Pressable>
        </View>
      </View>
      {/* Corps : engrenages + stocks */}
      <View style={{ flexDirection: 'row' }}>
        {/* Engrenages */}
        <View style={{ alignItems: 'center', marginRight: 16 }}>
          <Gear size={44} color={isOnline ? C.orange : C.red} slow={!isOnline} />
          <Gauge val={todayOrd.length} max={50} size={60} color={C.cyan} label="CMD" />
        </View>
        {/* Stocks */}
        <View style={{ flex: 1 }}>
          {stocks.map(s => {
            const col = s.val < 20 ? C.red : s.val < 50 ? C.amber : C.cyan;
            return (
              <View key={s.label} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={[st.micro, { color: C.w25 }]}>{s.label}</Text>
                  <Text style={[st.micro, { color: col, fontWeight: 'bold' }]}>{s.val}%</Text>
                </View>
                <Bar val={s.val} max={s.max} color={col} h={3} />
                {s.val < 20 && <Text style={[st.micro, { color: C.red, marginTop: 2 }]}>⚠ STOCK_CRITIQUE</Text>}
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
});

const CartsScreen = () => {
  const { carts, loading } = useAllCarts();
  const [newId,   setNewId]   = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    const id = newId.trim();
    if (!id) return;
    try {
      await setDoc(doc(db, 'carts', id), { cartId: id, cartName: newName.trim() || id, createdAt: serverTimestamp() });
      setNewId(''); setNewName('');
    } catch (e) { Alert.alert('Erreur', e.message); }
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'carts', id)); } catch (e) { Alert.alert('Erreur', e.message); }
  };

  return (
    <SafeAreaView style={st.root}>
      <Scan color={C.amber} h={700} />
      <View style={st.header}>
        <Led color={C.amber} size={6} />
        <Text style={[st.mono11, { color: C.amber, letterSpacing: 2, marginLeft: 8 }]}>CONSOLE MÉCANIQUE · CARTS</Text>
        <Text style={[st.micro, { color: C.w25, marginLeft: 8 }]}>{carts.length} ENREGISTRÉ(S)</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled">
        <Card color={C.amber} style={{ marginBottom: 14 }}>
          <Text style={[st.micro, { color: C.amber, letterSpacing: 2, marginBottom: 10 }]}>// DEPLOY_NEW_CART</Text>
          <TextInput style={st.input} placeholder="cart_id (ex: cart_01)" placeholderTextColor={C.w25}
            value={newId} onChangeText={setNewId} autoCapitalize="none" />
          <TextInput style={[st.input, { marginTop: 8 }]} placeholder="Nom affiché" placeholderTextColor={C.w25}
            value={newName} onChangeText={setNewName} />
          <Pressable style={[st.btn, { borderColor: C.amber }]} onPress={handleAdd}>
            <Text style={[st.micro, { color: C.amber, letterSpacing: 2 }]}>▶ DEPLOY_CART</Text>
          </Pressable>
        </Card>
        {loading && <Text style={[st.micro, { color: C.w25, textAlign: 'center', marginTop: 20 }]}>SCANNING_NETWORK...</Text>}
        {carts.map(c => <CartCard key={c.id} cart={c} onDelete={handleDelete} />)}
      </ScrollView>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.amberD, backgroundColor: C.bgPanel },
  mono11: { fontFamily: F, fontSize: 11 },
  micro:  { fontFamily: F, fontSize: 8 },
  input:  { backgroundColor: C.bgCard, color: C.white, borderWidth: 1, borderColor: C.w08, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, fontFamily: F, fontSize: 11 },
  btn:    { marginTop: 10, borderWidth: 1, borderRadius: 4, padding: 10, alignItems: 'center' },
});

module.exports = CartsScreen;
  
