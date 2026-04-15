const React = require('react');
const { useEffect } = React;
const { StatusBar } = require('react-native');
const { enableScreens } = require('react-native-screens');
enableScreens(true);
const { GestureHandlerRootView } = require('react-native-gesture-handler');
const { SafeAreaProvider }       = require('react-native-safe-area-context');
const { NavigationContainer }    = require('@react-navigation/native');
const { createStackNavigator }   = require('@react-navigation/stack');
const { C } = require('./constants');

// Screens
const DashboardScreen = require('./screens/DashboardScreen');
const LiveScreen      = require('./screens/LiveScreen');
const VentesScreen    = require('./screens/VentesScreen');
const CartsScreen     = require('./screens/CartsScreen');
const ConfigScreen    = require('./screens/ConfigScreen');

const Stack = createStackNavigator();

// ErrorBoundary
const { Component } = React;
const { View, Text, ScrollView, StyleSheet } = require('react-native');

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error:null, info:null }; }
  componentDidCatch(e, i) { this.setState({ error:e, info:i }); }
  render() {
    if (this.state.error) {
      return (
        <View style={{flex:1,backgroundColor:'#000',padding:20,paddingTop:50}}>
          <Text style={{color:'#FF5722',fontFamily:'monospace',fontSize:16,marginBottom:12}}>💥 CRASH</Text>
          <Text style={{color:'#FF7043',fontFamily:'monospace',fontSize:12,marginBottom:8}}>{this.state.error.toString()}</Text>
          <ScrollView style={{backgroundColor:'#0a0a0f',padding:10,maxHeight:300}}>
            <Text style={{color:'#FF5722',fontFamily:'monospace',fontSize:9}}>
              {this.state.info?.componentStack||''}
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
              dark:true,
              colors:{ primary:C.orange, background:'#000000', card:'#020205', text:'#FFFFFF', border:'rgba(255,87,34,0.5)', notification:C.orange },
            }}
          >
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#000000' },
                animationEnabled: true,
              }}
            >
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Live"      component={LiveScreen}      />
              <Stack.Screen name="Ventes"    component={VentesScreen}    />
              <Stack.Screen name="Carts"     component={CartsScreen}     />
              <Stack.Screen name="Config"    component={ConfigScreen}    />
            </Stack.Navigator>
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

module.exports = App;
                                   
