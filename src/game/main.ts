import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
function createConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#393B44',
    scene: [
      Boot,
      Preloader,
      MainMenu,
      MainGame,
      GameOver
    ]
  }
};

const StartGame = () => {
  return new Game(createConfig());
}

export default StartGame;
