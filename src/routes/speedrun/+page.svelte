<script>
	import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import Scatterplot from '../../Components/Scatterplot.svelte';
	import Piechart from '../../Components/Piechart.svelte';
	import { base } from '$app/paths';
	import Linegraph from '../../Components/Linegraph.svelte';

	let pageSize = 200;

	let fetchRes;

	let selectedCategory = 'Category';
	let categoryList = [];
	let categoryIds = [];

	let selectedGame = 'Game';
	let gamesList = [
		'Super Mario 64',
		'Mario Odyssey',
		'Minecraft',
		'Elden Ring',
		'Broforce',
		'Goldeneye 007',
		'Cooking Mama',
		'Grand Theft Auto V'
	];
	let gamesIDs = [
		'o1y9wo6q',
		'76r55vd8',
		'pd0qw9w1',
		'nd28z0ed',
		'xkdk5gdm',
		'nj1ne1p4',
		'nd2el35d',
		'om1mx362'
	];
	let gameData = null;
	let isLoading = false;
	let isProcessing = false;

	let sumByMonthData = null;

	async function fetchGameData(givenUrl, getCategories = false, game, category) {
		isLoading = true;
		let gameId = gamesIDs[gamesList.indexOf(game)];
		let categoryId = categoryIds[categoryList.indexOf(category)];

		let url = `https://www.speedrun.com/api/v1/runs?game=${gameId}&category=${categoryId}&max=${pageSize}`;

		if (getCategories) {
			url = `https://www.speedrun.com/api/v1/games/${gameId}/categories`;
		}

		if (givenUrl != '') {
			url = givenUrl;
		}

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch data for ${game}: ${response.statusText}`);
			}
			fetchRes = await response.json();
		} catch (error) {
			console.error(error);
			fetchRes = { error: 'Failed to load data.' };
		} finally {
			isLoading = false;
		}
		return fetchRes;
	}

	async function loadData(game, category) {
		var safetyCounter = 0; //todelte later
		var allLoaded = false;
		var data = [];
		var fetchRes = {};
		var url = '';
		while (!allLoaded) {
			safetyCounter += 1;
			if (safetyCounter > 100) {
				return data;
			}
			fetchRes = await fetchGameData(url, false, game, category);

			if (fetchRes == {} || fetchRes.pagination.size < pageSize) {
				data = data.concat(fetchRes.data);
				return data;
			}
			if (fetchRes.pagination.offset == 0) {
				url = fetchRes.pagination.links[0].uri;
			} else {
				url = fetchRes.pagination.links[1].uri;
			}
			data = data.concat(fetchRes.data);
		}
	}

	//cleans Data, propably needs to be adjusted
	function cleanData(data) {
		var cleanedData = [];
		for (let i = 0; i < data.length; i++) {
			cleanedData.push({
				id: data[i]['id'],
				status: data[i]['status']['status'],
				time: data[i]['times']['primary_t'],
				date: data[i]['date']
			});
		}
		return cleanedData;
	}

	function replaceIDs(data) {
		for (let i = 0; i < data.length; i++) {
			data[i]['gameName'] = selectedGame;
		}
		return data;
	}

	async function setCategories(game) {
		let fetchData = await fetchGameData('', true, game);
		fetchData.data.forEach((e) => {
			categoryList.push(e.name);
			categoryIds.push(e.id);
		});
	}

	async function setCategory(category) {
		if (category == selectedCategory) {
			return;
		}

		isProcessing = true;

		selectedCategory = category;

		let game = selectedGame;
		gameData = null;
		gameData = await loadData(game, category);
		gameData = cleanData(gameData);
		gameData = replaceIDs(gameData);

		sumByMonthData = await generateSumByMonthData(gameData);

		isProcessing = false;
	}

	async function setGame(game) {
		if (game == selectedGame) {
			return;
		}
		isProcessing = true;
		selectedCategory = 'Category';
		categoryList = [];
		categoryIds = [];
		selectedGame = game;
		await setCategories(game);

		isProcessing = false;
	}

	async function generateSumByMonthData(gameData) {
		var data = [];
		for (let i = 0; i < gameData.length; i++) {
			let date = new Date(gameData[i].date);
			let yearMonth = new Date(date.getFullYear(), date.getMonth());
			data.push(yearMonth);
		}

		let earliestYear = new Date(Math.min(...data)).getFullYear();
		let earliestMonth = new Date(Math.min(...data)).getMonth();

		let range = [];
		for (let i = earliestYear; i < new Date().getFullYear() + 1; i++) {
			let nrMonth = 12;
			if (i == new Date().getFullYear()) {
				nrMonth = new Date().getMonth() + 1;
			}
			let startMonth = 1;
			if (i == earliestYear) {
				startMonth = earliestMonth;
			}
			for (let k = startMonth; k < nrMonth + 1; k++) {
				range.push(new Date(i, k - 1));
			}
		}

		let res = [];
		for (let i = 0; i < range.length; i++) {
			let sum = 0;
			let elems = data.filter(
				(e) => e.getFullYear() == range[i].getFullYear() && e.getMonth() == range[i].getMonth()
			);
			sum = elems.length;
			res.push({ date: range[i], sum: sum });
		}

		return res;
	}
</script>

<main>
	<h1 style="margin: 20px;">Visual Analytics Project</h1>
	<h2 style="margin: 10px;">Speedrun Data from Speedrun.com</h2>
	<!--<a class="customButton" href={base + '/'}>Car Data</a>-->
	{#if isProcessing}
		<p>Loading data for {selectedGame}...</p>
	{/if}

	<div class="container">
		<div class="flex flex-col gap-5">
			<Button
				class="h-20 w-40 text-black"
				style="background:#EEEEEE; font-size:20px; border-radius:10px"
				>{selectedGame}<ChevronDownOutline
					class="ms-2 h-2 w-6 text-white dark:text-white"
				/></Button
			>
			<Dropdown>
				{#each gamesList as game}
					<DropdownItem
						onclick={() => setGame(game)}
						class="h-10 w-40"
						style="background:#EEEEEE; font-size: 16px">{game}</DropdownItem
					>
				{/each}
			</Dropdown>

			<Button
				class="h-20 w-40 text-black"
				style="background:#EEEEEE; font-size:20px; border-radius:10px"
				>{selectedCategory}<ChevronDownOutline
					class="ms-2 h-2 w-6 text-white dark:text-white"
				/></Button
			>
			<Dropdown>
				{#each categoryList as category}
					<DropdownItem
						onclick={() => setCategory(category)}
						class="h-10 w-40"
						style="background:#EEEEEE; font-size: 16px">{category}</DropdownItem
					>
				{/each}
			</Dropdown>
		</div>
		{#if (gameData != null) & !isProcessing}
			<Piechart width={200} height={200} labels="status" data={gameData} />
			<Scatterplot
				width={400}
				heigth={400}
				keyX="date"
				XisDate={true}
				keyY="time"
				tickAmountX={5}
				tickAmountY={10}
				labelX="Submission Date"
				labelY="Time"
				radius={2}
				YisTime={true}
				data={gameData}
			/>
			<Linegraph
				keyX="date"
				keyY="sum"
				width={500}
				height={500}
				tickAmountX={5}
				tickAmountY={10}
				radius={3}
				labelX="Submission Month"
				labelY="Nr. of Runs"
				XisDate={true}
				data={sumByMonthData}
			/>
		{:else}
			<div style="width:200px; height:500px; background-color:whitesmoke"></div>
		{/if}
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
