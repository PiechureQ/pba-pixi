<script lang="ts">
	import type { AvailableCommand } from '../game/PlayerConnection';
	import { PlayerConnection } from '../game/PlayerConnection';
	import { onMount } from 'svelte';
	import { GameEvents } from '../game/EventBus';

	// type Props = {
	// playerColor: string | null;
	// availableCommands: AvailableCommand[];
	// onJoin: () => void;
	// onCommandSelected: (command: string) => void;
	// };

	// const { onCommandSelected, playerColor = null, availableCommands = [] }: Props = $props();

	let joined = $state(false);
	let playerColor = $state<string | null>(null);
	let availableCommands = $state<any[]>([]);
	let selectedCommand = $state<string | null>(null);

	const playerConnection = new PlayerConnection();

	const handleCommandClick = (command: any) => {
		if (command.availableTargets.length > 0) {
			selectedCommand = command.type;
		}
	};

	playerConnection.event.on('connect', (con) => {
		if (!con) {
			joined = false;
		}
	});

	playerConnection.event.on('joined', (data) => {
		console.log('joined', data);
		playerColor = data.playerColor;
		joined = true;
	});

	playerConnection.event.on('playerTurn', (data) => {
		// console.log('playerTurn', data);
		availableCommands = data.availableCommands;
	});

	GameEvents.on('pixel-clicked', (target) => {
		console.log('pixel-clicked', target);
		if (!selectedCommand) return;

		playerConnection.sendMove(selectedCommand, [target]);
	});

	const onJoin = () => {
		playerConnection.join();
	};

	const onDisconnect = () => {
		playerConnection.disconnect();
	};

	onMount(() => {
		return onDisconnect;
	});
</script>

<div id="side-controls">
	<p style="text-align: center; margin-top: 20px; font-weight: bold;">Panel Kontrolny</p>

	{#if joined}
		<p>Wyjdź z gry</p>
		<button onclick={onDisconnect}>Wyjdź</button>
	{:else}
		<p>Dołącz do gry</p>
		<button onclick={onJoin}>Dołącz</button>
	{/if}

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
