import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Arena } from './scenes/Arena';
import { MainMenu } from './scenes/MainMenu';
import { Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
function createConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#393B44',
    scene: [
      Boot,
      Preloader,
      MainMenu,
      Arena,
      GameOver
    ]
  }
};

const StartGame = () => {
  return new Game(createConfig());
}

export default StartGame;
