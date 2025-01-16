<script>
	import { base } from '$app/paths';
	import { Button } from 'flowbite-svelte';
	let { name, img, onclick, id } = $props();

	let path = base + '/images/' + img;
</script>

<Button {onclick} class="border-4">
	<img class="aspect-square w-full" src={path} alt={name} />
	<div class="text-center" style="color: black">{name}</div>
</Button>
