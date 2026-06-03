/**
 * metro.config.js — Ninja's Corp
 * Bloque les anciens fichiers problématiques encore présents dans le repo
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bloquer tous les anciens fichiers qui causent des erreurs Babel
// même s'ils ne sont pas importés, Metro peut tenter de les parser
config.resolver.blockList = [
  // Anciens composants avec react-native-svg / ES6 imports
  /components[\\/]TopBar\.js$/,
  /components[\\/]SysLog\.js$/,
  /components[\\/]MainGauge\.js$/,
  /components[\\/]CartColumn\.js$/,
  /components[\\/]BottomBands\.js$/,
  // Utilitaires obsolètes
  /utils[\\/]SvgComponents\.js$/,
  // Anciens screens (remplacés par HTML)
  /screens[\\/]DashboardScreen\.js$/,
  /screens[\\/]ConfigScreen\.js$/,
  // Anciens modules HTML (remplacés par JSON)
  /assets[\\/].*_html\.js$/,
  /assets[\\/]dashboard\.html$/,
  // Hooks Firebase (non utilisés par App.js)
  /hooks[\\/]useFirestore\.js$/,
];

module.exports = config;
