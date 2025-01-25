<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { line, curveLinear } from 'd3-shape';
	let {
		title = '',
		keyX,
		keyY,
		width = 500,
		height = 500,
		tickAmountX = 10,
		tickAmountY = 10,
		radius = 1,
		labelY = '',
		labelX = '',
		restrictTo,
		restrictToKey,
		avgY,
		XisDate = false,
		rejectedColor,
		verifiedColor,
		rejectedColorFocus,
		verifiedColorFocus,
		selectedPoints,
		onClick,
		data
	} = $props();

	let margins = { left: 50, top: 50, bottom: 50, right: 50 };

	let restrictedData = [];
	for (let i = 0; i < data.length; i++) {
		if (data[i][restrictToKey] != restrictTo) {
			continue;
		}

		restrictedData.push({
			x: Number(data[i][keyX]),
			y: Number(data[i][keyY]),
			status: data[i].status,
			index: data[i].index
		});
	}

	var plotData = $state();
	if (avgY) {
		plotData = restrictedData.reduce((acc, item) => {
			const existingItem = acc.find((i) => i.x === item.x);

			if (existingItem) {
				existingItem.totalY += item.y; // Add to the total y value
				existingItem.count += 1; // Increment the count
				existingItem.y = existingItem.totalY / existingItem.count; // Calculate the average
			} else {
				acc.push({ x: item.x, totalY: item.y, count: 1, y: item.y }); // Initialize totalY, count, and y
			}
			return acc;
		}, []);
	} else {
		plotData = restrictedData;
	}

	plotData.sort((a, b) => a.x - b.x);

	let xDomain = extent(plotData, (d) => d.x);
	let yDomain = extent(plotData, (d) => d.y);

	let xScale = scaleLinear()
		.domain(xDomain)
		.nice()
		.range([margins.left, width - margins.right]);

	let yScale = scaleLinear()
		.domain(yDomain)
		.nice()
		.range([height - margins.bottom, margins.top]);

	const xTicks = xScale.ticks(tickAmountX);
	const yTicks = yScale.ticks(tickAmountY);

	const lineGenerator = line()
		.x((d) => xScale(d.x))
		.y((d) => yScale(d.y))
		.curve(curveLinear);

	function customDateToStringMonth(date) {
		date = new Date(date);
		return `${date.getFullYear()}-${date.getMonth()}`;
	}

	function handleClick(e) {
		let indexString = e.target.getAttribute('myIndex');

		let index = indexString.split(',').map(Number);

		onClick(index);
	}

	function isContained(index) {
		if (keyY == 'sum') {
			for (let i = 0; i < selectedPoints.length; i++) {
				let point = selectedPoints[i];

				if (index.includes(point)) {
					return true;
				}
			}
		} else {
			return selectedPoints?.includes(index);
		}
	}

	function secondsToTimeM(time) {
		const minutes = Math.floor(time / 60);

		return `${minutes} min`;
	}
</script>

<svg {width} {height} class="border-4">
	<path d={lineGenerator(plotData)} fill="none" stroke={verifiedColor} stroke-width="2" />

	{#each plotData as { x, y, status, index }}
		<circle
			class={`${status ? status : 'verified'} ${isContained(index) ? ' focus' : ''}`}
			cx={xScale(x)}
			cy={yScale(y)}
			r={isContained(index) ? radius + 2 : radius}
			fill={status == 'rejected'
				? isContained(index)
					? rejectedColorFocus
					: rejectedColor
				: isContained(index)
					? verifiedColorFocus
					: verifiedColor}
			myIndex={index}
			tabindex="0"
			role="button"
			onclick={handleClick}
			onkeydown={() => {}}
		/>
	{/each}

	<!-- x-axis -->
	<line
		x1={margins.left}
		y1={height - margins.bottom}
		x2={width - margins.right}
		y2={height - margins.bottom}
	/>
	{#each xTicks as tick}
		<line
			x1={xScale(tick)}
			y1={height - margins.bottom - 3}
			x2={xScale(tick)}
			y2={height - margins.bottom + 3}
		/>
		{#if XisDate}
			<text class="x" alignment-baseline="hanging" x={xScale(tick)} y={height - margins.bottom + 5}
				>{customDateToStringMonth(tick)}</text
			>
		{:else}
			<text class="x" alignment-baseline="hanging" x={xScale(tick)} y={height - margins.bottom + 5}
				>{tick}</text
			>
		{/if}
	{/each}

	<!-- y-axis -->
	<line x1={margins.left} y1={margins.top} x2={margins.left} y2={height - margins.bottom} />
	{#each yTicks as tick}
		<line x1={margins.left - 3} y1={yScale(tick)} x2={margins.left + 3} y2={yScale(tick)} />
		<text class="y" alignment-baseline="middle" x={margins.left - 5} y={yScale(tick)}
			>{keyY == 'time' ? secondsToTimeM(tick) : tick}</text
		>
	{/each}

	<text x={margins.left} y={margins.top - 20} text-anchor="middle" style="font-size: 16px"
		>{labelY}</text
	>
	<text
		x={width - margins.right - 40}
		y={height - margins.bottom + 35}
		text-anchor="middle"
		style="font-size: 16px">{labelX}</text
	>
	<text
		x={width / 2}
		y={margins.top - 20}
		text-anchor="middle"
		style="font-size: 18px; font-weight: 500">{title}</text
	>
</svg>

<style>
	svg {
		background-color: whitesmoke;
	}
	circle {
		outline: none;
	}
	circle.rejected:hover {
		r: 5;
		fill: #ff1a4b;
	}
	circle.verified:hover {
		r: 5;
		fill: #1068a2;
	}
	circle.rejected.focus {
		r: 5;
		fill: #ff1a4b;
	}
	circle.verified.focus {
		r: 5;
		fill: #1068a2;
	}
	path {
		opacity: 0.8;
	}
	line {
		stroke: black;
	}
	text {
		font-size: 12px;
	}
	text.x {
		text-anchor: middle;
	}
	text.y {
		text-anchor: end;
	}
</style>
