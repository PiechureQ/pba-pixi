import type { Pixel } from '../model/Game';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameIOError extends Error { };

export class Arena extends Scene {
  private mapWidth = 50;
  private mapHeight = 50;
  private readonly PIXEL_SIZE = 32;
  private readonly CAMERA_SPEED = 10;
  private readonly ZOOM_INCREMENT = 0.02;

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private pixelsLayer!: Phaser.GameObjects.Layer;
  private pixelObjects: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor() {
    super('Arena');
  }

  create() {
    this.camera = this.cameras.main;
    this.pixelsLayer = this.add.layer();

    this.setupCamera();
    this.setupInput();

    EventBus.emit('current-scene-ready', this);
  }

  renderChanges(changes: Pixel[]) {
    if (changes.length > 0) {
      console.log('changes', changes);
    }
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
        const key = `${x},${y}`;
        const existingPixel = this.pixelObjects.get(key);

        const index = x + y * this.mapWidth;
        const pixel = pixels[index];
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

  createMap(mapWidth: number, mapHeight: number, pixels: string[]) {
    this.setMapSize(mapWidth, mapHeight);

    this.pixelsLayer.removeAll(true);
    this.pixelObjects.clear();

    for (let x = 0; x < this.mapWidth; x++) {
      for (let y = 0; y < this.mapHeight; y++) {
        this.createPixel({ x, y, color: pixels[x + y * this.mapWidth] });
      }
    }
  }

  private createPixel(pixelData: Pixel) {
    const { x, y, color } = pixelData;
    const pixelX = x * this.PIXEL_SIZE;
    const pixelY = y * this.PIXEL_SIZE;
    // const pixelColor = Phaser.Display.Color.ValueToColor(color)?.color;
    const pixelColor = Phaser.Display.Color.ValueToColor('#afafaf')?.color;
    const key = `${x},${y}`;

    const pixel = this.add
      .rectangle(pixelX, pixelY, this.PIXEL_SIZE, this.PIXEL_SIZE, pixelColor)
      .setStrokeStyle(1, 0x111111)
      .setOrigin(0, 0);

    pixel.setInteractive();

    pixel.on('pointerover', () => {
      pixel.setStrokeStyle(2, 0xffffff); // White highlight
    });

    pixel.on('pointerout', () => {
      pixel.setStrokeStyle(1, 0x111111); // Reset to default
    });

    pixel.on('pointerdown', () => {
      console.log(`Clicked pixel at (${x}, ${y})`);
      // Here you might want to emit an event to the game logic
      EventBus.emit('pixel-clicked', { x, y });
    });

    this.pixelsLayer.add(pixel);
    this.pixelObjects.set(key, pixel);
  }


  setMapSize(width: number, height: number) {
    console.log('setMapSize', { width, height });
    this.mapWidth = width;
    this.mapHeight = height;
    this.setupCamera();
  }

  setupCamera() {
    const mapWidthPixels = this.mapWidth * this.PIXEL_SIZE;
    const mapHeightPixels = this.mapHeight * this.PIXEL_SIZE;
    this.camera.setBounds(0, 0, mapWidthPixels, mapHeightPixels);
    this.camera.centerOn(mapWidthPixels / 2, mapHeightPixels / 2);
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
      // this.camera.zoom = Phaser.Math.Clamp(newZoom, 0.5, 100);
      this.camera.zoom = newZoom
    });
  }

  update() {
    if (this.keys.W.isDown) {
      this.camera.scrollY -= this.CAMERA_SPEED;
    }
    if (this.keys.S.isDown) {
      this.camera.scrollY += this.CAMERA_SPEED;
    }
    if (this.keys.A.isDown) {
      this.camera.scrollX -= this.CAMERA_SPEED;
    }
    if (this.keys.D.isDown) {
      this.camera.scrollX += this.CAMERA_SPEED;
    }
    if (this.keys.Q.isDown) {
      this.camera.zoom += this.ZOOM_INCREMENT;
    }
    if (this.keys.E.isDown) {
      this.camera.zoom -= this.ZOOM_INCREMENT;
    }
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}
