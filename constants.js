const { Dimensions } = require('react-native');
const { width: W, height: H } = Dimensions.get('window');

const C = {
  bg:        '#000000',
  bgCard:    '#0a0a0f',
  bgPanel:   '#05050a',
  orange:    '#FF5722',
  orangeD:   'rgba(255,87,34,0.18)',
  orangeB:   '#FF7043',
  cyan:      '#00E5FF',
  cyanD:     'rgba(0,229,255,0.18)',
  amber:     '#FFB300',
  amberD:    'rgba(255,179,0,0.2)',
  red:       '#FF1744',
  redD:      'rgba(255,23,68,0.2)',
  green:     '#00E676',
  white:     '#FFFFFF',
  w60:       'rgba(255,255,255,0.6)',
  w25:       'rgba(255,255,255,0.25)',
  w08:       'rgba(255,255,255,0.08)',
  bOrange:   'rgba(255,87,34,0.5)',
  bCyan:     'rgba(0,229,255,0.4)',
};

const F = 'monospace';
const W2 = W;
const H2 = H;
const SIGNAL_PATH = 'webrtc-signals';

module.exports = { C, F, W: W2, H: H2, SIGNAL_PATH };
