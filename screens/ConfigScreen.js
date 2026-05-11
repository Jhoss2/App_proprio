/**
 * ConfigScreen — Écran Paramètres
 * Objectifs, Carts, Fond, Récompenses, Bonus, Fournisseurs, Documents RH
 */
const React = require('react');
const { useState, useCallback } = React;
const {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, Alert, ActivityIndicator, Switch,
} = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');

const F = 'monospace';
const C = { orange:'#FF5722', bg:'#020810', dark:'#0a1525', border:'rgba(255,87,34,0.3)', text:'#e8d8c0', sub:'#667788' };

// ── Composant section expansible ──
const Section = ({ title, expanded, onToggle, children }) => (
  <View style={s.section}>
    <Pressable style={s.sectionHeader} onPress={onToggle}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={[s.sectionArrow, expanded && { transform:[{rotate:'90deg'}] }]}>›</Text>
    </Pressable>
    {expanded && <View style={s.sectionBody}>{children}</View>}
  </View>
);

// ── Champ de saisie ──
const Field = ({ label, value, onChangeText, placeholder, keyboardType='default', multiline=false }) => (
  <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput
      style={[s.fieldInput, multiline && { height:80, textAlignVertical:'top' }]}
      value={value} onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor={C.sub}
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

// ── Bouton action ──
const ActionBtn = ({ label, onPress, color=C.orange, small=false }) => (
  <Pressable style={[s.actionBtn, { borderColor:color }, small && s.actionBtnSm]} onPress={onPress}>
    <Text style={[s.actionBtnText, { color }, small && { fontSize:11 }]}>{label}</Text>
  </Pressable>
);

const ConfigScreen = ({ navigation }) => {
  const [saving, setSaving]     = useState(false);
  const [expanded, setExpanded] = useState({ goals:true });

  // ── États objectifs ──
  const [annualGoal,  setAnnualGoal]  = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [dailyCA,     setDailyCA]     = useState('');
  const [dailyCmd,    setDailyCmd]    = useState('');

  // ── État ajout cart ──
  const [cartName, setCartName]   = useState('');
  const [cartId,   setCartId]     = useState('');

  // ── État fournisseur ──
  const [supplierName,    setSupplierName]    = useState('');
  const [supplierProduct, setSupplierProduct] = useState('');
  const [supplierSpec,    setSupplierSpec]    = useState('');
  const [supplierDelay,   setSupplierDelay]   = useState('');
  const [supplierQuality, setSupplierQuality] = useState('');
  const [supplierPrice,   setSupplierPrice]   = useState('');

  const toggle = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  // Charger config existante au mount
  React.useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'goals'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.annualFinancialGoal)  setAnnualGoal(String(d.annualFinancialGoal));
          if (d.monthlyFinancialGoal) setMonthlyGoal(String(d.monthlyFinancialGoal));
          if (d.dailyCAGoal)          setDailyCA(String(d.dailyCAGoal));
          if (d.dailyCmdGoal)         setDailyCmd(String(d.dailyCmdGoal));
        }
        const local = await AsyncStorage.getItem('dashboard_config');
        if (local) {
          const cfg = JSON.parse(local);
          if (cfg.annualGoal)  setAnnualGoal(String(cfg.annualGoal));
          if (cfg.monthlyGoal) setMonthlyGoal(String(cfg.monthlyGoal));
          if (cfg.dailyGoalCA) setDailyCA(String(cfg.dailyGoalCA));
          if (cfg.dailyGoalCmd)setDailyCmd(String(cfg.dailyGoalCmd));
        }
      } catch(_) {}
    })();
  }, []);

  // ── Sauvegarder objectifs ──
  const saveGoals = useCallback(async () => {
    setSaving(true);
    try {
      const data = {
        annualFinancialGoal:  parseFloat(annualGoal)  || 0,
        monthlyFinancialGoal: parseFloat(monthlyGoal) || 0,
        dailyCAGoal:          parseFloat(dailyCA)     || 50000,
        dailyCmdGoal:         parseFloat(dailyCmd)    || 30,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'config', 'goals'), data, { merge: true });
      // Aussi en local
      const local = await AsyncStorage.getItem('dashboard_config') || '{}';
      const cfg = JSON.parse(local);
      Object.assign(cfg, {
        annualGoal:   data.annualFinancialGoal,
        monthlyGoal:  data.monthlyFinancialGoal,
        dailyGoalCA:  data.dailyCAGoal,
        dailyGoalCmd: data.dailyCmdGoal,
      });
      await AsyncStorage.setItem('dashboard_config', JSON.stringify(cfg));
      Alert.alert('✓ Objectifs sauvegardés');
    } catch(e) {
      Alert.alert('Erreur', e.message);
    }
    setSaving(false);
  }, [annualGoal, monthlyGoal, dailyCA, dailyCmd]);

  // ── Ajouter un cart ──
  const addCart = useCallback(async () => {
    if (!cartName.trim() || !cartId.trim()) {
      Alert.alert('Champs requis', 'Nom et identifiant obligatoires');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'carts', cartId.trim()), {
        cartName:    cartName.trim(),
        todayTotal:  0,
        todayOrders: 0,
        annualTotal: 0,
        createdAt:   serverTimestamp(),
        updatedAt:   serverTimestamp(),
      });
      setCartName(''); setCartId('');
      Alert.alert('✓ Chariot ajouté', cartName);
    } catch(e) {
      Alert.alert('Erreur', e.message);
    }
    setSaving(false);
  }, [cartName, cartId]);

  // ── Ajouter un fournisseur ──
  const addSupplier = useCallback(async () => {
    if (!supplierName.trim()) {
      Alert.alert('Champ requis', 'Nom du fournisseur obligatoire');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'suppliers'), {
        companyName:    supplierName.trim(),
        product:        supplierProduct.trim(),
        specifications: supplierSpec.trim(),
        deliveryDelay:  supplierDelay.trim(),
        quality:        supplierQuality.trim(),
        unitPrice:      parseFloat(supplierPrice) || 0,
        createdAt:      serverTimestamp(),
      });
      setSupplierName(''); setSupplierProduct(''); setSupplierSpec('');
      setSupplierDelay(''); setSupplierQuality(''); setSupplierPrice('');
      Alert.alert('✓ Fournisseur ajouté', supplierName);
    } catch(e) {
      Alert.alert('Erreur', e.message);
    }
    setSaving(false);
  }, [supplierName, supplierProduct, supplierSpec, supplierDelay, supplierQuality, supplierPrice]);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>‹ Retour</Text>
        </Pressable>
        <Text style={s.headerTitle}>⚙ PARAMÈTRES</Text>
        {saving && <ActivityIndicator color={C.orange} size="small"/>}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {/* ── Objectifs Financiers ── */}
        <Section title="Objectifs Financiers" expanded={expanded.goals} onToggle={() => toggle('goals')}>
          <Field label="Objectif Financier Annuel (AFG)" value={annualGoal}
            onChangeText={setAnnualGoal} keyboardType="numeric" placeholder="Ex: 18000000"/>
          <Field label="Objectif Financier Mensuel (MFG)" value={monthlyGoal}
            onChangeText={setMonthlyGoal} keyboardType="numeric" placeholder="Ex: 1500000"/>
          <Field label="Objectif C.A. Journalier par Cart" value={dailyCA}
            onChangeText={setDailyCA} keyboardType="numeric" placeholder="Ex: 50000"/>
          <Field label="Objectif Commandes Journalier par Cart" value={dailyCmd}
            onChangeText={setDailyCmd} keyboardType="numeric" placeholder="Ex: 30"/>
          <ActionBtn label="Sauvegarder les objectifs" onPress={saveGoals}/>
        </Section>

        {/* ── Rapports ── */}
        <Section title="Rapports" expanded={expanded.reports} onToggle={() => toggle('reports')}>
          <ActionBtn label="Générer un rapport mensuel (PDF)" onPress={() => Alert.alert('PDF Mensuel', 'Fonctionnalité en développement')}/>
          <ActionBtn label="Générer un rapport annuel (PDF)"  onPress={() => Alert.alert('PDF Annuel',  'Fonctionnalité en développement')}/>
        </Section>

        {/* ── Ajouter un chariot ── */}
        <Section title="Ajouter un chariot" expanded={expanded.cart} onToggle={() => toggle('cart')}>
          <Field label="Nom du chariot (modèle)" value={cartName} onChangeText={setCartName}
            placeholder="Ex: CART_MASTER_01"/>
          <Field label="Identifiant unique du chariot" value={cartId} onChangeText={setCartId}
            placeholder="Ex: cart_01"/>
          <Text style={s.hint}>Le fichier 3D (GLB) peut être défini après création du chariot.</Text>
          <ActionBtn label="Ajouter le chariot" onPress={addCart}/>
        </Section>

        {/* ── Arrière-plan global ── */}
        <Section title="Arrière-plan global" expanded={expanded.bg} onToggle={() => toggle('bg')}>
          <Text style={s.hint}>Définir une image de fond pour l'interface. Accessible depuis la galerie.</Text>
          <ActionBtn label="Choisir depuis la galerie" onPress={() => Alert.alert('Galerie', 'Utiliser l\'icône galerie sur le dashboard')}/>
        </Section>

        {/* ── Récompenses ── */}
        <Section title="Critères de récompenses équipes" expanded={expanded.rewards} onToggle={() => toggle('rewards')}>
          <Text style={s.hint}>Définir les critères de performance déclenchant des récompenses (sold-out, ventes exceptionnelles, etc.).</Text>
          <ActionBtn label="Configurer les récompenses" onPress={() => navigation?.navigate('Ventes')}/>
        </Section>

        {/* ── Bonus ── */}
        <Section title="Conditions d'acquisition de Bonus" expanded={expanded.bonus} onToggle={() => toggle('bonus')}>
          <Text style={s.hint}>Définir les seuils et conditions pour l'attribution automatique de bonus sur salaires.</Text>
          <ActionBtn label="Configurer les bonus" onPress={() => Alert.alert('Bonus', 'Configuration des bonus à venir')}/>
        </Section>

        {/* ── Fournisseurs ── */}
        <Section title="Ajouter un fournisseur" expanded={expanded.supplier} onToggle={() => toggle('supplier')}>
          <Field label="Nom de l'entreprise fournisseuse" value={supplierName} onChangeText={setSupplierName}
            placeholder="Ex: SARL Grossiste BF"/>
          <Field label="Produit en question" value={supplierProduct} onChangeText={setSupplierProduct}
            placeholder="Ex: Pommes de terre fraîches"/>
          <Field label="Spécifications du produit" value={supplierSpec} onChangeText={setSupplierSpec}
            placeholder="Taille, conditionnement, etc." multiline/>
          <Field label="Délai approximatif commande → réception" value={supplierDelay}
            onChangeText={setSupplierDelay} placeholder="Ex: 2-3 jours"/>
          <Field label="Qualité du produit" value={supplierQuality} onChangeText={setSupplierQuality}
            placeholder="Ex: Premium / Standard"/>
          <Field label="Prix unitaire (FCFA)" value={supplierPrice} onChangeText={setSupplierPrice}
            keyboardType="numeric" placeholder="Ex: 500"/>
          <ActionBtn label="Ajouter le fournisseur" onPress={addSupplier}/>
        </Section>

        {/* ── Documents RH ── */}
        <Section title="Documents RH" expanded={expanded.hr} onToggle={() => toggle('hr')}>
          <ActionBtn label="Générer un contrat de travail" small onPress={() => Alert.alert('Contrat', 'Génération de contrat à venir')}/>
          <ActionBtn label="Générer une fiche de poste"    small onPress={() => Alert.alert('Fiche de poste', 'À venir')}/>
          <ActionBtn label="Générer un contrat (autre)"   small onPress={() => Alert.alert('Contrat', 'À venir')}/>
        </Section>

        {/* ── Navigation ── */}
        <Section title="Accès rapides" expanded={expanded.nav} onToggle={() => toggle('nav')}>
          <ActionBtn label="→ Live (Caméras)"         onPress={() => navigation?.navigate('Live')}/>
          <ActionBtn label="→ Tableau des récompenses" onPress={() => navigation?.navigate('Ventes')}/>
          <ActionBtn label="→ Gestion des Stocks"     onPress={() => Alert.alert('Stocks', 'Écran à venir')}/>
          <ActionBtn label="→ Profils des Carts"      onPress={() => navigation?.navigate('Carts')}/>
        </Section>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:C.bg },
  header:       { flexDirection:'row', alignItems:'center', padding:16, paddingTop:28,
                  borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:'#020810' },
  backBtn:      { marginRight:16 },
  backTxt:      { color:C.orange, fontFamily:F, fontSize:16 },
  headerTitle:  { flex:1, color:C.text, fontFamily:F, fontSize:16, fontWeight:'bold', letterSpacing:2 },
  scroll:       { flex:1 },
  scrollContent:{ padding:16, paddingBottom:40 },

  section:      { marginBottom:12, borderWidth:1, borderColor:C.border, borderRadius:4, backgroundColor:'#050e1a' },
  sectionHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                  padding:14, borderBottomWidth:1, borderBottomColor:C.border },
  sectionTitle: { color:C.orange, fontFamily:F, fontSize:13, fontWeight:'bold', letterSpacing:1 },
  sectionArrow: { color:C.orange, fontSize:20, fontWeight:'bold' },
  sectionBody:  { padding:14 },

  field:        { marginBottom:14 },
  fieldLabel:   { color:C.sub, fontFamily:F, fontSize:11, marginBottom:6, letterSpacing:0.5 },
  fieldInput:   { backgroundColor:'#0a1525', color:C.text, fontFamily:F, fontSize:13,
                  borderWidth:1, borderColor:C.border, borderRadius:3, padding:10 },

  actionBtn:    { borderWidth:1, borderRadius:3, padding:12, alignItems:'center',
                  marginTop:8, marginBottom:4 },
  actionBtnSm:  { padding:9, marginTop:5 },
  actionBtnText:{ fontFamily:F, fontSize:13, fontWeight:'bold', letterSpacing:0.5 },

  hint:         { color:C.sub, fontFamily:F, fontSize:10, marginBottom:10, lineHeight:16 },
});

module.exports = ConfigScreen;
      
