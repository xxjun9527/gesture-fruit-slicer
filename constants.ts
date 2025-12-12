export const GRAVITY = 0.25;
export const FRICTION = 0.99;
export const BOMB_PROBABILITY = 0; // 10% chance to spawn a bomb
export const INITIAL_SPAWN_RATE = 700; // ms
export const MIN_SPAWN_RATE = 200; // ms
export const FRUIT_RADIUS = 90; // Doubled size (was 45)
export const MAX_LIVES = 10; // Increased lives (was 3)
export const TRAIL_LENGTH = 10;
export const CUT_THRESHOLD = 30; // Pixel distance to register a "move" for cutting

// Combo & Juice Settings
export const COMBO_WINDOW = 300; // ms window to chain hits
export const SHAKE_INTENSITY_BOMB = 20;
export const SHAKE_INTENSITY_COMBO = 10;
export const SHAKE_DECAY = 0.9;

// Cute Colors
export const TRAIL_COLOR_LEFT = '#38bdf8'; // Sky Blue
export const TRAIL_COLOR_RIGHT = '#f472b6'; // Pink
export const BOMB_COLOR = '#374151'; // Dark Grey
export const PARTICLE_COUNT = 12;

// Built-in assets (SVGs converted to Data URI for portability)
const svgToDataUri = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

// Cartoony SVGs with thicker strokes and simpler shapes
const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 45 Q30 45 30 65 Q30 95 50 95 Q70 95 70 65 Q70 45 50 45" fill="#ff6b6b" stroke="#c92a2a" stroke-width="3"/>
  <circle cx="35" cy="55" r="5" fill="white" opacity="0.5"/>
  <path d="M50 45 Q50 30 60 20" stroke="#86efac" stroke-width="4" fill="none"/>
  <path d="M60 20 Q75 20 65 35" fill="#4ade80" stroke="#22c55e" stroke-width="2"/>
</svg>`;

const ORANGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
  <circle cx="35" cy="35" r="8" fill="white" opacity="0.4"/>
  <path d="M50 10 L50 15" stroke="#d97706" stroke-width="3"/>
  <path d="M50 10 Q60 5 60 15" fill="#4ade80" stroke="#22c55e" stroke-width="2"/>
</svg>`;

const WATERMELON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#22c55e" stroke="#14532d" stroke-width="3"/>
  <path d="M20 50 Q50 20 80 50 Q50 80 20 50" fill="#15803d" opacity="0.3"/>
  <path d="M30 30 Q50 60 70 30" fill="none" stroke="#86efac" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// A cartoony bomb with a face
const BOMB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="55" r="35" fill="#374151" stroke="#111827" stroke-width="3"/>
  <path d="M50 20 L50 30" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <path d="M48 18 L52 12 L54 16 L58 14" stroke="#ef4444" stroke-width="2" fill="none"/>
  <!-- Angry Face -->
  <path d="M35 50 L42 55" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <path d="M65 50 L58 55" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`;

// A simple ink splatter shape
export const SPLATTER_PATH = "M50 35 C 40 10, 10 40, 35 50 C 10 60, 40 90, 50 65 C 60 90, 90 60, 65 50 C 90 40, 60 10, 50 35 Z";

export const DEFAULT_FRUITS = [
  { id: 'apple', src: svgToDataUri(APPLE_SVG), color: '#ff6b6b' },
  { id: 'orange', src: svgToDataUri(ORANGE_SVG), color: '#fbbf24' },
  { id: 'watermelon', src: svgToDataUri(WATERMELON_SVG), color: '#22c55e' },
];

export const BOMB_IMAGE_SRC = svgToDataUri(BOMB_SVG);
