<script>
	import { index } from 'd3';

	let {
		key,
		labels,
		width,
		height,
		rejectedColor,
		verifiedColor,
		rejectedColorFocus,
		verifiedColorFocus,
		newColor,
		newColorFocus,
		onClick,
		selectedPoints,
		data
	} = $props();

	let chartHeight = $state(height / 2);
	let pieSize = $derived(Math.min(chartHeight, width));

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
		cleanData.push({ value: val, label: data[i][labels], index: data[i].index });
	}

	const plotData = cleanData.reduce((acc, item) => {
		const existingItem = acc.find((i) => i.label === item.label);

		if (existingItem) {
			existingItem.value += item.value;
			existingItem.index.push(item.index);
		} else {
			acc.push({ label: item.label, value: item.value, index: [item.index] });
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
			value: item.value,
			index: item.index
		};
	});

	const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'];

	function handleClick(e) {
		let indexString = e.target.getAttribute('myIndex');

		let index = indexString.split(',').map(Number);

		onClick(index);
	}

	function isContained(index) {
		for (let i = 0; i < selectedPoints.length; i++) {
			let point = selectedPoints[i];

			if (index.includes(point)) {
				return true;
			}
		}
	}
</script>

<div
	class="container flex flex-col items-center justify-evenly border-4"
	style="width: {width + 20}px; height: {height}px"
>
	<svg width={pieSize} height={pieSize} viewBox="-100 -100 200 200">
		{#each slices as { path, label, index }}
			{#if label == 'rejected'}
				<path
					d={path}
					fill={isContained(index) ? rejectedColorFocus : rejectedColor}
					myIndex={index}
					tabindex="0"
					role="button"
					onclick={handleClick}
					onkeydown={() => {}}
				/>
			{:else if label == 'new'}
				<path
					d={path}
					fill={isContained(index) ? newColorFocus : newColor}
					myIndex={index}
					tabindex="0"
					role="button"
					onclick={handleClick}
					onkeydown={() => {}}
				/>
			{:else}
				<path
					d={path}
					fill={isContained(index) ? verifiedColorFocus : verifiedColor}
					myIndex={index}
					tabindex="0"
					role="button"
					onclick={handleClick}
					onkeydown={() => {}}
				/>
			{/if}
		{/each}
	</svg>

	<div>
		<h3>Legend</h3>
		<ul>
			{#each plotData as { label, value, index }}
				{#if label == 'rejected'}
					<li class="label" style="color: {rejectedColor}">
						{'Rejected'}: {value}
					</li>
				{:else if label == 'new'}
					<li class="label" style="color: {newColor}">
						{'Pending'}: {value}
					</li>
				{:else}
					<li class="label" style="color: {verifiedColor}">
						{'Verified'}: {value}
					</li>
				{/if}
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
	path {
		outline: none;
	}
</style>
