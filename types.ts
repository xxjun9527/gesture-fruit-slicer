export type Point = {
  x: number;
  y: number;
};

export type Vector = {
  x: number;
  y: number;
};

export enum GameState {
  MENU,
  LOADING_VISION,
  PLAYING,
  GAME_OVER
}

export interface FruitConfig {
  id: string;
  image: HTMLImageElement; // Pre-loaded image
  color: string; // Fallback color for particles
}

export interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  type: 'fruit' | 'bomb' | 'debris';
  config?: FruitConfig; // Only for fruits
  isSliced: boolean;
  lifeTime: number; // For clean up
  debrisData?: {
    cutAngle: number;
    side: -1 | 1; // -1 for left/bottom, 1 for right/top relative to cut
  };
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface HandTrail {
  id: string; // 'Left' or 'Right'
  points: Point[];
  color: string;
}

export interface GameSettings {
  useCustomImages: boolean;
  customImages: string[]; // Data URLs
}

// Visual Effects
export interface Splatter {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  opacity: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 1.0 to 0.0
  scale: number;
  velocity: { x: number, y: number };
}