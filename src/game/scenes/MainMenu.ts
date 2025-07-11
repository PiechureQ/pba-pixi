import { type GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
  title!: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.title = this.add.text(512, 460, 'Pixel Bot Arena', {
      fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5).setDepth(100);

    const startButton = this.add.text(512, 520, 'Start', {
      fontFamily: 'Arial Black',
      fontSize: 28,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setDepth(100).setInteractive();

    startButton.on('pointerdown', () => {
      this.changeScene();
    });

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('Arena');
  }
}
