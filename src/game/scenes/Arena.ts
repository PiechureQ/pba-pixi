import type { Pixel } from '../model/Game';
import { GameEvents } from '../EventBus';
import { Scene } from 'phaser';

export class GameIOError extends Error { };

export class Arena extends Scene {
  private mapWidth = 50;
  private mapHeight = 50;
  private readonly PIXEL_SIZE = 32;
  private readonly CAMERA_SPEED = 20;
  private readonly ZOOM_INCREMENT = 0.02;
  private minZoom = 1;
  private maxZoom = 10;

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private bg!: Phaser.GameObjects.Graphics;
  private bgFill!: Phaser.GameObjects.Graphics;
  private pixelsLayer!: Phaser.GameObjects.Layer;
  private pixelObjects: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  private lastOver: { x: number, y: number } | null = null;

  constructor() {
    super('Arena');
  }

  create() {
    this.camera = this.cameras.main;
    this.pixelsLayer = this.add.layer().setDepth(100);

    this.setupCamera();
    this.setupInput();

    GameEvents.emit('current-scene-ready', this);
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
    const width = mapWidth * this.PIXEL_SIZE;
    const height = mapHeight * this.PIXEL_SIZE;
    const cellSize = this.PIXEL_SIZE;

    this.pixelsLayer.removeAll(true);
    this.pixelObjects.clear();

    if (this.bg) {
      this.bg.clear();
    } else {
      this.bg = this.add.graphics().setDepth(100);
      this.bgFill = this.add.graphics().setDepth(0);
      this.bg.setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);

      this.bg.on('pointermove', (_pointer: unknown, localX: number, localY: number) => {
        if (!this.lastOver || this.lastOver.x !== x || this.lastOver.y !== y) {
          const x = Math.floor(localX / this.PIXEL_SIZE);
          const y = Math.floor(localY / this.PIXEL_SIZE);
          if (!this.lastOver) this.lastOver = { x, y };

          const { x: lastx, y: lasty } = this.lastOver;

          this.bg.lineStyle(1, 0x000000, 1); // czarna linia

          // Pionowe linie
          this.bg.beginPath();
          let realX = lastx * this.PIXEL_SIZE;
          let realY = lasty * this.PIXEL_SIZE;
          this.bg.moveTo(realX, realY);
          this.bg.lineTo(realX + this.PIXEL_SIZE, realY);
          this.bg.lineTo(realX + this.PIXEL_SIZE, realY + this.PIXEL_SIZE);
          this.bg.lineTo(realX, realY + this.PIXEL_SIZE);
          this.bg.lineTo(realX, realY);
          this.bg.strokePath();

          // Narysuj siatkę z czarnych linii
          this.bg.lineStyle(2, 0xffffff, 1); // czarna linia

          // Pionowe linie
          this.bg.beginPath();
          realX = x * this.PIXEL_SIZE;
          realY = y * this.PIXEL_SIZE;
          this.bg.moveTo(realX, realY);
          this.bg.lineTo(realX + this.PIXEL_SIZE, realY);
          this.bg.lineTo(realX + this.PIXEL_SIZE, realY + this.PIXEL_SIZE);
          this.bg.lineTo(realX, realY + this.PIXEL_SIZE);
          this.bg.lineTo(realX, realY);
          this.bg.strokePath();

          this.lastOver.x = x;
          this.lastOver.y = y;
        }
      })

      this.bg.on('pointerdown', (_pointer: unknown, localX: number, localY: number) => {
        const x = Math.floor(localX / this.PIXEL_SIZE);
        const y = Math.floor(localY / this.PIXEL_SIZE);
        console.log(`Clicked pixel at (${x}, ${y})`);
        // Here you might want to emit an event to the game logic
        GameEvents.emit('pixel-clicked', { x, y });
      });
    }

    this.bg.input?.hitArea.setSize(width, height);

    this.bgFill.fillStyle(0xffffff, 1);
    this.bgFill.fillRect(0, 0, width, height);

    if (lines) {
      // Narysuj siatkę z czarnych linii
      this.bg.lineStyle(1, 0x000000, 1); // czarna linia

      // Pionowe linie
      for (let i = x; i <= x + width; i += cellSize) {
        this.bg.beginPath();
        this.bg.moveTo(i, y);
        this.bg.lineTo(i, y + height);
        this.bg.strokePath();
      }

      // Poziome linie
      for (let j = y; j <= y + height; j += cellSize) {
        this.bg.beginPath();
        this.bg.moveTo(x, j);
        this.bg.lineTo(x + width, j);
        this.bg.strokePath();
      }
    }
  }

  private createPixel(pixelData: Pixel, lines: boolean = false) {
    const { x, y, color } = pixelData;
    const pixelX = x * this.PIXEL_SIZE;
    const pixelY = y * this.PIXEL_SIZE;
    const pixelColor = Phaser.Display.Color.ValueToColor(color)?.color;
    const key = `${x},${y}`;

    const pixel = this.add
      .rectangle(pixelX, pixelY, this.PIXEL_SIZE, this.PIXEL_SIZE, pixelColor)
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
    const mapWidthPixels = this.mapWidth * this.PIXEL_SIZE;
    const mapHeightPixels = this.mapHeight * this.PIXEL_SIZE;
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
    this.maxZoom = Math.min(viewportHeight / (8 * this.PIXEL_SIZE), viewportWidth / (8 * this.PIXEL_SIZE));
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

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
      let newZoom;
      if (deltaY < 0) {
        newZoom = this.camera.zoom + this.ZOOM_INCREMENT * 5;
      } else {
        newZoom = this.camera.zoom - this.ZOOM_INCREMENT * 5;
      }
      this.camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
    });
  }

  update() {
    if (this.keys.W.isDown) {
      this.camera.scrollY -= this.CAMERA_SPEED / this.camera.zoom;
    }
    if (this.keys.S.isDown) {
      this.camera.scrollY += this.CAMERA_SPEED / this.camera.zoom;
    }
    if (this.keys.A.isDown) {
      this.camera.scrollX -= this.CAMERA_SPEED / this.camera.zoom;
    }
    if (this.keys.D.isDown) {
      this.camera.scrollX += this.CAMERA_SPEED / this.camera.zoom;
    }

    let newZoom;
    if (this.keys.Q.isDown) {
      newZoom = this.camera.zoom + this.ZOOM_INCREMENT;
    } else if (this.keys.E.isDown) {
      newZoom = this.camera.zoom - this.ZOOM_INCREMENT;
    }
    if (newZoom)
      this.camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}
