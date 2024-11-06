<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	let { keyX, keyY, width, height, tickAmountX, tickAmountY, radius, data } = $props();

	let margins = { left: 50, top: 50, bottom: 50, right: 50 };

	let plotData = [];
	for (let i = 0; i < data.data.length; i++) {
		plotData.push({ x: data.data[i][keyX], y: data.data[i][keyY] });
	}

	let xDomain = extent(plotData, (d) => d.x);
	let yDomain = extent(plotData, (d) => d.y);

	console.log(yDomain);

	let xScale = scaleLinear()
		.domain(xDomain)
		.range([margins.left, width - margins.right]);

	let yScale = scaleLinear()
		.domain(yDomain)
		.range([height - margins.bottom, margins.top]);

	const xTicks = xScale.ticks(tickAmountX);
	const yTicks = yScale.ticks(tickAmountY);
</script>

<svg {width} {height}>
	{#each plotData as { x, y }}
		<circle cx={xScale(x)} cy={yScale(y)} r={radius} />
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
		<text class="x" alignment-baseline="hanging" x={xScale(tick)} y={height - margins.bottom + 5}
			>{tick}</text
		>
	{/each}

	<!-- y-axis -->
	<line x1={margins.left} y1={margins.top} x2={margins.left} y2={height - margins.bottom} />
	{#each yTicks as tick}
		<line x1={margins.left - 3} y1={yScale(tick)} x2={margins.left + 3} y2={yScale(tick)} />
		<text class="y" alignment-baseline="middle" x={margins.left - 5} y={yScale(tick)}>{tick}</text>
	{/each}
</svg>

<style>
	svg {
		background-color: whitesmoke;
	}
	circle {
		opacity: 0.5;
		stroke: red;
		fill: red;
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
