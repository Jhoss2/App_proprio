const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { COLORS, FONT } = require('../constants');

const StatBadge = ({ label, value, unit = '', accent = false }) => (
  <View style={[styles.badge, accent && styles.badgeAccent]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, accent && styles.valueAccent]}>
      {value}<Text style={styles.unit}>{unit}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  badgeAccent: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeGlow,
  },
  label: {
    fontFamily: FONT.mono,
    fontSize: 9,
    color: COLORS.orangeFade,
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontFamily: FONT.mono,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  valueAccent: {
    color: COLORS.orange,
  },
  unit: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

module.exports = StatBadge;
