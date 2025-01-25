<script>
	import { scaleLinear } from 'd3-scale';
	import { extent, index } from 'd3-array';

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
		data,
		XisDate = false,
		YisDate = false,
		YisTime = false,
		rejectedColor = '#ff6384',
		verifiedColor = '#36a2eb',
		rejectedColorFocus,
		verifiedColorFocus,
		onClick,
		selectedPoints
	} = $props();

	let margins = { left: 50, top: 50, bottom: 50, right: 50 };

	let xData;
	let yData;

	let plotData = [];
	for (let i = 0; i < data.length; i++) {
		if (data[i][restrictToKey] != restrictTo) {
			continue;
		}
		if (XisDate) {
			let xDate = new Date(data[i][keyX]);
			xData = xDate.getTime();
		} else {
			xData = Number(data[i][keyX]);
		}
		if (YisDate) {
			let yDate = new Date(data[i][keyY]);
			yData = yDate.getTime();
		} else {
			yData = Number(data[i][keyY]);
		}

		plotData.push({
			x: Number(xData),
			y: Number(yData),
			status: data[i].status,
			index: data[i].index
		});
	}

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

	function secondsToTimeMS(time) {
		const minutes = Math.floor(time / 60);
		const seconds = time - minutes * 60;

		return `${minutes}M-${seconds}S`;
	}

	function secondsToTimeM(time) {
		const minutes = Math.floor(time / 60);

		return `${minutes} min`;
	}

	function customDateToStringMonth(date) {
		date = new Date(date);
		return `${date.getFullYear()}-${date.getMonth()}`;
	}

	function isContained(index) {
		return selectedPoints?.includes(index);
	}

	function handleClick(e) {
		let indexString = e.target.getAttribute('myIndex');

		let index = indexString.split(',').map(Number);

		onClick(index);
	}
</script>

<svg {width} {height} class="border-4">
	{#each plotData as { x, y, status, index }}
		<circle
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
		{#if YisTime}
			<text class="y" alignment-baseline="middle" x={margins.left - 5} y={yScale(tick)}
				>{secondsToTimeM(tick)}</text
			>
		{:else}
			<text class="y" alignment-baseline="middle" x={margins.left - 5} y={yScale(tick)}>{tick}</text
			>
		{/if}
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
