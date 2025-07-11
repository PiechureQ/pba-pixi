import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameIOError extends Error { };

export class Game extends Scene {
  private readonly MAP_WIDTH = 50;
  private readonly MAP_HEIGHT = 50;
  private readonly PIXEL_SIZE = 32;
  private readonly CAMERA_SPEED = 10;
  private readonly ZOOM_INCREMENT = 0.02;

  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private camera!: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;

    this.createMap();
    this.setupCamera();
    this.setupInput();

    EventBus.emit('current-scene-ready', this);
  }

  createMap() {
    for (let x = 0; x < this.MAP_WIDTH; x++) {
      for (let y = 0; y < this.MAP_HEIGHT; y++) {
        const pixelX = x * this.PIXEL_SIZE;
        const pixelY = y * this.PIXEL_SIZE;
        const randomColor = Phaser.Display.Color.RandomRGB(50, 200).color;

        const pixel = this.add
          .rectangle(pixelX, pixelY, this.PIXEL_SIZE, this.PIXEL_SIZE, randomColor)
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
          // Change color on click
          pixel.setFillStyle(Phaser.Display.Color.RandomRGB(50, 255).color);
        });
      }
    }
  }

  setupCamera() {
    const mapWidthPixels = this.MAP_WIDTH * this.PIXEL_SIZE;
    const mapHeightPixels = this.MAP_HEIGHT * this.PIXEL_SIZE;
    this.camera.setBounds(0, 0, mapWidthPixels, mapHeightPixels);
    this.camera.centerOn(mapWidthPixels / 2, mapHeightPixels / 2);
  }

  setupInput() {
    if (!this.input.keyboard) {
      throw new GameIOError('Keyboard is not available');
    }
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,Q,E') as {
      [key: string]: Phaser.Input.Keyboard.Key;
    };

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
      let newZoom;
      if (deltaY < 0) {
        newZoom = this.camera.zoom + this.ZOOM_INCREMENT * 5;
      } else {
        newZoom = this.camera.zoom - this.ZOOM_INCREMENT * 5;
      }
      this.camera.zoom = Phaser.Math.Clamp(newZoom, 0.5, 3);
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
