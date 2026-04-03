const React = require('react');
const { useRef, useEffect } = React;
const { View, StyleSheet, Animated } = require('react-native');
const { COLORS } = require('../constants');

/**
 * GlowCard — conteneur carte style cyberpunk
 * Bordure orange qui pulse doucement
 */
const GlowCard = ({ children, style, glowIntensity = 1 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, `rgba(249,115,22,${0.6 * glowIntensity})`],
  });

  return (
    <Animated.View style={[styles.card, { borderColor }, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
});

module.exports = GlowCard;
