<script>
	import Scatterplot from '../Components/Scatterplot.svelte';
	import Piechart from '../Components/Piechart.svelte';
	import Barchart from '../Components/Barchart.svelte';
	import Linegraph from '../Components/Linegraph.svelte';

	let { data } = $props();
</script>

<main>
	<h1 style="margin: 20px;">Visual Analytics Project</h1>
	<h2 style="margin: 10px;">Cars for sale in Germany in 2022</h2>
	<a class="customButton" href="/speedrun">Actual Data Prototype</a>
	<div class="container">
		<Scatterplot
			title="Mercedes Benz cars"
			keyX="mileage"
			keyY="price"
			width={500}
			height={500}
			tickAmountX={10}
			tickAmountY={10}
			radius={1}
			labelX="Milage"
			labelY="Price"
			restrictTo="Mercedes-Benz"
			restrictToKey="make"
			{data}
		/>
		<Piechart width={200} height={200} labels="fuel" data={data.data} />
		<Barchart width={500} height={500} labels="fuel" {data} />
	</div>
	<div class="container">
		<Linegraph
			title="Volkswagen cars"
			keyX="year"
			keyY="mileage"
			width={500}
			height={500}
			tickAmountX={10}
			tickAmountY={10}
			radius={3}
			labelX="Maufacturing Year"
			labelY="Avg Mileage"
			restrictTo="Volkswagen"
			restrictToKey="make"
			avgY={true}
			{data}
		/>
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
		margin-top: 50px;
	}
	.customButton {
		height: 60px;
		width: 240px;
		background-color: #eeeeee;
		font-size: 20px;
		color: black;
		text-align: center;
		line-height: 50px;
	}

	.customButton:hover {
		background-color: #d5d5d5;
	}
</style>
