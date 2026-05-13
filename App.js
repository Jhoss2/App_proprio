const React = require('react');
const { useEffect, Component } = React;
const { View, Text, ScrollView, StatusBar, StyleSheet } = require('react-native');

const { enableScreens } = require('react-native-screens');
enableScreens(true);

const { GestureHandlerRootView } = require('react-native-gesture-handler');
const { SafeAreaProvider }       = require('react-native-safe-area-context');
const { NavigationContainer }    = require('@react-navigation/native');
const { createStackNavigator }   = require('@react-navigation/stack');

// Tous les screens en CommonJS — require() direct
const DashboardScreen = require('./screens/DashboardScreen');
const LiveScreen      = require('./screens/LiveScreen');
const VentesScreen    = require('./screens/VentesScreen');
const CartsScreen     = require('./screens/CartsScreen');
const ConfigScreen    = require('./screens/ConfigScreen');

// Interop : module.exports = X ou export default X
const _DS  = DashboardScreen.default || DashboardScreen;
const _LS  = LiveScreen.default      || LiveScreen;
const _VS  = VentesScreen.default    || VentesScreen;
const _CS  = CartsScreen.default     || CartsScreen;
const _CFG = ConfigScreen.default    || ConfigScreen;

const Stack = createStackNavigator();

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error:null, info:null }; }
  componentDidCatch(e, i) { this.setState({ error:e, info:i }); }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex:1, backgroundColor:'#000', padding:20, paddingTop:50 }}>
          <Text style={{ color:'#FF5722', fontFamily:'monospace', fontSize:15, marginBottom:10 }}>
            {'💥 CRASH DÉTECTÉ'}
          </Text>
          <Text style={{ color:'#FF7043', fontFamily:'monospace', fontSize:11, marginBottom:8 }}>
            {this.state.error.toString()}
          </Text>
          <ScrollView style={{ backgroundColor:'#0a0a0f', padding:10, maxHeight:280 }}>
            <Text style={{ color:'#FF5722', fontFamily:'monospace', fontSize:9 }}>
              {this.state.info ? this.state.info.componentStack : ''}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex:1, backgroundColor:'#000000' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary:      '#FF5722',
                background:   '#000000',
                card:         '#020205',
                text:         '#FFFFFF',
                border:       'rgba(255,87,34,0.5)',
                notification: '#FF5722',
              },
            }}>
            <StatusBar barStyle="light-content" backgroundColor="#000000"/>
            <Stack.Navigator
              screenOptions={{
                headerShown:      false,
                cardStyle:        { backgroundColor:'#000000' },
                animationEnabled: true,
              }}>
              <Stack.Screen name="Dashboard" component={_DS}/>
              <Stack.Screen name="Live"      component={_LS}/>
              <Stack.Screen name="Ventes"    component={_VS}/>
              <Stack.Screen name="Carts"     component={_CS}/>
              <Stack.Screen name="Config"    component={_CFG}/>
            </Stack.Navigator>
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

module.exports = App;
            
