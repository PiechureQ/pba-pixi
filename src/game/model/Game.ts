export type GameSync = {
  state: 'waiting' | 'playing';
  roundNumber: number;
  map: { width: number; height: number; pixels: string[] };
  players: { id: string; score: number; color: string }[];
};

export type GameUpdate = {
  type: 'gameUpdate';
  round: number;
  mapChanges: Pixel[];
};

export type Pixel = { x: number; y: number; color: string };
