const React = require('react');
const { useEffect } = React;
const { StatusBar, StyleSheet } = require('react-native');
const { GestureHandlerRootView } = require('react-native-gesture-handler');
const { SafeAreaProvider }       = require('react-native-safe-area-context');
const { NavigationContainer }    = require('@react-navigation/native');
const BottomTabNav = require('./navigation/BottomTabNav');
const { C } = require('./constants');

function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaProvider>
        <NavigationContainer theme={{
          dark: true,
          colors: { primary: C.orange, background: C.bg, card: '#020205', text: C.white, border: C.bOrange, notification: C.orange },
        }}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <BottomTabNav />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

module.exports = App;
