import type { GameUpdate, Pixel } from "$lib/model/Game";
import { Application, Container, Graphics } from "pixi.js";

export class PixiRender {
  private pixiApp: Application | null = null;
  private mainContainer: Container | null = null;
  private pixelGraphics: Graphics | null = null;
  readonly pixelSize: number = 10;
  private width: number = 0;
  private height: number = 0;

  private lastMap: string[] | undefined = undefined;

  async initApp(pixiContent: HTMLDivElement) {
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
  }

  setMapSize(width: number, height: number) {
    if (!this.pixiApp || !this.mainContainer) {
      console.warn('Pixi app or main container is not initialized');
      return;
    }
    this.mainContainer.x = this.pixiApp.screen.width / 2 - (width * this.pixelSize) / 2;
    this.mainContainer.y = this.pixiApp.screen.height / 2 - (height * this.pixelSize) / 2;
    this.width = width;
    this.height = height;
  }

  renderMap(map: string[]) {
    if (this.pixelGraphics && this.width * this.height > 0) {
      map.forEach((pixel, index) => {
        const x = index % this.width;
        const y = Math.floor(index / this.width);
        const color = pixel;

        if (this.lastMap == undefined || this.lastMap[index] !== color) {
          try {
            this.pixelGraphics.fill(color.replace('#ffffff', '#3a3a3a')).rect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
          } catch (e) {
            console.log('e', e);
          }
        }
      });
      this.lastMap = map;
    }
  }

  renderChanges(mapChanges: Pixel[]) {
    mapChanges.forEach(({ x, y, color }) => {
      this.pixelGraphics?.fill(color).rect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    });
  }
}
