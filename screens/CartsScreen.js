const React = require('react');
const { useState } = React;
const {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Pressable, TextInput, Alert,
} = require('react-native');
const { doc, setDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');

const GlowCard      = require('../components/GlowCard');
const LedIndicator  = require('../components/LedIndicator');
const HexBackground = require('../components/HexBackground');
const { useAllCarts, useCartOrders } = require('../hooks/useFirestore');
const { COLORS, FONT } = require('../constants');

/* ── Card détail d'un cart ── */
const CartCard = ({ cart, onDelete }) => {
  const { orders } = useCartOrders(cart.id, 5);
  const today      = new Date().toLocaleDateString('fr-FR');
  const todayOrd   = orders.filter(o => o.date === today);
  const todayTotal = todayOrd.reduce((s, o) => s + (o.total || 0), 0);

  const isOnline = cart.updatedAt
    ? (Date.now() / 1000 - cart.updatedAt.seconds) < 300
    : false;

  return (
    <GlowCard style={styles.cartCard}>
      <View style={styles.cartHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LedIndicator status={isOnline ? 'online' : 'offline'} />
          <View>
            <Text style={styles.cartName}>{(cart.cartName || cart.id).toUpperCase()}</Text>
            <Text style={styles.cartId}>ID : {cart.id}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => Alert.alert(
            'Supprimer ce cart ?',
            `"${cart.cartName || cart.id}" sera retiré du tableau de bord.`,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(cart.id) },
            ]
          )}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.cartStats}>
        <View style={styles.cartStat}>
          <Text style={styles.cartStatLabel}>AUJOURD'HUI</Text>
          <Text style={styles.cartStatValue}>{todayOrd.length} cmd</Text>
        </View>
        <View style={styles.cartStat}>
          <Text style={styles.cartStatLabel}>TOTAL JOUR</Text>
          <Text style={[styles.cartStatValue, { color: COLORS.orange }]}>
            {todayTotal.toLocaleString('fr-FR')} F
          </Text>
        </View>
        <View style={styles.cartStat}>
          <Text style={styles.cartStatLabel}>STATUT</Text>
          <Text style={[styles.cartStatValue, { color: isOnline ? COLORS.online : COLORS.offline }]}>
            {isOnline ? 'EN LIGNE' : 'OFFLINE'}
          </Text>
        </View>
      </View>
    </GlowCard>
  );
};

/* ── Écran principal ── */
const CartsScreen = () => {
  const { carts, loading } = useAllCarts();
  const [newId, setNewId]   = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding]   = useState(false);

  const handleAdd = async () => {
    const id = newId.trim();
    if (!id) return;
    try {
      await setDoc(doc(db, 'carts', id), {
        cartId:    id,
        cartName:  newName.trim() || id,
        createdAt: serverTimestamp(),
      });
      setNewId('');
      setNewName('');
      setAdding(false);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'ajouter ce cart : ' + e.message);
    }
  };

  const handleDelete = async (cartId) => {
    try {
      await deleteDoc(doc(db, 'carts', cartId));
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <HexBackground opacity={0.04} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>FOOD CARTS</Text>
        <Text style={styles.headerSub}>{carts.length} CART(S) ENREGISTRÉ(S)</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Formulaire ajout */}
        <GlowCard>
          <Text style={styles.sectionTitle}>AJOUTER UN CART</Text>
          <TextInput
            style={styles.input}
            placeholder="Identifiant (ex: cart_01)"
            placeholderTextColor={COLORS.orangeFade}
            value={newId}
            onChangeText={setNewId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Nom affiché (ex: Cart Centre-ville)"
            placeholderTextColor={COLORS.orangeFade}
            value={newName}
            onChangeText={setNewName}
          />
          <Pressable style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>ENREGISTRER LE CART</Text>
          </Pressable>
        </GlowCard>

        <Text style={styles.sectionTitle}>MES CARTS</Text>

        {loading && <Text style={styles.emptyText}>Chargement...</Text>}
        {!loading && carts.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun cart enregistré.{'\n'}
            Commencez par en ajouter un ci-dessus.
          </Text>
        )}
        {carts.map(cart => (
          <CartCard key={cart.id} cart={cart} onDelete={handleDelete} />
        ))}
      </ScrollView>
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
  headerSub:   { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade },
  scroll:      { padding: 14, paddingBottom: 30 },
  sectionTitle: { fontFamily: FONT.mono, fontSize: 9, color: COLORS.orangeFade, letterSpacing: 2, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.bgInput, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: FONT.mono, fontSize: 12, marginBottom: 10,
  },
  addBtn: {
    backgroundColor: COLORS.orangeGlow, borderWidth: 1, borderColor: COLORS.orange,
    borderRadius: 8, padding: 12, alignItems: 'center',
  },
  addBtnText: { fontFamily: FONT.mono, fontSize: 11, color: COLORS.orange, letterSpacing: 1 },

  cartCard:   { marginBottom: 10 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cartName:   { fontFamily: FONT.mono, fontSize: 13, color: COLORS.textPrimary, letterSpacing: 1 },
  cartId:     { fontFamily: FONT.mono, fontSize: 9,  color: COLORS.orangeFade, marginTop: 2 },
  deleteBtn:  { padding: 8 },
  deleteBtnText: { fontFamily: FONT.mono, fontSize: 14, color: COLORS.offline },
  cartStats:  { flexDirection: 'row', gap: 8 },
  cartStat:   { flex: 1, alignItems: 'center' },
  cartStatLabel: { fontFamily: FONT.mono, fontSize: 8, color: COLORS.orangeFade, letterSpacing: 1 },
  cartStatValue: { fontFamily: FONT.mono, fontSize: 12, color: COLORS.textPrimary, fontWeight: 'bold', marginTop: 2 },
  emptyText:  { fontFamily: FONT.mono, fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginTop: 30, lineHeight: 22 },
});

module.exports = CartsScreen;
