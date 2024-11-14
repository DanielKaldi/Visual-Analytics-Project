<script>
	let { key, labels, width, height, data } = $props();

	let cleanData = [];
	for (let i = 0; i < data.length; i++) {
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

	const total = plotData.reduce((sum, item) => sum + item.value, 0);

	let cumulativeAngle = 0;
	const slices = plotData.map((item) => {
		const startAngle = cumulativeAngle;
		const sliceAngle = (item.value / total) * 360;
		cumulativeAngle += sliceAngle;

		const startRadians = (startAngle * Math.PI) / 180;
		const endRadians = ((startAngle + sliceAngle) * Math.PI) / 180;

		const x1 = Math.cos(startRadians) * 100;
		const y1 = Math.sin(startRadians) * 100;
		const x2 = Math.cos(endRadians) * 100;
		const y2 = Math.sin(endRadians) * 100;

		const largeArc = sliceAngle > 180 ? 1 : 0;

		return {
			path: `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`,
			label: item.label,
			value: item.value
		};
	});

	const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'];
</script>

<div class="container" style="width: {width + 20}px">
	<svg {width} {height} viewBox="-100 -100 200 200">
		{#each slices as { path, label }, index}
			<path d={path} fill={colors[index % colors.length]} />
		{/each}
	</svg>

	<div>
		<h3>Legend</h3>
		<ul>
			{#each plotData as { label, value }, index}
				<li class="label" style="color: {colors[index % colors.length]}">
					{label}: {value}
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	svg {
		transform: rotate(-90deg);
	}

	.label {
		font-size: 0.6em;
		text-anchor: middle;
	}
	.container {
		background-color: whitesmoke;
		padding: 10px;
	}
</style>
