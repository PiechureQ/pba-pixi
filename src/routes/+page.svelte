<script lang="ts">
	import GameWindow from '$lib/GameWindow.svelte';
	import { GAME_SERVER_URL } from '$lib/const';

	const startGame = async () => {
		const response = await fetch(`${GAME_SERVER_URL}/start`);
		if (response.ok) {
			console.log('Gra rozpoczęta!');
		} else {
			console.error('Błąd podczas rozpoczynania gry:', response.status);
		}
	};
</script>

<!-- <button on:click={startGame}>Start</button> -->
<GameWindow />

<style>
	button {
		position: absolute;
		top: 10px;
		right: 10px;
		padding: 10px 20px;
		background-color: #4caf50;
		color: white;
		border: none;
		cursor: pointer;
		z-index: 10;
	}
</style>
