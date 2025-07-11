<script lang="ts">
	import SlidingPanel from '$lib/SlidingPanel.svelte';
	import type { Scene } from 'phaser';
	import ConnectionStatus from '$lib/ConnectionStatus.svelte';
	import PhaserGame, { type TPhaserRef } from '../PhaserGame.svelte';
	import { GameServerConnection } from '../game/GameServerConnection';
	import { PlayerConnection } from '../game/PlayerConnection';
	import { onMount } from 'svelte';
	import SideControls from '$lib/SideControls.svelte';
	import { EventBus } from '../game/EventBus';

	//  References to the PhaserGame component (game and scene are exposed)
	let phaserRef: TPhaserRef = { game: null, scene: null, gameScene: null };

	let connected = $state(false);
	let gameState = $state(false);
	let playerColor = $state<string | null>(null);
	let availableCommands = $state<any[]>([]);
	let selectedCommand = $state<string | null>(null);

	const game = new GameServerConnection();
	const playerConnection = new PlayerConnection();

	game.event.on('connect', (con) => (connected = con));
	game.event.on('state', (state) => (gameState = state == 'playing'));

	game.event.on('start', () => {
		console.log('start');
		// phaserRef.gameScene?.createMap(game.pixels);
	});
	game.event.on('sync', (event) => {
		if (!phaserRef.gameScene) return;
		phaserRef.gameScene.setMapSize(event.map.width, event.map.height);
		phaserRef.gameScene.renderMap(event.map.pixels);
	});
	game.event.on('update', (changes) => {
		phaserRef.gameScene?.renderChanges(changes);
	});

	playerConnection.event.on('joined', (data) => {
		console.log('joined', data);
		playerColor = data.playerColor;
	});

	playerConnection.event.on('playerTurn', (data) => {
		// console.log('playerTurn', data);
		availableCommands = data.availableCommands;
	});

	EventBus.on('pixel-clicked', (target) => {
		console.log('pixel-clicked', target);
		if (!selectedCommand) return;

		playerConnection.sendMove(selectedCommand, [target]);
	});

	onMount(() => {
		game.sync();
		playerConnection.connect();
		// window.pba = window.pba || {};
		// window.pba.game = game;
		() => {
			game.disconnect();
			playerConnection.disconnect();
		};
	});

	const currentScene = (scene: Scene) => {};
</script>

<div id="game-container">
	<SideControls
		{playerColor}
		{availableCommands}
		onJoin={playerConnection.join.bind(playerConnection)}
		onCommandSelected={(command) => (selectedCommand = command)}
	/>
	<PhaserGame bind:phaserRef currentActiveScene={currentScene} />
</div>

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
</style>
