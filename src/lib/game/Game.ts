import { GAME_SERVER_WS } from "$lib/const";
import type { GameUpdate, Pixel } from "$lib/model/Game";
import { Application, Container, Graphics } from "pixi.js";

let lastMap: string[] | undefined = undefined;

export class Game {
  private socket: WebSocket | null = null;
  private pixiApp: Application | null = null;
  private mainContainer: Container | null = null;
  private pixelGraphics: Graphics | null = null;
  width: number = 10;
  height: number = 10;
  readonly pixelSize: number = 10;
  connected: boolean = false;

  rateLimit: number = 5; // 60 FPS

  async initApp(pixiContent: HTMLDivElement): Promise<Game> {
    const app = new Application();
    await app.init({
      backgroundColor: 0x0f0f0f,
      resizeTo: pixiContent
    });

    pixiContent.appendChild(app.canvas as HTMLCanvasElement);

    // Create and add a container to the stage
    const container = new Container();
    app.stage.addChild(container);

    // Use a single Graphics object to draw all pixels
    const pixelGraphics = new Graphics();
    container.removeChildren();
    container.addChild(pixelGraphics);

    this.pixiApp = app;
    this.mainContainer = container;
    this.pixelGraphics = pixelGraphics;

    return this;
  }

  connect(): Game {
    const socket = new WebSocket(`${GAME_SERVER_WS}/ws/observer`);
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.connected = true;
      console.log('connected');
    });
    socket.addEventListener('close', () => {
      this.connected = false;
      console.log('connection close');
    });

    return this;
  }

  listen(): Game {
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
      if (event.roundNumber % this.rateLimit === 0) {
        const { map, mapChanges } = event;
        const { width, height } = map;

        this.setMapSize(width, height);

        this.renderMap(map);
      }
    } catch (e) {
      console.warn(e);
      return;
    }
  }

  setMapSize(width: number, height: number) {
    if (!this.pixiApp || !this.mainContainer) {
      console.warn('Pixi app or main container is not initialized');
      return;
    }
    this.mainContainer.x = this.pixiApp.screen.width / 2 - (width * this.pixelSize) / 2;
    this.mainContainer.y = this.pixiApp.screen.height / 2 - (height * this.pixelSize) / 2;
  }

  renderMap(map: GameUpdate['map']) {
    map.pixels.forEach((pixel, index) => {
      const x = index % map.width;
      const y = Math.floor(index / map.width);
      const color = pixel;

      if (lastMap == undefined || lastMap[index] !== color) {
        try {
          this.pixelGraphics?.fill(color.replace('#ffffff', '#0a0a0a')).rect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
        } catch (e) {
          console.log('e', e);
        }
      }
    });
    lastMap = map.pixels;
  }

  renderChanges(mapChanges: Pixel[]) {
    mapChanges.forEach(({ x, y, color }) => {
      this.pixelGraphics?.fill(color).rect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    });
  }

  destroy() {
    this.socket?.close()
  }
}

