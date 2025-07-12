<script lang="ts">
	import { onMount } from 'svelte';
	import type { Scene } from 'phaser';
	import { type TPhaserRef } from '../../phaser/Phaser.svelte';
	import GameWindow from '../../phaser/GameWindow.svelte';

	//  References to the PhaserGame component (game and scene are exposed)
	let phaserRef: TPhaserRef = $state({ game: null, scene: null, gameScene: null });

	let width = $state(100);
	let height = $state(100);
	let pixels = $state<string[]>([]);

	pixels = generujLosoweKolory(width * height);

	function regenerateMap() {
		phaserRef.gameScene?.createMap(width, height);
	}

	function updateMap(n: number) {
		const pixels = [];
		for (let i = 0; i < n; i++) {
			const x = Math.floor(Math.random() * width);
			const y = Math.floor(Math.random() * height);
			const pixel = { x, y, color: generateRandomColor() };
			pixels.push(pixel);
		}
		const color = phaserRef.gameScene?.renderChanges(pixels);
	}

	let itrv: unknown = null;
	function start() {
		itrv = setInterval(() => updateMap(20), 20);
	}

	function stop() {
		// @ts-ignore: Property 'clearInterval' does not exist on type 'unknown'.
		clearInterval(itrv);
	}

	/**
	 * Generuje określoną liczbę losowych kolorów w formacie heksadecymalnym.
	 *
	 * @param liczba - Liczba kolorów do wygenerowania.
	 * @returns Tablica ciągów znaków reprezentujących losowe kolory w formacie #aabbcc.
	 */
	function generujLosoweKolory(liczba: number): string[] {
		const kolory: string[] = [];
		if (liczba <= 0) {
			return kolory;
		}

		for (let i = 0; i < liczba; i++) {
			const kolorHex = generateRandomColor();
			kolory.push(`#${kolorHex}`);
		}
		return kolory;
	}

	function generateRandomColor() {
		// Generuje losową liczbę całkowitą od 0 do 16777215 (FFFFFF w hex)
		const losowaLiczba = Math.floor(Math.random() * 16777215);
		// Konwertuje liczbę na ciąg heksadecymalny i uzupełnia zerami
		const kolorHex = losowaLiczba.toString(16).padStart(6, '0');

		return kolorHex;
	}
</script>

<div id="test-map-container">
	<div class="controls">
		<label>Width: <input type="text" bind:value={width} /></label>
		<label>Height: <input type="text" bind:value={height} /></label>
		<button onclick={regenerateMap}>Generate</button>
		<button onclick={start}>Start</button>
		<button onclick={stop}>Stop</button>
	</div>
	<GameWindow offline={true} bind:phaserRef />
</div>

<style>
	#test-map-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.controls {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 10;
		background: rgba(255, 255, 255, 0.8);
		padding: 10px;
		border-radius: 5px;
		display: flex;
		gap: 10px;
		align-items: center;
	}
</style>
