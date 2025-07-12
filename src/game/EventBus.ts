import { Scene } from 'phaser';
import mitt from 'mitt';
import type { AvailableCommand, PlayerTurnEvent } from './PlayerConnection';

export type GameEvent = {
  'current-scene-ready': Scene,
  'pixel-clicked': { x: number; y: number };
  'command-selected': AvailableCommand;
  'playerTurn': PlayerTurnEvent;
}

export const GameEvents = mitt<GameEvent>();
