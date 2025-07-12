import { Scene } from 'phaser';
import mitt from 'mitt';

export type GameEvent = {
  'current-scene-ready': Scene,
  'pixel-clicked': { x: number; y: number };
}

export const GameEvents = mitt<GameEvent>();
