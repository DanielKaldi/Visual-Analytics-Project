<script>
	import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import Scatterplot from '../Components/Scatterplot.svelte';
	import Piechart from '../Components/Piechart.svelte';
	import { base } from '$app/paths';
	import Linegraph from '../Components/Linegraph.svelte';
	import Barchart from '../Components/Barchart.svelte';
	import CurrentWr from '../Components/CurrentWR.svelte';
	import { interpolateGreens } from 'd3';
	import GameImage from '../Components/GameImage.svelte';

	const rejectedColor = '#ff6384';
	const verifiedColor = '#36a2eb';

	const rejectedColorFocus = '#ff1a4b';
	const verifiedColorFocus = '#1068a2';

	let pageSize = 200;

	let screenWidth = $state(1920);
	let screenHeight = $state(1080);
	let topBarHeight = 100;

	let fetchRes;
	let fetchFailed = $state(false);

	let selectedCategory = $state('Category');
	let categoryList = $state([]);
	let categoryIds = $state([]);

	let gameDropdownOpen = $state(false);
	let categoryDropdownOpen = $state(false);

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
	let gamesImages = [
		'mario64.webp',
		'SuperMarioOdyssey.webp',
		'Minecraft.webp',
		'EldenRing.webp',
		'Broforce.webp',
		'GoldenEye007.webp',
		'CookingMama.webp',
		'GTAV.webp'
	];

	let gameData = $state(null);
	let gameDataVerified = $state(null);
	let gameDataAll = $state(null);

	let selectedPoints = $state([]);

	let verifiedOnly = $state(true);
	let verfiedOnlyButtonText = $state('Show Rejected');

	let isLoading = $state(false);
	let isProcessing = $state(false);

	let sumByMonthData = $state(null);
	let WRProgressionData = $state(null);
	let multipleRunData = $state(null);

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
			fetchRes = { error: 'Failed to load data.', failed: true };
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

			if (data.length > 0 && fetchRes.failed) {
				return data;
			}
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

	//cleans and formats Data
	async function cleanData(data) {
		var cleanedData = [];
		for (let i = 0; i < data.length; i++) {
			if (data[i]['date'] == null || data[i]['date'] == 0 || data[i]['times']['primary_t'] == 0) {
				continue;
			}

			const playerId =
				data[i]['players'].length > 0 ? data[i]['players'][0]['id'] : 'placeholderId';
			cleanedData.push({
				id: data[i]['id'],
				status: data[i]['status']['status'],
				time: data[i]['times']['primary_t'],
				date: data[i]['date'],
				player: playerId
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
		for (let i = 0; i < fetchData.data.length; i++) {
			if (selectedGame == 'Super Mario 64') {
				if (fetchData.data[i].name == 'Stage RTA') continue;
			}
			if (selectedGame == 'Mario Odyssey') {
				if (fetchData.data[i].name == 'Any%') continue;
			}

			categoryList.push(fetchData.data[i].name);
			categoryIds.push(fetchData.data[i].id);
		}
	}

	async function setCategory(category) {
		if (category == selectedCategory) {
			return;
		}

		isProcessing = true;

		selectedCategory = category;

		let game = selectedGame;

		leaderboardPlayers = [];
		leaderboardTimes = [];

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
		gameData = await cleanData(gameData);
		gameData = await replaceIDs(gameData);
		gameData = await indexData(gameData);

		gameDataAll = await gameData;
		gameDataVerified = await removeRejected(gameData);

		if (verifiedOnly) {
			gameData = await gameDataVerified;
		} else {
			gameData = await gameDataAll;
		}

		gameData = await regenerateData(gameData);

		isProcessing = false;
	}

	async function indexData(data) {
		for (let i = 0; i < data.length; i++) {
			data[i] = { ...data[i], index: i + 1 }; //index 0 is forbidden
		}
		return data;
	}

	async function toggleStatus() {
		verifiedOnly = !verifiedOnly;

		if (gameData) {
			gameData = await regenerateData(gameData, verifiedOnly);
		}
	}

	async function removeRejected(gameData) {
		return gameData.filter((obj) => obj.status !== 'rejected');
	}

	async function regenerateData(gameData, verifiedOnly = true) {
		if (verifiedOnly) {
			if (gameData) {
				gameData = await gameDataVerified;
			}
			verfiedOnlyButtonText = 'Show Rejected';
		} else {
			if (gameData) {
				gameData = await gameDataAll;
			}
			verfiedOnlyButtonText = 'Hide Rejected';
		}

		sumByMonthData = await generateSumByMonthData(gameData);
		WRProgressionData = await generateWRProgressionData(gameData);
		multipleRunData = await generateMultipleRunData(gameData);

		return gameData;
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

			if (date.getFullYear() < 2000) {
			}

			let yearMonth = new Date(date.getFullYear(), date.getMonth());
			data.push({ yearMonth, index: gameData[i].index });
		}

		let earliestYear = new Date(Math.min(...data.map((d) => d.yearMonth))).getFullYear();

		let earliestMonth = new Date(Math.min(...data.map((d) => d.yearMonth))).getMonth(); // + 1; in case first 0 month needs to be removed

		let range = [];
		for (let i = earliestYear; i < new Date().getFullYear() + 1; i++) {
			let nrMonth = 12;
			if (i == new Date().getFullYear()) {
				nrMonth = new Date().getMonth() + 1;
			}
			let startMonth = 0;
			if (i == earliestYear) {
				startMonth = earliestMonth;
			}
			for (let k = startMonth; k < nrMonth + 1; k++) {
				range.push(new Date(i, k));
			}
		}

		let res = [];
		for (let i = 0; i < range.length; i++) {
			let sum = 0;
			let indices = [];
			let elems = data.filter(
				(e) =>
					e.yearMonth.getFullYear() == range[i].getFullYear() &&
					e.yearMonth.getMonth() == range[i].getMonth()
			);
			sum = elems.length;
			indices = elems.map((e) => e.index);
			res.push({ date: range[i], sum: sum, index: indices });
		}

		return res;
	}

	async function generateWRProgressionData(gameData) {
		let data = [];
		gameData = gameData.sort((a, b) => a.date - b.date);
		var currentWR = Infinity;
		for (let i = 0; i < gameData.length; i++) {
			if (gameData[i].time < currentWR) {
				currentWR = gameData[i].time;
				data.push({ ...gameData[i], date: new Date(gameData[i].date) });
			}
		}

		return data;
	}

	async function generateMultipleRunData(gameData) {
		let res = gameData.reduce((acc, item) => {
			const existingItem = acc.find((i) => i.player === item.player);

			if (existingItem) {
				existingItem.nrRuns += 1;
				existingItem.index.push(item.index);
			} else {
				acc.push({ player: item.player, nrRuns: 1, index: [item.index] });
			}
			return acc;
		}, []);

		res = res.reduce((acc, item) => {
			const existingItem = acc.find((i) => i.nrRuns === item.nrRuns);

			if (existingItem) {
				existingItem.nrPlayers += 1;
				existingItem.index.push(...item.index);
			} else {
				acc.push({ nrRuns: item.nrRuns, nrPlayers: 1, index: item.index });
			}
			return acc;
		}, []);

		res = res.sort((a, b) => a.nrRuns - b.nrRuns);

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
				onclick={() => (gameDropdownOpen = true)}
				>{selectedGame}<ChevronDownOutline
					class="ms-2 h-2 w-6 text-white dark:text-white"
				/></Button
			>
			<Dropdown open={gameDropdownOpen}>
				{#each gamesList as game}
					<DropdownItem
						onclick={() => {
							setGame(game);
							gameDropdownOpen = false;
						}}
						class="h-10 w-40"
						style="background:#EEEEEE; font-size: 16px">{game}</DropdownItem
					>
				{/each}
			</Dropdown>

			<Button
				class="h-20 w-40 text-black"
				style="background:#EEEEEE; font-size:20px; border-radius:10px"
				onclick={() => (categoryDropdownOpen = true)}
				>{selectedCategory}<ChevronDownOutline
					class="ms-2 h-2 w-6 text-white dark:text-white"
				/></Button
			>
			<Dropdown open={categoryDropdownOpen}>
				{#each categoryList as category}
					<DropdownItem
						onclick={() => {
							setCategory(category);
							categoryDropdownOpen = false;
						}}
						class="h-10 w-40"
						style="background:#EEEEEE; font-size: 16px">{category}</DropdownItem
					>
				{/each}
			</Dropdown>

			<Button
				class="h-20 w-40 text-black"
				style="background:#EEEEEE; font-size:20px; border-radius:10px"
				onclick={() => toggleStatus()}
				>{verfiedOnlyButtonText}<ChevronDownOutline
					class="ms-2 h-2 w-6 text-white dark:text-white"
				/></Button
			>
		</div>
		<h1 style="margin: 10px;">Speedrun Data from Speedrun.com</h1>
	</div>

	{#if selectedGame == 'Game'}
		<div class="grid h-full w-[1530px] grid-cols-4 grid-rows-2">
			{#each gamesList as name, index}
				<GameImage
					onclick={() => setGame(name)}
					{name}
					img={gamesImages[index]}
					id={gamesIDs[index]}
				/>
			{/each}
		</div>
	{/if}

	{#if isProcessing}
		{#if fetchFailed}
			<p>Fetch Request failed</p>
		{:else}
			<p>Loading data for {selectedGame}...</p>
		{/if}
	{:else if selectedGame != 'Game'}
		{#if selectedCategory != 'Category'}
			{#key [screenHeight, screenWidth, gameData]}
				<div class="flex w-full">
					<CurrentWr
						width={(screenWidth * 2) / 8}
						height={(screenHeight - topBarHeight) / 2}
						players={leaderboardPlayers}
						times={leaderboardTimes}
					/>
					<Linegraph
						title="World Record Progression"
						keyX="date"
						keyY="time"
						width={(screenWidth * 3) / 8}
						height={(screenHeight - topBarHeight) / 2}
						tickAmountX={5}
						tickAmountY={10}
						radius={3}
						labelX="Submission Date"
						labelY="Time"
						XisDate={true}
						{rejectedColor}
						{verifiedColor}
						{rejectedColorFocus}
						{verifiedColorFocus}
						onClick={(index) => (selectedPoints = index)}
						{selectedPoints}
						data={WRProgressionData}
					/>
					<Barchart
						title="Number of Players who submitted multiple runs"
						labels="nrRuns"
						key="nrPlayers"
						width={(screenWidth * 3) / 8}
						height={(screenHeight - topBarHeight) / 2}
						xAxisLabel="Number of Runs"
						yAxisLabel="Number of Players"
						{rejectedColor}
						{verifiedColor}
						{rejectedColorFocus}
						{verifiedColorFocus}
						onClick={(index) => (selectedPoints = index)}
						{selectedPoints}
						data={multipleRunData}
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
						radius={3}
						YisTime={true}
						data={gameData}
						{rejectedColor}
						{verifiedColor}
						{rejectedColorFocus}
						{verifiedColorFocus}
						onClick={(index) => (selectedPoints = index)}
						{selectedPoints}
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
						{rejectedColor}
						{verifiedColor}
						{rejectedColorFocus}
						{verifiedColorFocus}
						onClick={(index) => (selectedPoints = index)}
						{selectedPoints}
						data={sumByMonthData}
					/>
					<Piechart
						width={(screenWidth * 1) / 7}
						height={(screenHeight - topBarHeight) / 2}
						labels="status"
						{rejectedColor}
						{verifiedColor}
						{rejectedColorFocus}
						{verifiedColorFocus}
						onClick={(index) => (selectedPoints = index)}
						{selectedPoints}
						data={gameDataAll}
					/>
				</div>
			{/key}
		{:else}
			<div class="grid h-full w-full grid-rows-2">
				{#each categoryList as name, index}
					<GameImage
						onclick={() => setCategory(name)}
						{name}
						id={categoryIds[index]}
						smallText={selectedGame == 'Grand Theft Auto V' ? true : false}
					/>
				{/each}
			</div>
			<!--
				<p>Select a Category</p>
			-->
		{/if}
	{:else}{/if}
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
