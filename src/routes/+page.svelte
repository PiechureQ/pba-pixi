<script lang="ts">
	import SlidingPanel from '$lib/SlidingPanel.svelte';
	import type { Scene } from 'phaser';
	import ConnectionStatus from '$lib/ConnectionStatus.svelte';
	import PhaserGame, { type TPhaserRef } from '../PhaserGame.svelte';
	import { Game } from '$lib/game/Game';
	import { onMount } from 'svelte';
	import { PixiRender } from '$lib/game/Render';

	//  References to the PhaserGame component (game and scene are exposed)
	let phaserRef: TPhaserRef = { game: null, scene: null, gameScene: null };

	let connected = $state(false);
	let gameState = $state(false);

	const game = new Game();

	game.event.on('connect', (con) => (connected = con));
	game.event.on('state', (state) => (gameState = state == 'playing'));

	game.event.on('start', () => {
		console.log('start');
		phaserRef.gameScene?.renderMap(game.pixels);
	});
	game.event.on('sync', (event) => {
		console.log('sync');
		if (!phaserRef.gameScene) return;
		phaserRef.gameScene.setMapSize(event.map.width, event.map.height);
		phaserRef.gameScene.renderMap(event.map.pixels);
	});
	game.event.on('update', (changes) => {
		console.log('update');
		phaserRef.gameScene?.renderChanges(changes);
	});

	onMount(() => {
		game.sync();
		window.pba = window.pba || {};
		window.pba.game = game;
	});

	const currentScene = (scene: Scene) => {};
</script>

<PhaserGame bind:phaserRef currentActiveScene={currentScene} />

<ConnectionStatus connected={gameState ? connected : true} />
<SlidingPanel
	gameOn={gameState}
	onStart={game.start.bind(game)}
	onStop={game.stop.bind(game)}
	onSync={game.sync.bind(game)}
	onConnect={() => {
		game.connect().listen();
	}}
	onDisconnect={game.disconnect.bind(game)}
/>

<style>
	#pixi-content {
		/* display: contents; */
		width: 100%;
		height: 100%;
	}
</style>
