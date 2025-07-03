<script lang="ts">
	import { onMount } from 'svelte';
	import { Application, Container, Graphics } from 'pixi.js';
	import type { Pixel } from './model/Game';

	type PixiContentProps = {
		width?: number;
		height?: number;
		pixels: string[];
		mapChanges: Pixel[];
	};
	let { width = 1000, height = 1000, mapChanges }: PixiContentProps = $props();

	let pixiContent: HTMLDivElement;
	let app: Application;
	let container: Container | undefined = $state(undefined);
	let pixelGraphics: Graphics | undefined = $state(undefined);
	const pixelSize = 8;

	onMount(async () => {
		app = new Application();
		await app.init({
			backgroundColor: 0x0f0f0f,
			resizeTo: pixiContent
		});

		pixiContent.appendChild(app.canvas as HTMLCanvasElement);

		// Create and add a container to the stage
		container = new Container();
		app.stage.addChild(container);

		// Use a single Graphics object to draw all pixels
		pixelGraphics = new Graphics();
		container.removeChildren();
		container.addChild(pixelGraphics);
	});

	// let lastPixels = pixels;

	$effect(() => {
		if (!container || !pixelGraphics) return;
		try {
			container.x = app.screen.width / 2 - (width * pixelSize) / 2;
			container.y = app.screen.height / 2 - (height * pixelSize) / 2;

			mapChanges.forEach(({ x, y, color }) => {
				pixelGraphics?.fill(color).rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
			});

			// for (let i = 0; i < pixels.length; i++) {
			// 	const color = pixels[i];
			// 	if (color !== lastPixels[i]) {
			// 		pixelGraphics
			// 			.fill(color)
			// 			.rect((i % width) * pixelSize, Math.floor(i / width) * pixelSize, pixelSize, pixelSize);
			// 	}
			// }
			// lastPixels = pixels;
		} catch (e) {
			console.warn(e);
			return;
		}
	});
</script>

<div id="pixi-content" bind:this={pixiContent}></div>

<style>
	#pixi-content {
		/* display: contents; */
		width: 100%;
		height: 100%;
	}
</style>
