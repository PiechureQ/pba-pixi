<script lang="ts">
	import { onMount } from 'svelte';
	import type { Scene } from 'phaser';
	import { PixiRender } from '$lib/game/Render';
	import PhaserGame, { type TPhaserRef } from '../../PhaserGame.svelte';

	//  References to the PhaserGame component (game and scene are exposed)
	let phaserRef: TPhaserRef = { game: null, scene: null, gameScene: null };

	let width = $state(10);
	let height = $state(10);
	let pixels = $state<string[]>([]);

	pixels = generujLosoweKolory(width * height);

	function regenerateMap() {
		// pixels = generujLosoweKolory(width * height);
		phaserRef.gameScene?.setMapSize(width, height);
		phaserRef.gameScene?.renderMap([]);
		// setMapSize(width, height);
		// renderMap(pixels);
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
			// Generuje losową liczbę całkowitą od 0 do 16777215 (FFFFFF w hex)
			const losowaLiczba = Math.floor(Math.random() * 16777215);
			// Konwertuje liczbę na ciąg heksadecymalny i uzupełnia zerami
			const kolorHex = losowaLiczba.toString(16).padStart(6, '0');
			kolory.push(`#${kolorHex}`);
		}
		return kolory;
	}

	const currentScene = (scene: Scene) => {};
</script>

<div id="test-map-container">
	<div class="controls">
		<label>Width: <input type="text" bind:value={width} /></label>
		<label>Height: <input type="text" bind:value={height} /></label>
		<button on:click={regenerateMap}>Generate</button>
		<!-- <button on:click={game.start}>Start</button> -->
		<!-- <button on:click={game.stop}>Stop</button> -->
	</div>
	<PhaserGame bind:phaserRef currentActiveScene={currentScene} />
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
