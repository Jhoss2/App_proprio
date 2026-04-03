const React = require('react');
const { useRef, useEffect } = React;
const { View, Animated, StyleSheet } = require('react-native');
const { COLORS } = require('../constants');

const LedIndicator = ({ status = 'online', size = 8 }) => {
  const anim = useRef(new Animated.Value(1)).current;

  const color = status === 'online'  ? COLORS.online
              : status === 'offline' ? COLORS.offline
              : COLORS.warning;

  useEffect(() => {
    if (status === 'offline') return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.15, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [status]);

  return (
    <Animated.View
      style={[
        styles.led,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: anim,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: size,
          elevation: 4,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  led: {},
});

module.exports = LedIndicator;
