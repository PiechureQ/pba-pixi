<script lang="ts">
	import PixiContent from '$lib/PixiContent.svelte';
	import { onMount } from 'svelte';
	import type { GameUpdate } from './model/Game';

	let connected = $state(false);
	let mapWidth: number | undefined = $state(undefined);
	let mapHeight: number | undefined = $state(undefined);
	let pixels: string[] = $state([]);
	let mapChanges: string[] = $state([]);

	onMount(async () => {
		const socket = new WebSocket('ws://localhost:3000/ws/observer');

		socket.addEventListener('open', () => {
			connected = true;
			console.log('connected');
		});
		socket.addEventListener('close', () => {
			connected = false;
			console.log('connection close');
		});

		socket.addEventListener('message', (event) => {
			const data: GameUpdate = JSON.parse(event.data);

			if (data.type === 'gameUpdate') {
				mapWidth = data.map.width;
				mapHeight = data.map.height;
				pixels = [];
				mapChanges = data.mapChanges;
			}
		});
	});
</script>

<div id="game-window">
	{#if !connected}
		<div class="connection-status">Brak połączenia z serwerem. Spróbuj odświeżyć stronę.</div>
	{/if}
	<PixiContent width={mapWidth} height={mapHeight} {pixels} {mapChanges} />
</div>

<style>
	.connection-status {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		background-color: rgba(255, 0, 0, 0.5);
		color: white;
		text-align: center;
		padding: 10px;
		font-size: 16px;
		z-index: 1000;
	}

	#game-window {
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
</style>
