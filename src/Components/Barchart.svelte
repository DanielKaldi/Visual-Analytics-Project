<script>
	let { key, labels, width, height, data } = $props();

	let cleanData = [];
	for (let i = 0; i < data.data.length; i++) {
		if (data.data[i][labels] == undefined) {
			continue;
		}
		var val;
		if (key == undefined) {
			val = 1;
		} else {
			val = data.data[i][key];
		}
		cleanData.push({ value: val, label: data.data[i][labels] });
	}

	const plotData = cleanData.reduce((acc, item) => {
		const existingItem = acc.find((i) => i.label === item.label);

		if (existingItem) {
			existingItem.value += item.value;
		} else {
			acc.push({ label: item.label, value: item.value });
		}
		return acc;
	}, []);

	const chartWidth = width;
	const maxValue = Math.max(...plotData.map((d) => d.value));
	const barSpacing = 20;
	const barWidth = (chartWidth - (plotData.length - 1) * barSpacing) / plotData.length;
	const chartHeight = height;
	const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'];
</script>

<div style="width: {width + 20}px; heigth: {height}px" class="container">
	<svg width={chartWidth} height={chartHeight} viewBox={`0 -40 ${chartWidth} ${chartHeight + 100}`}>
		<!--Bars-->
		{#each plotData as { label, value }, index}
			<rect
				class="bar"
				x={index * (barWidth + barSpacing)}
				y={chartHeight - (value / maxValue) * chartHeight}
				width={barWidth}
				height={(value / maxValue) * chartHeight}
				fill={colors[index]}
			/>
			<!-- Values above the bar -->
			<text
				class="value"
				x={index * (barWidth + barSpacing) + barWidth / 2}
				y={chartHeight - (value / maxValue) * chartHeight - 5}
			>
				{value}
			</text>
			<!-- Labels below the bar -->
			<text
				class="label"
				x={index * (barWidth + barSpacing) + barWidth / 2}
				y={index % 2 ? chartHeight + 40 : chartHeight + 20}
				style="fill: {colors[index]}"
			>
				{label}
			</text>
		{/each}
	</svg>
</div>

<style>
	.bar {
		transition: fill 0.3s;
	}

	.label {
		font-size: 0.65em;
		text-anchor: middle;
		fill: #333;
	}

	.value {
		font-size: 0.8em;
		text-anchor: middle;
		fill: #333;
	}
	.container {
		background-color: whitesmoke;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
