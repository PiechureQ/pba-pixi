<script lang="ts">
	import PixiContent from '$lib/PixiContent.svelte';

	// TODO connect status to Game class
	let connected = $state(true);
</script>

<div id="game-window">
	{#if !connected}
		<div class="connection-status">Brak połączenia z serwerem. Spróbuj odświeżyć stronę.</div>
	{/if}
	<PixiContent />
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
