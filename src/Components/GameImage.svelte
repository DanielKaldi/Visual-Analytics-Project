<script>
	import { base } from '$app/paths';
	import { Button } from 'flowbite-svelte';
	let { name, img, onclick, id, smallText = false } = $props();

	let path = base + '/images/' + img;
</script>

<Button {onclick} class="border-4">
	{#if img}
		<img class="aspect-square w-full" src={path} alt={name} />
	{/if}
	{#if smallText}
		<div class="text-center" style="color: black; font-size:30px">{name}</div>
	{:else}
		<div class="text-center" style="color: black">{name}</div>
	{/if}
</Button>
