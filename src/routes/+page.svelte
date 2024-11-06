<script>
	import Scatterplot from '../Components/Scatterplot.svelte';

	let { data } = $props();
</script>

<main>
	<h1 style="margin: 20px;">Visual Analytics Project</h1>
	<Scatterplot
		keyX="mileage"
		keyY="price"
		width={500}
		height={500}
		tickAmountX={10}
		tickAmountY={10}
		radius={1}
		{data}
	/>
</main>

<style>
	main {
		display: flex;
		flex-flow: column;
		align-items: center;
		font-size: xx-large;
	}
</style>
