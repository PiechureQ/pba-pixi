
import mitt from 'mitt';

const GAME_SERVER_WS = 'ws://localhost:3000';

type Player = { color: string; id: string; score: number };

export type AvailableCommand = {
  type: string;
  availableTargets: { x: number; y: number }[];
};

type PlayerTurnEvent = {
  type: 'playerTurn';
  playerId: string;
  turnNumber: number;
  roundNumber: number;
  map: {
    pixels: string[];
    height: number;
    width: number;
  };
  players: Player[];
  availableCommands: AvailableCommand[];
};

type JoinResponse = {
  type: 'joined';
  playerId: string;
  playerColor: string;
};

type GameEvents = {
  connect: boolean;
  playerTurn: PlayerTurnEvent;
  joined: JoinResponse;
};

export class PlayerConnection {
  private socket: WebSocket | null = null;
  public event = mitt<GameEvents>();
  public playerId: string | null = null;
  public playerColor: string | null = null;
  public availableCommands: AvailableCommand[] = [];

  connect(): PlayerConnection {
    if (this.socket) {
      this.disconnect();
    }
    const socket = new WebSocket(`${GAME_SERVER_WS}/ws/player`);
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.event.emit('connect', true);
      console.log('Player connected');
    });

    socket.addEventListener('close', () => {
      this.event.emit('connect', false);
      console.log('Player connection close');
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'playerTurn') {
        // console.log('handle playerTurn')
        this.availableCommands = data.availableCommands;
        this.event.emit('playerTurn', data);
      } else if (data.type === 'joined') {
        this.playerId = data.playerId;
        this.playerColor = data.color;
        this.event.emit('joined', data);
      } else {
        // console.warn('Unknown message type:', data.type);
      }
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this;
  }

  join() {
    console.log('join', this.socket)
    if (!this.socket) {
      throw new Error('Socket is not initialized');
    }
    console.log('join', 'dupa')
    this.socket.send(JSON.stringify({ type: 'join' }));
  }

  sendMove(command: string, targets: { x: number; y: number }[]) {
    console.log('send', command, targets)
    if (!this.socket) {
      throw new Error('Socket is not initialized');
    }
    this.socket.send(JSON.stringify({ type: 'playerMove', command, targets }));
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
