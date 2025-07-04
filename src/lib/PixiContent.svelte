<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '$lib/game/Game';

	let pixiContent: HTMLDivElement;

	onMount(() => {
		try {
			const game = new Game();
			game.connect().listen().initApp(pixiContent);
		} catch (error) {
			console.error('Error initializing game:', error);
		}
	});
</script>

<div id="pixi-content" bind:this={pixiContent}></div>

<style>
	#pixi-content {
		/* display: contents; */
		width: 100%;
		height: 100%;
	}
</style>
