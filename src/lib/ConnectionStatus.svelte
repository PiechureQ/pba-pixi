<script lang="ts">
	let { connected }: { connected: boolean } = $props();
</script>

{#if !connected}
	<div class="connection-status">Brak połączenia z serwerem. Spróbuj odświeżyć stronę.</div>
{/if}

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
</style>
