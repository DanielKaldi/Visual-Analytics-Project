<script>
	import Trophy from './Trophy.svelte';

	let { width, height, players, times } = $props();

	let fontSize = 24;
</script>

<div
	class="container grid grid-cols-2 grid-rows-3 border-4"
	style="width: {width}px; height: {height}px"
>
	<div class="flex items-center justify-center gap-2">
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
	<div class="flex items-center justify-center gap-2">
		<Trophy color="#C4C4C4" />
		<p style="font-size: {fontSize}px;">
			{players[1]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<p style="font-size: {fontSize}px;">
			{times[1]}
		</p>
	</div>
	<div class="flex items-center justify-center gap-2">
		<Trophy color="#CE8946" />
		<p style="font-size: {fontSize}px;">
			{players[2]}
		</p>
	</div>
	<div class="flex items-center justify-center">
		<p style="font-size: {fontSize}px;">{times[2]}</p>
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
