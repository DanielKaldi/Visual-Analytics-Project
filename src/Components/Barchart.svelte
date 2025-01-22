<script>
	//Colors do not work right now. They are set to certain colors of the input array currently
	//Input is cut off to 15 entries to avoid crashing. The last entry is always shown, to show the highest number of runs of 1 player
	let { title, key, labels, width, height, data, xAxisLabel, yAxisLabel } = $props();

	let cleanData = [];
	for (let i = 0; i < data.length; i++) {
		if (i >= 15 && i != data.length - 1) {
			continue;
		}
		if (data[i][labels] == undefined) {
			continue;
		}
		var val;
		if (key == undefined) {
			val = 1;
		} else {
			val = data[i][key];
		}
		cleanData.push({ value: val, label: data[i][labels] });
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
	const barHeight = height - 50;
</script>

<div style="width: {width}px; height: {height}px" class="container border-4">
	<svg width={chartWidth} height={chartHeight} viewBox={`0 -40 ${chartWidth} ${chartHeight + 100}`}>
		<text x={width / 2} y={5} text-anchor="middle" style="font-size: 22px; font-weight: 500"
			>{title}</text
		>
		<!--Bars-->
		{#each plotData as { label, value }, index}
			<rect
				class="bar"
				x={index * (barWidth + barSpacing)}
				y={chartHeight - (value / maxValue) * barHeight}
				width={barWidth}
				height={(value / maxValue) * barHeight}
				fill={colors[1]}
			/>
			<!-- Values above the bar -->
			<text
				class="value"
				x={index * (barWidth + barSpacing) + barWidth / 2}
				y={chartHeight - (value / maxValue) * barHeight - 5}
			>
				{value}
			</text>
			<!-- Labels below the bar -->
			<!-- y={index % 2 ? chartHeight + 40 : chartHeight + 20} -->
			<text
				class="label"
				x={index * (barWidth + barSpacing) + barWidth / 2}
				y={chartHeight + 30}
				style="fill: {colors[7]}"
			>
				{label}
			</text>
		{/each}
		<!-- X-axis label -->
		<text class="label" x={width / 2} y={chartHeight + 50} text-anchor="middle">
			{xAxisLabel}
		</text>
		<!-- Y-axis label -->
		<text class="label" x={-height / 2} y={-20} transform="rotate(-90)" text-anchor="middle">
			{yAxisLabel}
		</text>
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
