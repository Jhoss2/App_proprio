const React = require('react');
const { View, Text, Pressable, StyleSheet, Animated } = require('react-native');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
const { COLORS, FONT, BOTTOM_TAB_HEIGHT } = require('../constants');

const DashboardScreen = require('../screens/DashboardScreen');
const LiveScreen      = require('../screens/LiveScreen');
const VentesScreen    = require('../screens/VentesScreen');
const CartsScreen     = require('../screens/CartsScreen');
const ConfigScreen    = require('../screens/ConfigScreen');

const Tab = createBottomTabNavigator();

/* ── Icônes SVG inline ── */
const Svg = require('react-native-svg').default;
const { Path, Rect, Circle, Polyline } = require('react-native-svg');

const IconHQ = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.5"/>
    <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="1.5"/>
    <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="1.5"/>
    <Rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

const IconLive = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

const IconVentes = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

const IconCarts = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke={color} strokeWidth="1.5"/>
    <Circle cx="9" cy="19" r="1" stroke={color} strokeWidth="1.5"/>
    <Circle cx="17" cy="19" r="1" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

const IconConfig = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

/* ── Tab bar personnalisée ── */
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: 'Dashboard', label: 'HQ',     Icon: IconHQ },
    { name: 'Live',      label: 'LIVE',   Icon: IconLive },
    { name: 'Ventes',    label: 'VENTES', Icon: IconVentes },
    { name: 'Carts',     label: 'CARTS',  Icon: IconCarts },
    { name: 'Config',    label: 'CONFIG', Icon: IconConfig },
  ];

  return (
    <View style={styles.tabBar}>
      {/* Ligne lumineuse au dessus */}
      <View style={styles.topGlow} />

      {tabs.map((tab, i) => {
        const isFocused = state.index === i;
        const color = isFocused ? COLORS.orange : COLORS.orangeDim;

        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={[styles.tabItem, isFocused && styles.tabItemActive]}
          >
            {isFocused && <View style={styles.activeGlow} />}
            <tab.Icon color={isFocused ? COLORS.orange : '#f9731650'} />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const BottomTabNav = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Live"      component={LiveScreen} />
    <Tab.Screen name="Ventes"    component={VentesScreen} />
    <Tab.Screen name="Carts"     component={CartsScreen} />
    <Tab.Screen name="Config"    component={ConfigScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0d',
    height: BOTTOM_TAB_HEIGHT,
    borderTopWidth: 0,
    position: 'relative',
  },
  topGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: '#f9731640',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: '#f9731608',
  },
  activeGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    fontFamily: FONT.mono,
    fontSize: 8,
    color: '#f9731650',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: COLORS.orange,
  },
});

module.exports = BottomTabNav;
