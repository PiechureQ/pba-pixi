<script lang="ts">
	let isVisible = $state(false);

	type Props = {
		gameOn: boolean;
		onStart: () => void;
		onStop: () => void;
		onSync: () => void;
		onConnect: () => void;
		onDisconnect: () => void;
	};

	const { onStart, onStop, onSync, onConnect, onDisconnect, gameOn = false }: Props = $props();
</script>

<div
	class="sliding-panel"
	class:visible={isVisible}
	onmouseenter={() => (isVisible = true)}
	onmouseleave={() => (isVisible = false)}
>
	<div class="content">
		<p style="text-align: center; margin-top: 20px; font-weight: bold;">Panel Kontrolny</p>

		<p>Stan gry: {gameOn ? 'W trakcie' : 'Oczekuje na start'}</p>

		<!-- Przyciski wywołujące przekazane funkcje -->
		<button onclick={onStart}>Start</button>
		<button onclick={onStop}>Stop</button>
		<button onclick={onSync}>Sync</button>

		<p>Połączenie z obserwatorem</p>
		<button onclick={onConnect}>Połącz</button>
		<button onclick={onDisconnect}>Rozłącz</button>
	</div>
</div>

<style>
	.sliding-panel {
		position: fixed;
		top: 50%;
		right: 0;
		transform: translate(calc(100% - 30px), -50%);
		width: 300px;
		height: 400px;
		padding: 20px;
		background-color: rgba(50, 50, 50, 0.6);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: 15px 0 0 15px;
		box-shadow: -5px 0 20px rgba(0, 0, 0, 0.25);
		color: white;
		transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		z-index: 1000;
		border-left: 1px solid rgba(255, 255, 255, 0.2);
	}

	.sliding-panel.visible {
		transform: translate(0, -50%);
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
