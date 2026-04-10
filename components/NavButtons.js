/**
 * NavButtons — Tableau de récompenses | Lumi | Gestion des stocks
 */
const React = require('react');
const { memo } = React;
const { View, Text, Image, Pressable, StyleSheet } = require('react-native');

const F = 'monospace';

const NavBtn = memo(({ label, imageUri, onPress, children }) => (
  <Pressable onPress={onPress} style={s.btn}>
    <View style={s.imgBox}>
      {imageUri
        ? <Image source={{ uri: imageUri }} style={s.img} resizeMode="cover" />
        : <View style={s.imgPlaceholder}>{children}</View>
      }
    </View>
    <Text style={s.label}>{label}</Text>
  </Pressable>
));

/* ── Récompenses placeholder ── */
const RewardIcon = memo(() => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
      <View style={[s.miniIcon, { backgroundColor: '#c8a040' }]} />
      <View style={[s.miniIcon, { backgroundColor: '#aaaaaa', marginLeft: 4 }]} />
    </View>
    <Text style={{ color: '#ffcc00', fontSize: 14 }}>🏆</Text>
  </View>
));

/* ── Lumi placeholder ── */
const LumiIcon = memo(() => (
  <View style={s.lumiCircle}>
    <Text style={s.lumiText}>AI</Text>
    {/* Halo bleu */}
    <View style={s.lumiHalo} />
  </View>
));

/* ── Stocks placeholder ── */
const StocksIcon = memo(() => (
  <View style={{ alignItems: 'center' }}>
    {[72, 22, 16].map((v, i) => (
      <View key={i} style={s.stockRow}>
        <View style={[s.stockBar, { width: v * 0.6, backgroundColor: i === 0 ? '#00ff88' : i === 1 ? '#00aaff' : '#ffcc00' }]} />
        <Text style={s.stockPct}>{v}%</Text>
      </View>
    ))}
  </View>
));

const NavButtons = memo(({ onRewards, onLumi, onStocks, lumiUri, stocksUri }) => (
  <View style={s.root}>
    <NavBtn label="TABLEAU DE RÉCOMPENSES" onPress={onRewards}>
      <RewardIcon />
    </NavBtn>
    <NavBtn label="LUMI" imageUri={lumiUri} onPress={onLumi}>
      <LumiIcon />
    </NavBtn>
    <NavBtn label="GESTION DES STOCKS" imageUri={stocksUri} onPress={onStocks}>
      <StocksIcon />
    </NavBtn>
  </View>
));

const s = StyleSheet.create({
  root:   { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6, paddingHorizontal: 4 },
  btn:    { alignItems: 'center', width: '30%' },
  imgBox: { width: 64, height: 56, backgroundColor: '#0a1525', borderWidth: 1, borderColor: '#1a4060', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 4, overflow: 'hidden' },
  img:    { width: 64, height: 56 },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  label:  { fontFamily: F, fontSize: 7, color: '#88aacc', textAlign: 'center', letterSpacing: 0.5 },
  miniIcon: { width: 10, height: 10, borderRadius: 5 },
  lumiCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a2a4a', borderWidth: 1.5, borderColor: '#0066ff', alignItems: 'center', justifyContent: 'center' },
  lumiText: { fontFamily: F, fontSize: 10, color: '#00aaff', fontWeight: 'bold' },
  lumiHalo: { position: 'absolute', width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#0044aa', opacity: 0.5 },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  stockBar: { height: 5, borderRadius: 2, marginRight: 3 },
  stockPct: { fontFamily: F, fontSize: 7, color: '#aaccee' },
});

module.exports = NavButtons;
