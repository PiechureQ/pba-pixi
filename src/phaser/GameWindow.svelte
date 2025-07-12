<script lang="ts">
	import SlidingPanel from './SlidingPanel.svelte';
	import type { Scene } from 'phaser';
	import ConnectionStatus from '$lib/ConnectionStatus.svelte';
	import PhaserGame, { type TPhaserRef } from './Phaser.svelte';
	import { GameServerConnection } from '../game/GameServerConnection';
	import SideControls from './SideControls.svelte';
	import { GameEvents } from '../game/EventBus';
	import type { MainMenu } from '../game/scenes/MainMenu';
	import type { Arena } from '../game/scenes/Arena';
	import { onMount } from 'svelte';

	type Props = { admin?: boolean; offline?: boolean; phaserRef?: TPhaserRef };
	let {
		admin = false,
		offline = false,
		phaserRef = $bindable({ game: null, scene: null, gameScene: null })
	} = $props() as Props;

	let connected = $state(false);
	let gameState = $state(false);

	const game = new GameServerConnection();

	onMount(() => {
		game.event.on('connect', (con) => {
			connected = con;
		});
		game.event.on('state', (state) => {
			connected = state == 'playing';
			gameState = state == 'playing';
		});

		game.event.on('sync', (event) => {
			if (!phaserRef.gameScene) return;
			phaserRef.gameScene.renderMap(event.map.pixels);
		});
		game.event.on('update', (changes) => {
			if (!phaserRef.gameScene) return;
			phaserRef.gameScene.renderChanges(changes);
		});

		GameEvents.on('current-scene-ready', async (_scene) => {
			if (_scene.scene.key == 'MainMenu') {
				const scene = _scene as Scene;

				if (offline) {
					scene.scene.start('Arena');
				} else {
					game.connect();
				}
			}
			if (_scene.scene.key == 'Arena') {
				const scene = _scene as Arena;
				if (!offline) {
					game.listen();
					const state = await game.sync();

					scene.createMap(state.map.width, state.map.height, true);
					scene.renderMap(state.map.pixels);
				}
			}
		});
		game.event.on('connect', async (con) => {
			if (phaserRef.scene?.scene.key == 'MainMenu') {
				const scene = phaserRef.scene as MainMenu;

				const state = await game.fetchGameState();
				if (state == 'playing') {
					scene.setConnected(con);
				} else {
					scene.setConnected(false);
				}
			}
		});
		return () => {
			game.disconnect();
			GameEvents.all.clear();
		};
	});

	const currentScene = () => {};
</script>

<div id="game-window">
	{#if offline == false}
		<SideControls />
		<ConnectionStatus connected={connected ? gameState : true} />
	{/if}
	<PhaserGame bind:phaserRef currentActiveScene={currentScene} />
</div>

{#if admin}
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
{/if}

<style>
	#game-window {
		display: flex;
	}
</style>
