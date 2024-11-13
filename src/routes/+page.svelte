<script>
	import Scatterplot from '../Components/Scatterplot.svelte';
	import Piechart from '../Components/Piechart.svelte';
	import Barchart from '../Components/Barchart.svelte';

	let { data } = $props();
</script>

<main>
	<h1 style="margin: 20px;">Visual Analytics Project</h1>
	<h2>Cars for sale in Germany in 2022</h2>
	<div class="container">
		<Scatterplot
			title="Volkswagen cars for sale in Germany 2022"
			keyX="mileage"
			keyY="price"
			width={500}
			height={500}
			tickAmountX={10}
			tickAmountY={10}
			radius={1}
			labelX="Milage"
			labelY="Price"
			restrictTo="Volkswagen"
			restrictToKey="make"
			{data}
		/>
		<Piechart width={200} height={200} labels="fuel" {data} />
		<Barchart width={500} height={500} labels="fuel" {data} />
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
