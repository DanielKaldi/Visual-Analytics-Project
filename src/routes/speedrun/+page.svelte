<script>
	import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import Scatterplot from '../../Components/Scatterplot.svelte';
	import Piechart from '../../Components/Piechart.svelte';
	import { base } from '$app/paths';

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
		'm1zkog01',
		'pd0qogl1',
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

	async function fetchGameData(game) {
		isLoading = true;
		const id = gamesIDs[gamesList.indexOf(game)];

		try {
			const response = await fetch(`https://www.speedrun.com/api/v1/runs?game=${id}&max=100`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch data for ${game}: ${response.statusText}`);
			}
			gameData = await response.json();
		} catch (error) {
			console.error(error);
			gameData = { error: 'Failed to load data.' };
		} finally {
			isLoading = false;
		}
		return gameData;
	}

	//cleans Data, propably needs to be adjusted
	function cleanData(data) {
		var cleanedData = [];
		for (let i = 0; i < data.data.length; i++) {
			cleanedData.push({ id: data.data[i]['id'], status: data.data[i]['status']['status'] });
		}
		return cleanedData;
	}

	function replaceIDs(data) {
		for (let i = 0; i < data.length; i++) {
			data[i]['gameName'] = selectedGame;
		}
		return data;
	}

	async function setGame(game) {
		if (game == selectedGame) {
			return;
		}
		isProcessing = true;
		selectedGame = game;
		gameData = null;
		gameData = await fetchGameData(game);
		gameData = cleanData(gameData);
		gameData = replaceIDs(gameData);

		isProcessing = false;
	}
</script>

<main>
	<h1 style="margin: 20px;">Visual Analytics Project</h1>
	<h2 style="margin: 10px;">Speedrun Data from Speedrun.com</h2>
	<a class="customButton" href={base + '/'}>Car Data</a>
	<p style="font-size: 16px;">
		Not all data is loaded yet. Only the first 100 entries of every Query
	</p>
	<div class="container">
		<Button
			class="h-20 w-40 text-black"
			style="background:#EEEEEE; font-size:20px; border-radius:10px"
			>{selectedGame}<ChevronDownOutline class="ms-2 h-2 w-6 text-white dark:text-white" /></Button
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
		{#if (gameData != null) & !isProcessing}
			<Piechart width={200} height={200} labels="status" data={gameData} />
		{:else}
			<div style="width:200px; height:500px; background-color:whitesmoke"></div>
		{/if}
	</div>

	<div class="container" style="font-size: 16px;">
		<!-- Display API Data -->
		{#if isProcessing}
			<p>Loading data for {selectedGame}...</p>
		{:else if gameData}
			{#if gameData.error}
				<p>Error: {gameData.error}</p>
			{:else}
				<!-- Display game data -->
				<pre>{JSON.stringify(gameData[0], null, 2)}</pre>
			{/if}
		{:else if selectedGame !== 'Select a Game'}
			<p>No data loaded yet.</p>
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
