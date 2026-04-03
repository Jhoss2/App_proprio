const { Dimensions } = require('react-native');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Charte graphique Ninja's Corp ──────────────────────
const COLORS = {
  // Fonds
  bg:         '#09090b',   // noir profond principal
  bgCard:     '#0d0d10',   // carte légèrement plus claire
  bgInput:    '#111116',   // champs de saisie

  // Orange (couleur primaire)
  orange:     '#f97316',
  orangeDim:  '#f9731640', // 25% opacité
  orangeGlow: '#f9731620', // 12% opacité (halo)
  orangeFade: '#f9731680', // 50% opacité

  // Textes
  textPrimary:   '#ffffff',
  textSecondary: '#ffffff80',
  textMuted:     '#ffffff40',

  // États
  online:  '#22c55e',
  offline: '#ef4444',
  warning: '#f59e0b',

  // Bords
  border:      '#f9731630',
  borderActive:'#f97316',
};

// ── Typographie monospace (style terminal/cyberpunk) ──
const FONT = {
  mono: 'monospace',
};

// ── Animations ─────────────────────────────────────────
const GLOW_PULSE = {
  duration: 2000,
  easing: 'ease-in-out',
};

// ── Dimensions ─────────────────────────────────────────
const BOTTOM_TAB_HEIGHT = 60;
const STATUS_BAR_HEIGHT = 44;

// ── Firebase Realtime DB — clé de signalisation WebRTC ─
const WEBRTC_SIGNAL_PATH = 'webrtc-signals';

module.exports = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  COLORS,
  FONT,
  GLOW_PULSE,
  BOTTOM_TAB_HEIGHT,
  STATUS_BAR_HEIGHT,
  WEBRTC_SIGNAL_PATH,
};
