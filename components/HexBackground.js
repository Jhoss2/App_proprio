const React = require('react');
const { StyleSheet } = require('react-native');
const Svg = require('react-native-svg').default;
const { Defs, Pattern, Path, Rect } = require('react-native-svg');
const { SCREEN_WIDTH, SCREEN_HEIGHT } = require('../constants');

/**
 * Fond en grille hexagonale — style cyberpunk
 * À placer en position absolute derrière le contenu
 */
const HexBackground = ({ opacity = 0.04 }) => (
  <Svg
    width={SCREEN_WIDTH}
    height={SCREEN_HEIGHT}
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <Pattern id="hex" x="0" y="0" width="28" height="32" patternUnits="userSpaceOnUse">
        <Path
          d="M14 2 L26 9 L26 23 L14 30 L2 23 L2 9 Z"
          fill="none"
          stroke="#f97316"
          strokeWidth="0.5"
          opacity={opacity * 25}
        />
      </Pattern>
    </Defs>
    <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#hex)" />
  </Svg>
);

module.exports = HexBackground;
