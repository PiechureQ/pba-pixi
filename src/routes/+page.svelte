<script lang="ts">
	import SlidingPanel from '$lib/SlidingPanel.svelte';
	import ConnectionStatus from '$lib/ConnectionStatus.svelte';
	import { Game } from '$lib/game/Game';
	import { onMount } from 'svelte';
	import { PixiRender } from '$lib/game/Render';

	let pixiContent: HTMLDivElement;

	let connected = $state(false);
	let gameState = $state(false);

	const game = new Game();
	const render = new PixiRender();

	game.event.on('connect', (con) => (connected = con));
	game.event.on('state', (state) => (gameState = state == 'playing'));

	game.event.on('start', () => render.renderMap(game.pixels));
	game.event.on('sync', (event) => {
		render.setMapSize(event.map.width, event.map.height);
		render.renderMap(event.map.pixels);
	});
	game.event.on('update', (changes) => render.renderChanges(changes));

	onMount(() => {
		game.sync();
		window.pba = window.pba || {};
		window.pba.game = game;

		render.initApp(pixiContent);
	});
</script>

<div id="pixi-content" bind:this={pixiContent}></div>

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
