<script context="module" lang="ts">
	import type { Game, Scene } from 'phaser';
	import type { Arena } from './game/scenes/Arena';

	export type TPhaserRef = {
		game: Game | null;
		scene: Scene | null;
		gameScene: Arena | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import StartGame from './game/main';
	import { EventBus } from './game/EventBus';

	let phaserDiv: HTMLDivElement;

	export let phaserRef: TPhaserRef = {
		game: null,
		scene: null,
		gameScene: null
	};

	export let currentActiveScene: (scene: Scene) => void | undefined;

	onMount(() => {
		phaserRef.game = StartGame();

		EventBus.on('current-scene-ready', (scene_instance: Scene) => {
			phaserRef.scene = scene_instance;

			if (scene_instance.scene.key === 'Game') {
				phaserRef.gameScene = scene_instance as Arena;
			} else {
				phaserRef.gameScene = null;
			}

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
