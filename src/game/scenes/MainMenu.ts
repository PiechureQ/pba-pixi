import { type GameObjects, Scene } from 'phaser';
import { GameEvents } from '../EventBus';

export class MainMenu extends Scene {
  title!: GameObjects.Text;
  loading!: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.title = this.add.text(512, 460, 'Pixel Bot Arena', {
      fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5).setDepth(100);

    this.loading = this.add.text(512, 500, 'Ładowanie...', {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setDepth(100);

    GameEvents.emit('current-scene-ready', this);
  }

  setConnected(connected: boolean) {
    if (!connected) {
      this.loading.destroy();
      this.loading = this.add.text(512, 520, 'Serwer niedostępny', {
        fontFamily: 'Arial Black',
        fontSize: 28,
        color: '#faa0a0',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }).setOrigin(0.5).setDepth(100);
    } else {
      this.changeScene();
    }
  }

  changeScene() {
    this.scene.start('Arena');
  }
}
