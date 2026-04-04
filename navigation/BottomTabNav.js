const React = require('react');
const { useRef, useEffect, memo } = React;
const { View, Text, Pressable, StyleSheet, Animated, Easing } = require('react-native');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
const { COLORS, FONT } = require('../constants');

const DashboardScreen = require('../screens/DashboardScreen');
const LiveScreen      = require('../screens/LiveScreen');
const VentesScreen    = require('../screens/VentesScreen');
const CartsScreen     = require('../screens/CartsScreen');
const ConfigScreen    = require('../screens/ConfigScreen');

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', label: 'HQ',      icon: '⊞', color: COLORS.orange },
  { name: 'Live',      label: 'LIVE',    icon: '◉', color: COLORS.red    },
  { name: 'Ventes',    label: 'SIGNAL',  icon: '≋', color: COLORS.cyan   },
  { name: 'Carts',     label: 'MECH',    icon: '⚙', color: COLORS.amber  },
  { name: 'Config',    label: 'SYS',     icon: '≡', color: COLORS.textSecondary },
];

const TabButton = memo(({ tab, isFocused, onPress }) => {
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.timing(glowAnim,  { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.spring(scaleAnim, { toValue: 1.1, useNativeDriver: true, tension: 200 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(glowAnim,  { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.spring(scaleAnim, { toValue: 1,   useNativeDriver: true }),
      ]).start();
    }
  }, [isFocused]);

  const bgColor = glowAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', `${tab.color}18`] });
  const textColor = isFocused ? tab.color : COLORS.textMuted;

  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Animated.View style={[styles.tabInner, { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] }]}>
        {/* Ligne lumineuse en haut quand actif */}
        {isFocused && (
          <Animated.View style={[styles.activeBar, { backgroundColor: tab.color, shadowColor: tab.color }]} />
        )}
        <Text style={[styles.tabIcon, { color: textColor }]}>{tab.icon}</Text>
        <Text style={[styles.tabLabel, { color: textColor }]}>{tab.label}</Text>
      </Animated.View>
    </Pressable>
  );
});

const CustomTabBar = ({ state, navigation }) => (
  <View style={styles.tabBar}>
    <View style={styles.tabBarGlow} />
    {TABS.map((tab, i) => (
      <TabButton
        key={tab.name}
        tab={tab}
        isFocused={state.index === i}
        onPress={() => navigation.navigate(tab.name)}
      />
    ))}
  </View>
);

const BottomTabNav = () => (
  <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Live"      component={LiveScreen} />
    <Tab.Screen name="Ventes"    component={VentesScreen} />
    <Tab.Screen name="Carts"     component={CartsScreen} />
    <Tab.Screen name="Config"    component={ConfigScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', height: 56,
    backgroundColor: '#020205',
    borderTopWidth: 0, position: 'relative',
  },
  tabBarGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: COLORS.borderOrange,
    shadowColor: COLORS.orange, shadowRadius: 8, shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  tabBtn:   { flex: 1 },
  tabInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, margin: 3, position: 'relative' },
  activeBar: {
    position: 'absolute', top: 0, left: '15%', right: '15%', height: 2,
    borderRadius: 1, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  tabIcon:  { fontSize: 16, marginBottom: 2 },
  tabLabel: { fontFamily: FONT.mono, fontSize: 7, letterSpacing: 1 },
});

module.exports = BottomTabNav;
