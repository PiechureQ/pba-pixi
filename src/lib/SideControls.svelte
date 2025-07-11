<script lang="ts">
	import type { AvailableCommand } from '../game/PlayerConnection';

	type Props = {
		playerColor: string | null;
		availableCommands: AvailableCommand[];
		onJoin: () => void;
		onCommandSelected: (command: string) => void;
	};

	const { onJoin, onCommandSelected, playerColor = null, availableCommands = [] }: Props = $props();

	const handleCommandClick = (command: any) => {
		if (command.availableTargets.length > 0) {
			onCommandSelected(command.type);
		}
	};
</script>

<div id="side-controls">
	<p style="text-align: center; margin-top: 20px; font-weight: bold;">Panel Kontrolny</p>

	<p>Dołącz do gry</p>
	<button onclick={onJoin}>Dołącz</button>

	{#if playerColor}
		<div class="player-info">
			Twój kolor: <span class="player-color" style="background-color: {playerColor};"></span>
			{playerColor}
		</div>
	{/if}

	{#if availableCommands.length > 0}
		<div>
			<p>Dostępne akcje:</p>
			{#each availableCommands as command}
				<button onclick={() => handleCommandClick(command)}>{command.type}</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	#side-controls {
		position: fixed;
		right: 0;
		width: 200px;
	}
	.player-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.player-color {
		display: inline-block;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid white;
	}

	.content {
		overflow-y: auto;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px; /* Odstęp między przyciskami */
	}

	button {
		width: 80%;
		padding: 12px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 16px;
		transition: background-color 0.3s;
	}

	button:hover {
		background-color: #0056b3;
	}

	/* Stylizacja paska przewijania */
	.content::-webkit-scrollbar {
		width: 8px;
	}
	.content::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	.content::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}
	.content::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}
</style>
