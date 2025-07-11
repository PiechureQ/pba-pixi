<script context="module" lang="ts">
	import type { Game, Scene } from 'phaser';

	export type TPhaserRef = {
		game: Game | null;
		scene: Scene | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import StartGame from './game/main';
	import { EventBus } from './game/EventBus';

	let phaserDiv: HTMLDivElement;

	export let phaserRef: TPhaserRef = {
		game: null,
		scene: null
	};

	export let currentActiveScene: (scene: Scene) => void | undefined;

	onMount(() => {
		phaserRef.game = StartGame();

		EventBus.on('current-scene-ready', (scene_instance: Scene) => {
			phaserRef.scene = scene_instance;

			if (currentActiveScene) {
				currentActiveScene(scene_instance);
			}
		});

		const handleResize = () => {
			phaserRef.game?.scale.resize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			phaserRef.game?.destroy(true);
		};
	});
</script>

<div id="game-container" bind:this={phaserDiv}></div>
