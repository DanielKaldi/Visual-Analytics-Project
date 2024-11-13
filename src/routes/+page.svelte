<script>
	import Scatterplot from '../Components/Scatterplot.svelte';
	import Piechart from '../Components/Piechart.svelte';

	let { data } = $props();
</script>

<main>
	<h1 style="margin: 20px;">Visual Analytics Project</h1>
	<div class="container">
		<Scatterplot
			keyX="mileage"
			keyY="price"
			width={500}
			height={500}
			tickAmountX={10}
			tickAmountY={10}
			radius={1}
			restrictTo="Volkswagen"
			restrictToKey="make"
			{data}
		/>
		<Piechart width={200} height={200} labels="fuel" {data} />
	</div>
</main>

<style>
	main {
		display: flex;
		flex-flow: column;
		align-items: center;
		font-size: xx-large;
	}

	.container {
		display: flex;
		gap: 50px;
	}
</style>
