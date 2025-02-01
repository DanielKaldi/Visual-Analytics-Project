<script>
	import Trophy from './Trophy.svelte';

	let { width, height, players, times } = $props();

	let fontSize = 24;

	let differences = [];

	function parseTime(timeStr) {
		let match = timeStr.match(/(\d+)m (\d+)s/);
		if (!match) return NaN; // Handle invalid input
		return parseInt(match[1]) * 60 + parseInt(match[2]); // Convert to total seconds
	}

	let baseTime = parseTime(times[0]); // Convert times[0] to seconds

	for (let i = 1; i < 5; i++) {
		if (!times[i]) continue;

		let currentTime = parseTime(times[i]);
		let diffSeconds = currentTime - baseTime;

		let minutes = Math.floor(diffSeconds / 60);
		let seconds = diffSeconds % 60;

		differences.push(`${minutes}m ${seconds}s`);
	}
</script>

<div
	class="container grid grid-cols-2 grid-rows-5 border-4"
	style="width: {width}px; height: {height}px"
>
	<div class="flex items-center justify-start gap-2">
		<Trophy color="#EFBF04" />
		<p style="font-size: {fontSize}px;">
			{players[0]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<p style="font-size: {fontSize}px;">
			{times[0]}
		</p>
	</div>

	<div class="flex items-center justify-start gap-2">
		<Trophy color="#C4C4C4" />
		<p style="font-size: {fontSize}px;">
			{players[1]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<div>
			<p style="font-size: {fontSize}px;">
				{times[1]}
			</p>
			{#if times[1]}
				<p style="font-size: {fontSize - 4}px; color: #FF0000">
					{'+ ' + differences[0]}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex items-center justify-start gap-2">
		<Trophy color="#CE8946" />
		<p style="font-size: {fontSize}px;">
			{players[2]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<div>
			<p style="font-size: {fontSize}px;">{times[2]}</p>
			{#if times[1]}
				<p style="font-size: {fontSize - 4}px; color: #FF0000">
					{'+ ' + differences[1]}
				</p>
			{/if}
		</div>
	</div>

	<div class="justify-star flex items-center gap-2">
		<div class="ml-3" style="font-size: 25px">4.</div>
		<p style="font-size: {fontSize}px;">
			{players[3]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<div>
			<p style="font-size: {fontSize}px;">{times[3]}</p>
			{#if times[1]}
				<p style="font-size: {fontSize - 4}px; color: #FF0000">
					{'+ ' + differences[2]}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex items-center justify-start gap-2">
		<div class="ml-3" style="font-size: 25px">5.</div>
		<p style="font-size: {fontSize}px;">
			{players[4]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<div>
			<p style="font-size: {fontSize}px;">{times[4]}</p>
			{#if times[1]}
				<p style="font-size: {fontSize - 4}px; color: #FF0000">
					{'+ ' + differences[3]}
				</p>
			{/if}
		</div>
	</div>
</div>

<style>
	svg {
		transform: rotate(-90deg);
	}

	.pedestal {
		background-color: white;
	}

	.container {
		background-color: whitesmoke;
		padding: 10px;
	}
</style>
