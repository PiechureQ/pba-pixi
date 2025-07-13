<script lang="ts">
	import type { AvailableCommand } from '../game/PlayerConnection';
	import { PlayerConnection } from '../game/PlayerConnection';
	import { onMount } from 'svelte';
	import { GameEvents } from '../game/EventBus';

	let joined = $state(false);
	let playerColor = $state<string | null>(null);
	// const mockCommands = ['paint', 'eat', 'splat', 'bomb', 'expand'].map((type) => ({
	// 	type,
	// 	availableTargets: [{ x: 0, y: 0 }]
	// }));
	let availableCommands = $state<AvailableCommand[]>([]);
	let selectedCommand = $state<string | null>(null);

	const playerConnection = new PlayerConnection();

	onMount(() => {
		playerConnection.event.on('connect', (con) => {
			if (!con) {
				joined = false;
				playerColor = null;
				availableCommands = [];
				selectedCommand = null;
			}
		});

		playerConnection.event.on('joined', (data) => {
			console.log('joined', data);
			playerColor = data.playerColor;
			joined = true;
		});

		playerConnection.event.on('playerTurn', (data) => {
			availableCommands = data.availableCommands;
		});

		GameEvents.on('pixel-clicked', (target) => {
			console.log('pixel-clicked', target);
			if (!selectedCommand) return;

			playerConnection.sendMove(selectedCommand, [target]);
		});

		return () => {
			onDisconnect();
			playerConnection.destroy();
		};
	});

	const handleCommandClick = (command: AvailableCommand) => {
		selectedCommand = command.type;
		GameEvents.emit('command-selected', command);
	};

	const onJoin = () => {
		playerConnection.join();
	};

	const onDisconnect = () => {
		playerConnection.disconnect();
	};
</script>

<div id="side-controls" class="flex flex-col p-2 border-r-black border-r-1 shadow-xl">
	<p class="text-gray-100 font-bold font-xl text-center py-2">Panel Kontrolny</p>

	{#if !joined}
		<p class="text-gray-100 font-md text-center py-2">Dołącz do gry</p>
		<button
			class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-gray-700"
			onclick={onJoin}>Dołącz</button
		>
	{/if}

	{#if playerColor}
		<div class="player-info py-2 align-center justify-center flex gap-1">
			<div class="flex-grow flex flex-col justify-center">
				<p class="text-gray-100 font-md text-center">Twój kolor</p>
			</div>
			<div>
				<div
					class="player-color w-8 h-8 rounded-full border-gray-300 border-1"
					style="background-color: {playerColor};"
				></div>
			</div>
		</div>
	{/if}

	{#if availableCommands.length > 0}
		<div>
			<p class="text-gray-100 font-md text-center py-2">Dostępne akcje:</p>
			<div id="button-group" class="flex flex-col gap-2">
				{#each availableCommands as command}
					<button
						onclick={() => handleCommandClick(command)}
						class={`command-button command-button-${command.type} option-btn px-4 py-2 rounded-full text-gray-700 ${
							selectedCommand === command.type
								? 'bg-blue-200 hover:bg-blue-100'
								: 'bg-gray-200 hover:bg-gray-300'
						}`}
						data-value={command.type}>{command.type}</button
					>
				{/each}
			</div>
		</div>
	{/if}

	{#if joined}
		<div class="flex-grow"></div>
		<p class="text-gray-100 font-md text-center py-2">Wyjdź z gry</p>
		<button
			class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-gray-700"
			onclick={onDisconnect}>Wyjdź</button
		>
	{/if}
</div>

<style>
	#side-controls {
		width: 200px;
		background-color: rgba(57, 59, 68, 0.9);
	}
</style>
