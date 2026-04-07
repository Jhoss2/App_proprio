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
  const scale = useRef(new Animated.Value(1)).current;
  const bg    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.08 : 1, useNativeDriver: true, tension: 200 }),
      Animated.timing(bg,    { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [focused]);
  const bgColor = bg.interpolate({ inputRange: [0,1], outputRange: ['rgba(0,0,0,0)', `${tab.color}15`] });
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Animated.View style={[st.tabInner, { backgroundColor: bgColor, transform: [{ scale }] }]}>
        {focused && <View style={[st.activeBar, { backgroundColor: tab.color }]} />}
        <Text style={[st.tabIcon, { color: focused ? tab.color : C.w25 }]}>{tab.icon}</Text>
        <Text style={[st.tabLabel, { color: focused ? tab.color : C.w25 }]}>{tab.label}</Text>
      </Animated.View>
    </Pressable>
  );
});

const CustomTabBar = ({ state, navigation }) => (
  <View style={st.bar}>
    <View style={st.topLine} />
    {TABS.map((tab, i) => (
      <TabBtn key={tab.name} tab={tab} focused={state.index === i} onPress={() => navigation.navigate(tab.name)} />
    ))}
  </View>
);

const BottomTabNav = () => (
  <Tab.Navigator tabBar={p => <CustomTabBar {...p} />} screenOptions={{ headerShown: false }}>
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
  tabInner:  { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, margin: 3, position: 'relative' },
  activeBar: { position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, borderRadius: 1 },
  tabIcon:   { fontSize: 15, marginBottom: 1 },
  tabLabel:  { fontFamily: F, fontSize: 7, letterSpacing: 0.8 },
});

module.exports = BottomTabNav;
                    
