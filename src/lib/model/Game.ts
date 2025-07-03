export type GameUpdate = {
  type: 'gameUpdate';
  playerId: string;
  turnNumber: number;
  roundNumber: number;
  mapChanges: Pixel[];
  map: { width: number; height: number; pixels: string[] };
  players: { id: string; name: string; color: string }[];
};

export type Pixel = { x: number; y: number; color: string };
