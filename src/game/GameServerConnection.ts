import type { GameSync, GameUpdate, Pixel } from "./model/Game";
import mitt from "mitt";

const GAME_SERVER_URL = "http://localhost:3000"
const GAME_SERVER_WS = "ws://localhost:3000"

type Player = { color: string; id: string; score: number };

type GameState = {
  players: Player[];
  map: { width: number; height: number; pixels: string[] };
  roundNumber: number;
}

type GameEvents = {
  connect: boolean,
  state: 'waiting' | 'playing',
  sync: GameSync,
  stop: undefined,
  start: undefined,
  update: GameUpdate['mapChanges']
}

export class GameServerConnection {
  private socket: WebSocket | null = null;
  event = mitt<GameEvents>();
  // map
  width: number = 0;
  height: number = 0;
  pixels: string[] = [];
  // players
  players: { color: string; id: string; score: number }[] = [];
  // round
  roundNumber: number = 0;

  connected: boolean = false;

  connect(): GameServerConnection {
    if (this.socket) {
      this.disconnect();
    }
    const socket = new WebSocket(`${GAME_SERVER_WS}/ws/observer`);
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.connected = true;
      this.event.emit('connect', true);
      console.log('connected');
    });
    socket.addEventListener('close', () => {
      this.connected = false;
      this.event.emit('connect', false);
      console.log('connection close');
    });

    return this;
  }

  async fetchGameState(): Promise<GameSync['state']> {
    try {
      const sync = await this.sync()
      return sync.state
    } catch (e) {
      console.warn(e)
      return 'waiting'
    }
  }

  async sync() {
    const res = await fetch(`${GAME_SERVER_URL}/game-state`);
    const data = await res.json() as GameSync;

    this.handleGameSync(data);

    return data;
  }

  async start() {
    const res = await fetch(`${GAME_SERVER_URL}/start`);
    const data = await res.json() as GameSync;

    this.handleGameSync(data);
    this.event.emit('start');

    return data;
  }

  async stop() {
    const res = await fetch(`${GAME_SERVER_URL}/stop`);
    const data = await res.json() as GameSync;

    this.handleGameSync(data);
    this.event.emit('stop');

    return data;
  }

  private handleGameSync(data: GameSync) {
    this.event.emit('state', data.state);
    this.event.emit('sync', data);
    // map
    this.width = data.map.width;
    this.height = data.map.height;
    this.pixels = data.map.pixels;
    // players
    this.players = data.players;
    // round
    this.roundNumber = data.roundNumber;
  }

  listen(): GameServerConnection {
    if (!this.socket) {
      throw new Error('Socket is not initialized');
    }

    console.log('Listening for messages...');

    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'gameUpdate') {
        this.onGameUpdate(data);
      } else {
        console.warn('Unknown message type:', data.type);
      }
    });

    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this;
  }

  onGameUpdate(event: GameUpdate) {
    try {
      const { round, mapChanges } = event;
      this.roundNumber = round;

      mapChanges.forEach(({ x, y, color }) => {
        this.pixels[y * this.width + x] = color;
      });

      this.event.emit('update', mapChanges);
    } catch (e) {
      console.warn(e);
      return;
    }
  }

  disconnect() {
    this.socket?.close()
    this.socket = null;
    this.event.all.clear();
  }

  toString() {
    return `round ${this.roundNumber}, players: ${this.players.length}, map: ${this.width}x${this.height}`;
  }
}

