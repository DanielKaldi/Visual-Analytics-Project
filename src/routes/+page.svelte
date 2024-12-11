<script>
	import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import Scatterplot from '../Components/Scatterplot.svelte';
	import Piechart from '../Components/Piechart.svelte';
	import { base } from '$app/paths';
	import Linegraph from '../Components/Linegraph.svelte';
	import Barchart from '../Components/Barchart.svelte';
	import CurrentWr from '../Components/CurrentWR.svelte';

	let pageSize = 200;

	let screenWidth = $state(1920);
	let screenHeight = $state(1080);
	let topBarHeight = 100;

	let fetchRes;
	let fetchFailed = $state(false);

	let selectedCategory = $state('Category');
	let categoryList = $state([]);
	let categoryIds = $state([]);

	let leaderboardData = null;
	let leaderboardPlayers = [];
	let leaderboardTimes = [];
	let userData = null;

	let selectedGame = $state('Game');
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
	let gameData = $state(null);
	let isLoading = $state(false);
	let isProcessing = $state(false);

	let sumByMonthData = $state(null);

	async function fetchGameData(
		givenUrl,
		getCategories = false,
		game,
		category,
		getLeaderboards = false
	) {
		isLoading = true;
		fetchFailed = false;
		let gameId = gamesIDs[gamesList.indexOf(game)];
		let categoryId = categoryIds[categoryList.indexOf(category)];

		let url = `https://www.speedrun.com/api/v1/runs?game=${gameId}&category=${categoryId}&max=${pageSize}`;

		if (getCategories) {
			url = `https://www.speedrun.com/api/v1/games/${gameId}/categories`;
		}

		if (getLeaderboards) {
			url = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}?top=3}`;
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
				fetchFailed = true;
			}
			fetchRes = await response.json();
		} catch (error) {
			console.error(error);
			fetchFailed = true;
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

		leaderboardData = await fetchGameData('', false, game, category, true);
		for (let i = 0; i < 3; i++) {
			if (!leaderboardData.data.runs[i]) {
				continue;
			}
			let run = leaderboardData.data.runs[i].run;
			let userDataURL = run.players[0].uri;
			userData = await fetchGameData(userDataURL, false, null, null, false);
			leaderboardPlayers.push(userData.data.names.international);
			leaderboardTimes.push(secondsToTimeMS(run.times.primary_t));
		}

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
		let earliestMonth = new Date(Math.min(...data)).getMonth(); // + 1; in case first 0 month needs to be removed

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

	function secondsToTimeMS(time) {
		const minutes = Math.floor(time / 60);
		const seconds = time - minutes * 60;

		return `${minutes}m ${seconds}s`;
	}
</script>

<svelte:window bind:innerWidth={screenWidth} bind:innerHeight={screenHeight} />

<main class="h-full w-full">
	<div class="flex w-full items-center justify-center border-4" style="height: {topBarHeight}px;">
		<div class="absolute left-5 z-10 flex gap-5">
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
		<h1 style="margin: 10px;">Speedrun Data from Speedrun.com</h1>
	</div>

	{#if isProcessing}
		{#if fetchFailed}
			<p>Fetch Request failed</p>
		{:else}
			<p>Loading data for {selectedGame}...</p>
		{/if}
	{:else if selectedGame != 'Game'}
		{#if selectedCategory != 'Category'}
			{#key [screenHeight, screenWidth]}
				<div class="flex w-full">
					<CurrentWr
						width={(screenWidth * 2) / 8}
						height={(screenHeight - topBarHeight) / 2}
						players={leaderboardPlayers}
						times={leaderboardTimes}
					/>
					<Linegraph
						title="World Record Progression (Placeholder)"
						keyX="date"
						keyY="sum"
						width={(screenWidth * 3) / 8}
						height={(screenHeight - topBarHeight) / 2}
						tickAmountX={5}
						tickAmountY={10}
						radius={3}
						labelX="Submission Month"
						labelY="Nr. of Runs"
						XisDate={true}
						data={sumByMonthData}
					/>
					<Barchart
						title="Number of Players who submitted multiple runs (Placeholder)"
						labels="status"
						width={(screenWidth * 3) / 8}
						height={(screenHeight - topBarHeight) / 2}
						data={gameData}
					/>
				</div>
				<div class="flex w-full">
					<Scatterplot
						title="Runtimes to Submission Date"
						width={(screenWidth * 3) / 7}
						height={(screenHeight - topBarHeight) / 2}
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
						title="Number of Submissions by Month"
						keyX="date"
						keyY="sum"
						width={(screenWidth * 3) / 7}
						height={(screenHeight - topBarHeight) / 2}
						tickAmountX={5}
						tickAmountY={10}
						radius={3}
						labelX="Submission Month"
						labelY="Nr. of Runs"
						XisDate={true}
						data={sumByMonthData}
					/>
					<Piechart
						width={(screenWidth * 1) / 7}
						height={(screenHeight - topBarHeight) / 2}
						labels="status"
						data={gameData}
					/>
				</div>
			{/key}
		{:else}
			<p>Select a Category</p>
		{/if}
	{:else}
		<p>Select a Game</p>
	{/if}
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
		gap: 0px;
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
