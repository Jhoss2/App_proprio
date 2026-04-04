const { Dimensions } = require('react-native');
const { width: W, height: H } = Dimensions.get('window');

const COLORS = {
  bg:           '#000000',
  bgDeep:       '#020205',
  bgPanel:      '#05050a',
  bgCard:       '#0a0a12',

  orange:       '#FF5722',
  orangeGlow:   'rgba(255,87,34,0.15)',
  orangeDim:    'rgba(255,87,34,0.4)',
  orangeBright: '#FF7043',

  cyan:         '#00E5FF',
  cyanDim:      'rgba(0,229,255,0.3)',
  cyanGlow:     'rgba(0,229,255,0.12)',

  amber:        '#FFB300',
  amberDim:     'rgba(255,179,0,0.3)',

  red:          '#D50000',
  redGlow:      'rgba(213,0,0,0.3)',
  redBright:    '#FF1744',

  green:        '#00E676',
  greenDim:     'rgba(0,230,118,0.3)',

  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted:     'rgba(255,255,255,0.25)',
  textOrange:    '#FF5722',
  textCyan:      '#00E5FF',
  textAmber:     '#FFB300',

  borderOrange:  'rgba(255,87,34,0.5)',
  borderCyan:    'rgba(0,229,255,0.4)',
  borderMuted:   'rgba(255,255,255,0.08)',
};

const FONT = { mono: 'monospace' };

const SCREEN_WIDTH  = W;
const SCREEN_HEIGHT = H;
const WEBRTC_SIGNAL_PATH = 'webrtc-signals';

module.exports = { COLORS, FONT, SCREEN_WIDTH, SCREEN_HEIGHT, WEBRTC_SIGNAL_PATH };
