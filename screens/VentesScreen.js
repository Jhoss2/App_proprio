const React = require('react');
const { useState, memo } = React;
const { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } = require('react-native');
const { Led, Scan, Num, EqBar, Card } = require('../components/Atoms');
const { useAllCarts, useCartOrders } = require('../hooks/useFirestore');
const { C, F, W } = require('../constants');

const Ticket = memo(({ order, onClose }) => {
  const items = JSON.parse(order.items || '[]');
  return (
    <Card color={C.orange} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={[st.mono11, { color: C.orange }]}>TICKET #{String(order.id).slice(-4)}</Text>
        <Pressable onPress={onClose}><Text style={[st.mono11, { color: C.w25 }]}>✕</Text></Pressable>
      </View>
      <Text style={[st.micro, { color: C.w25, marginBottom: 8 }]}>{order.date} · {order.time} · {order.cartId}</Text>
      {items.map((it, i) => {
        const ex = JSON.parse(it.extras || '{}');
        return (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={[st.micro, { color: C.white }]}>
              <Text style={{ color: C.orange }}>{it.quantity}×</Text> {it.name}
            </Text>
            {(ex.garnitures || []).map((g, j) => (
              <Text key={j} style={[st.micro, { color: C.w25, marginLeft: 12 }]}>+ {g.name} · {g.price}F</Text>
            ))}
          </View>
        );
      })}
      <View style={{ borderTopWidth: 1, borderTopColor: C.bOrange, marginTop: 6, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[st.micro, { color: C.w25 }]}>TOTAL</Text>
        <Text style={[st.mono11, { color: C.orange }]}>{order.total} F</Text>
      </View>
    </Card>
  );
});

const VentesScreen = () => {
  const { carts }  = useAllCarts();
  const [selCart, setSelCart] = useState(null);
  const cartId     = selCart || carts[0]?.id;
  const { orders, loading } = useCartOrders(cartId, 100);
  const [selOrder, setSelOrder] = useState(null);

  const today     = new Date().toLocaleDateString('fr-FR');
  const todayOrd  = orders.filter(o => o.date === today);
  const total     = todayOrd.reduce((s, o) => s + (o.total || 0), 0);
  const avg       = todayOrd.length > 0 ? Math.round(total / todayOrd.length) : 0;

  // Données égaliseur par heure
  const eqData = Array.from({ length: 16 }, (_, i) => {
    const h = i + 7;
    const v = todayOrd.filter(o => o.time && parseInt(o.time.split(':')[0]) === h).reduce((s, o) => s + (o.total || 0), 0);
    return v;
  });
  const eqMax = Math.max(...eqData, 1);

  return (
    <SafeAreaView style={st.root}>
      <Scan color={C.cyan} h={700} />
      <View style={st.header}>
        <Led color={C.cyan} size={6} />
        <Text style={[st.mono11, { color: C.cyan, letterSpacing: 2, marginLeft: 8 }]}>TRANSCEIVER · ANALYTICS</Text>
        <Text style={[st.micro, { color: C.w25, marginLeft: 8 }]}>{today}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12, paddingBottom: 30 }}>
        {/* Sélecteur cart */}
        {carts.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {carts.map(c => (
              <Pressable key={c.id} onPress={() => setSelCart(c.id)}
                style={[st.chip, { borderColor: cartId === c.id ? C.orange : C.w08, marginRight: 8 }]}>
                <Text style={[st.micro, { color: cartId === c.id ? C.orange : C.w60 }]}>{c.cartName || c.id}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {/* Stats row */}
        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          {[
            { label: 'CMD_COUNT', val: String(todayOrd.length), color: C.orange },
            { label: 'TOTAL_XOF', val: (total || 0).toLocaleString('fr-FR') + 'F', color: C.cyan  },
            { label: 'AVG_VALUE', val: (avg || 0).toLocaleString('fr-FR') + 'F', color: C.amber },
          ].map((s, i) => (
            <Card key={s.label} color={s.color} style={{ flex: 1, alignItems: 'center', marginRight: i < 2 ? 8 : 0 }}>
              <Text style={[st.micro, { color: C.w25 }]}>{s.label}</Text>
              <Num val={s.val} size={16} color={s.color} />
            </Card>
          ))}
        </View>
        {/* Onde holographique — égaliseur matriciel */}
        <Card color={C.cyan} style={{ marginBottom: 14 }}>
          <Text style={[st.micro, { color: C.cyan, letterSpacing: 1, marginBottom: 10 }]}>MATRIX_EQ · VENTES/HEURE · TOUCHER = DÉTAIL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {eqData.map((v, i) => {
              const pct = v / eqMax;
              const col = pct > 0.7 ? C.cyan : pct > 0.4 ? C.orange : C.amber;
              const matchOrders = todayOrd.filter(o => o.time && parseInt(o.time.split(':')[0]) === i + 7);
              return (
                <Pressable key={i} onPress={() => matchOrders[0] && setSelOrder(matchOrders[0])}
                  style={{ alignItems: 'center', flex: 1 }}>
                  <EqBar pct={pct} color={col} width={Math.floor((W - 48) / 16) - 1} />
                  {i % 3 === 0 && <Text style={[st.micro, { color: C.w25, fontSize: 7, marginTop: 3 }]}>{i+7}h</Text>}
                </Pressable>
              );
            })}
          </View>
        </Card>
        {/* Ticket sélectionné */}
        {selOrder && <Ticket order={selOrder} onClose={() => setSelOrder(null)} />}
        {/* Historique */}
        <Text style={[st.micro, { color: C.w25, letterSpacing: 2, marginBottom: 8 }]}>// HISTORIQUE_COMPLET</Text>
        <Card color={C.orange}>
          {loading && <Text style={[st.micro, { color: C.w25, textAlign: 'center', padding: 16 }]}>LOADING_DATA...</Text>}
          {orders.map((o, i) => (
            <Pressable key={o.id} onPress={() => setSelOrder(o)}
              style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }, i > 0 && { borderTopWidth: 1, borderTopColor: C.w08 }]}>
              <View>
                <Text style={[st.micro, { color: C.white }]}>#{String(o.id).slice(-4)} · {JSON.parse(o.items || '[]').map(it => it.name).join(', ').slice(0, 28)}</Text>
                <Text style={[st.micro, { color: C.w25, marginTop: 1 }]}>{o.date} · {o.time} · {o.cartId}</Text>
              </View>
              <Text style={[st.micro, { color: C.orange, fontWeight: 'bold' }]}>{o.total}F</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.bCyan, backgroundColor: C.bgPanel },
  mono11: { fontFamily: F, fontSize: 11 },
  micro:  { fontFamily: F, fontSize: 8 },
  chip:   { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderRadius: 3 },
});

module.exports = VentesScreen;
  
