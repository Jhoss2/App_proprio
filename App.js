import React, { useEffect, Component } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
enableScreens(true);
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider }       from 'react-native-safe-area-context';
import { NavigationContainer }    from '@react-navigation/native';
import { createStackNavigator }   from '@react-navigation/stack';

import DashboardScreen from './screens/DashboardScreen';

// Screens CJS — require avec fallback .default
const _Live    = require('./screens/LiveScreen');
const _Ventes  = require('./screens/VentesScreen');
const _Carts   = require('./screens/CartsScreen');
const _Config  = require('./screens/ConfigScreen');

const LiveScreen    = _Live.default    || _Live;
const VentesScreen  = _Ventes.default  || _Ventes;
const CartsScreen   = _Carts.default   || _Carts;
const ConfigScreen  = _Config.default  || _Config;

const Stack = createStackNavigator();

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error:null, info:null }; }
  componentDidCatch(e, i) { this.setState({ error:e, info:i }); }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex:1, backgroundColor:'#000', padding:20, paddingTop:50 }}>
          <Text style={{ color:'#FF5722', fontFamily:'monospace', fontSize:16, marginBottom:12 }}>💥 CRASH DÉTECTÉ</Text>
          <Text style={{ color:'#FF7043', fontFamily:'monospace', fontSize:12, marginBottom:8 }}>
            {this.state.error.toString()}
          </Text>
          <ScrollView style={{ backgroundColor:'#0a0a0f', padding:10, maxHeight:300 }}>
            <Text style={{ color:'#FF5722', fontFamily:'monospace', fontSize:9 }}>
              {this.state.info?.componentStack || ''}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => {
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
                headerShown:     false,
                cardStyle:       { backgroundColor:'#000000' },
                animationEnabled: true,
              }}>
              <Stack.Screen name="Dashboard"  component={DashboardScreen}/>
              <Stack.Screen name="Live"       component={LiveScreen}/>
              <Stack.Screen name="Ventes"     component={VentesScreen}/>
              <Stack.Screen name="Carts"      component={CartsScreen}/>
              <Stack.Screen name="Config"     component={ConfigScreen}/>
            </Stack.Navigator>
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
              
