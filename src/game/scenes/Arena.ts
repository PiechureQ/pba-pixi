import type { Pixel } from '../model/Game';
import { GameEvents } from '../EventBus';
import { Scene } from 'phaser';
import type { AvailableCommand } from '../PlayerConnection';

export class GameIOError extends Error { };

const RED = '#ea0000';
const BORDER = '#000000';
const BORDER_HOVER = '#efefef';
const PIXEL_SIZE = 32;
const CAMERA_SPEED = 20;
const ZOOM_INCREMENT = 0.02;

export class Arena extends Scene {
  private mapWidth = 50;
  private mapHeight = 50;
  private minZoom = 1;
  private maxZoom = 10;

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private bgMesh!: Phaser.GameObjects.Graphics;
  private bgFill!: Phaser.GameObjects.Graphics;
  private hover!: Phaser.GameObjects.Graphics;
  private targetGraphics!: Phaser.GameObjects.Graphics;
  private pixelsLayer!: Phaser.GameObjects.Layer;
  private pixelObjects: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  private lastOver: { x: number, y: number } | null = null;
  private selectedCommand: AvailableCommand['type'] = '';
  private commandTargets: AvailableCommand['availableTargets'] = [];

  constructor() {
    super('Arena');
  }

  create() {
    this.camera = this.cameras.main;
    this.pixelsLayer = this.add.layer().setDepth(100);

    this.setupCamera();
    this.setupInput();

    GameEvents.on('command-selected', command => {
      this.targetGraphics.clear();

      this.selectedCommand = command.type;
      this.setCommandTargets(command.availableTargets);
    })
    GameEvents.on('playerTurn', (data) => {
      if (this.selectedCommand == 'paint') {
        const command = data.availableCommands.find(c => c.type == 'paint');
        if (command) {
          this.setCommandTargets(command.availableTargets)
        }
      }
    })
    GameEvents.on('pixel-clicked', (data) => {
      // temp fix for red border on colored pixels
      this.targetGraphics.clear();
      this.setCommandTargets([]);
    })

    GameEvents.emit('current-scene-ready', this);
  }

  setCommandTargets(targets: AvailableCommand['availableTargets']) {
    targets.forEach((t, i) => {
      const lastTarget = this.commandTargets[i];
      if (!lastTarget || t.x != lastTarget.x || t.y != lastTarget.y) {
        this.drawPixelBorder(this.targetGraphics, 2, t.x, t.y, RED);
      }
    })
    this.commandTargets = targets;
  }

  renderChanges(changes: Pixel[]) {
    changes.forEach(pixel => {
      const key = `${pixel.x},${pixel.y}`;
      const existingPixel = this.pixelObjects.get(key);

      if (existingPixel) {
        // Update existing pixel
        existingPixel.setFillStyle(Phaser.Display.Color.ValueToColor(pixel.color)?.color);
      } else {
        // Create new pixel
        this.createPixel(pixel);
      }
    });
  }

  renderMap(pixels: string[]) {
    for (let x = 0; x < this.mapWidth; x++) {
      for (let y = 0; y < this.mapHeight; y++) {
        const index = x + y * this.mapWidth;
        const pixel = pixels[index];
        if (pixel === '#ffffff') {
          continue
        }

        const key = `${x},${y}`;
        const existingPixel = this.pixelObjects.get(key);

        if (existingPixel) {
          // Update existing pixel
          existingPixel.setFillStyle(Phaser.Display.Color.ValueToColor(pixel)?.color);
        } else {
          // Create new pixel
          this.createPixel({ x, y, color: pixel });
        }
      }
    }
  }

  createMap(mapWidth: number, mapHeight: number, lines: boolean = false) {
    this.setMapSize(mapWidth, mapHeight);
    this.setupCamera();

    const x = 0;
    const y = 0;
    const width = mapWidth * PIXEL_SIZE;
    const height = mapHeight * PIXEL_SIZE;
    const cellSize = PIXEL_SIZE;

    this.pixelsLayer.removeAll(true);
    this.pixelObjects.clear();

    this.bgFill = this.bgFill ? this.bgFill.clear() : this.add.graphics().setDepth(0);
    this.hover = this.hover ? this.hover.clear() : this.add.graphics().setDepth(300);
    this.targetGraphics = this.targetGraphics ? this.targetGraphics.clear() : this.add.graphics().setDepth(200);

    if (this.bgMesh) {
      this.bgMesh.clear()
    } else {
      this.bgMesh = this.add.graphics().setDepth(100);

      this.bgMesh.setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);

      this.bgMesh.on('pointermove', (_pointer: unknown, localX: number, localY: number) => {
        if (!this.lastOver || this.lastOver.x !== x || this.lastOver.y !== y) {
          const x = Math.floor(localX / PIXEL_SIZE);
          const y = Math.floor(localY / PIXEL_SIZE);
          if (!this.lastOver) this.lastOver = { x, y };

          // draw hover pixel border
          this.hover.clear();
          this.drawPixelBorder(this.hover, 2, x, y, BORDER_HOVER);

          // start last over to current hover pixel
          this.lastOver.x = x;
          this.lastOver.y = y;
        }
      })

      this.bgMesh.on('pointerdown', (_pointer: unknown, localX: number, localY: number) => {
        const x = Math.floor(localX / PIXEL_SIZE);
        const y = Math.floor(localY / PIXEL_SIZE);
        console.log(`Clicked pixel at (${x}, ${y})`);
        // Here you might want to emit an event to the game logic
        GameEvents.emit('pixel-clicked', { x, y });
      });
    }

    this.bgMesh.input?.hitArea.setSize(width, height);

    this.bgFill.fillStyle(0xffffff, 1);
    this.bgFill.fillRect(0, 0, width, height);

    if (lines) {
      // Narysuj siatkę z czarnych linii
      this.bgMesh.lineStyle(1, 0x000000, 1); // czarna linia

      // Pionowe linie
      for (let i = x; i <= x + width; i += cellSize) {
        this.bgMesh.beginPath();
        this.bgMesh.moveTo(i, y);
        this.bgMesh.lineTo(i, y + height);
        this.bgMesh.strokePath();
      }

      // Poziome linie
      for (let j = y; j <= y + height; j += cellSize) {
        this.bgMesh.beginPath();
        this.bgMesh.moveTo(x, j);
        this.bgMesh.lineTo(x + width, j);
        this.bgMesh.strokePath();
      }
    }
  }

  private drawPixelBorder(graphics: Phaser.GameObjects.Graphics, width: number, x: number, y: number, color: string, alpha: number = 1) {
    const validColor = Phaser.Display.Color.ValueToColor(color)?.color;
    if (validColor == undefined) {
      return 'color is not valid';
    }
    graphics.lineStyle(width, validColor, alpha); // czarna linia

    // Pionowe linie
    graphics.beginPath();
    const realX = x * PIXEL_SIZE;
    const realY = y * PIXEL_SIZE;
    graphics.moveTo(realX, realY);
    graphics.lineTo(realX + PIXEL_SIZE, realY);
    graphics.lineTo(realX + PIXEL_SIZE, realY + PIXEL_SIZE);
    graphics.lineTo(realX, realY + PIXEL_SIZE);
    graphics.lineTo(realX, realY);
    graphics.strokePath();
  }

  private createPixel(pixelData: Pixel, lines: boolean = false) {
    const { x, y, color } = pixelData;
    const pixelX = x * PIXEL_SIZE;
    const pixelY = y * PIXEL_SIZE;
    const pixelColor = Phaser.Display.Color.ValueToColor(color)?.color;
    const key = `${x},${y}`;

    const pixel = this.add
      .rectangle(pixelX, pixelY, PIXEL_SIZE, PIXEL_SIZE, pixelColor)
      .setOrigin(0, 0);

    if (lines)
      pixel.setStrokeStyle(1, 0x111111)

    this.pixelsLayer.add(pixel);
    this.pixelObjects.set(key, pixel);
  }

  setMapSize(width: number, height: number) {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  setupCamera() {
    const mapWidthPixels = this.mapWidth * PIXEL_SIZE;
    const mapHeightPixels = this.mapHeight * PIXEL_SIZE;
    const cameraPaddingX = 0.1 * mapWidthPixels;
    const cameraPaddingY = 0.1 * mapHeightPixels;

    // Rozmiar okna gry (viewport)
    const viewportWidth = this.camera.width;
    const viewportHeight = this.camera.height;

    // Całkowity obszar, który ma być widoczny (mapa + padding)
    const totalWidth = mapWidthPixels + 2 * cameraPaddingX;
    const totalHeight = mapHeightPixels + 2 * cameraPaddingY;

    // Oblicz odpowiedni zoom, żeby mapa + padding się zmieściła
    const zoomX = viewportWidth / totalWidth;
    const zoomY = viewportHeight / totalHeight;
    const zoom = Math.min(zoomX, zoomY);

    this.minZoom = zoom
    this.maxZoom = Math.min(viewportHeight / (8 * PIXEL_SIZE), viewportWidth / (8 * PIXEL_SIZE));
    this.camera.setZoom(zoom);

    // Ustaw bounds kamery na rozmiar mapy (bez paddingu, żeby nie wyjść poza świat)
    this.camera.setBounds(0 - cameraPaddingX, 0 - cameraPaddingY, totalWidth, totalHeight);

    // Centrowanie na środku mapy
    this.camera.centerToBounds();
  }

  setupInput() {
    if (!this.input.keyboard) {
      throw new GameIOError('Keyboard is not available');
    }
    this.keys = this.input.keyboard.addKeys('W,A,S,D,Q,E') as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number, _deltaZ: number) => {
      let newZoom;
      if (deltaY < 0) {
        newZoom = this.camera.zoom + ZOOM_INCREMENT * 5;
      } else {
        newZoom = this.camera.zoom - ZOOM_INCREMENT * 5;
      }
      this.camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
    });
  }

  update() {
    if (this.keys.W.isDown) {
      this.camera.scrollY -= CAMERA_SPEED / this.camera.zoom;
    }
    if (this.keys.S.isDown) {
      this.camera.scrollY += CAMERA_SPEED / this.camera.zoom;
    }
    if (this.keys.A.isDown) {
      this.camera.scrollX -= CAMERA_SPEED / this.camera.zoom;
    }
    if (this.keys.D.isDown) {
      this.camera.scrollX += CAMERA_SPEED / this.camera.zoom;
    }

    let newZoom;
    if (this.keys.Q.isDown) {
      newZoom = this.camera.zoom + ZOOM_INCREMENT;
    } else if (this.keys.E.isDown) {
      newZoom = this.camera.zoom - ZOOM_INCREMENT;
    }
    if (newZoom)
      this.camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}
