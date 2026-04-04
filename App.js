const React = require('react');
const { useEffect } = React;
const { View, StyleSheet, StatusBar } = require('react-native');
const { NavigationContainer }        = require('@react-navigation/native');
const { GestureHandlerRootView }     = require('react-native-gesture-handler');
const { SafeAreaProvider }           = require('react-native-safe-area-context');

const BottomTabNav = require('./navigation/BottomTabNav');
const { COLORS }   = require('./constants');

function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary:      COLORS.orange,
              background:   COLORS.bg,
              card:         '#020205',
              text:         COLORS.textPrimary,
              border:       COLORS.borderOrange,
              notification: COLORS.orange,
            },
          }}
        >
          <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
          <BottomTabNav />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
});

module.exports = App;
