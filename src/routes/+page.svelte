<script lang="ts">
	import GameWindow from '$lib/GameWindow.svelte';

	const startGame = async () => {
		const response = await fetch('http://localhost:3000/start');
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
