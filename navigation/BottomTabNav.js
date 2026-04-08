const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Pressable, StyleSheet, Animated } = require('react-native');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
const { C, F } = require('../constants');

const DashboardScreen = require('../screens/DashboardScreen');
const LiveScreen      = require('../screens/LiveScreen');
const VentesScreen    = require('../screens/VentesScreen');
const CartsScreen     = require('../screens/CartsScreen');
const ConfigScreen    = require('../screens/ConfigScreen');

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', label: 'HQ',     icon: '⊞', color: C.orange },
  { name: 'Live',      label: 'LIVE',   icon: '◉', color: C.red    },
  { name: 'Ventes',    label: 'SIGNAL', icon: '≋', color: C.cyan   },
  { name: 'Carts',     label: 'MECH',   icon: '⚙', color: C.amber  },
  { name: 'Config',    label: 'SYS',    icon: '≡', color: C.w60    },
];

const TabBtn = memo(({ tab, focused, onPress }) => {
  // UN seul Animated.Value, UN seul useNativeDriver: true
  // Pas de backgroundColor animé — rendu conditionnel pur à la place
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Uniquement useNativeDriver: true — transform seulement
    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  }, [focused]);

  return (
    <Pressable onPress={onPress} style={st.tabBtn}>
      {/* backgroundColor géré en style statique conditionnel — pas d'animation */}
      <Animated.View style={[
        st.tabInner,
        focused && { backgroundColor: `${tab.color}18` },
        { transform: [{ scale }] },
      ]}>
        {/* Ligne active en haut — View statique, pas animée */}
        {focused && (
          <View style={[st.activeBar, { backgroundColor: tab.color }]} />
        )}
        <Text style={[st.tabIcon, { color: focused ? tab.color : C.w25 }]}>
          {tab.icon}
        </Text>
        <Text style={[st.tabLabel, { color: focused ? tab.color : C.w25 }]}>
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

const CustomTabBar = ({ state, navigation }) => (
  <View style={st.bar}>
    <View style={st.topLine} />
    {TABS.map((tab, i) => (
      <TabBtn
        key={tab.name}
        tab={tab}
        focused={state.index === i}
        onPress={() => navigation.navigate(tab.name)}
      />
    ))}
  </View>
);

const BottomTabNav = () => (
  <Tab.Navigator
    tabBar={p => <CustomTabBar {...p} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Live"      component={LiveScreen} />
    <Tab.Screen name="Ventes"    component={VentesScreen} />
    <Tab.Screen name="Carts"     component={CartsScreen} />
    <Tab.Screen name="Config"    component={ConfigScreen} />
  </Tab.Navigator>
);

const st = StyleSheet.create({
  bar:       { flexDirection: 'row', height: 54, backgroundColor: '#020205' },
  topLine:   { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: C.bOrange },
  tabBtn:    { flex: 1 },
  tabInner:  { flex: 1, alignItems: 'center', justifyContent: 'center', margin: 3, borderRadius: 4, position: 'relative' },
  activeBar: { position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, borderRadius: 1 },
  tabIcon:   { fontSize: 15, marginBottom: 1 },
  tabLabel:  { fontFamily: F, fontSize: 7, letterSpacing: 0.8 },
});

module.exports = BottomTabNav;
  
