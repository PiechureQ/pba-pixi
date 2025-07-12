import { GameEvents } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
  gameOverText?: Phaser.GameObjects.Text;

  constructor() {
    super('GameOver');
  }

  create() {
    this.gameOverText = this.add.text(512, 384, 'Game Over', {
      fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5).setDepth(100);

    const startButton = this.add.text(512, 520, 'Jeszcze raz', {
      fontFamily: 'Arial Black',
      fontSize: 28,
      color: '#8effaf',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setDepth(100).setInteractive();

    startButton.on('pointerdown', () => {
      this.changeScene();
    });

    GameEvents.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('MainMenu');
  }
}
