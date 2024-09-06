<script lang="ts">
	import { boardStore } from '$lib/stores/board';

	import Board from '$lib/components/board.svelte';
	import Debug from '$lib/components/debug.svelte';
	import Tools from '$lib/components/tools.svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let width = 1280;
	let height = 720;

	$: elements = $boardStore.elements;
	$: tool = $boardStore.tool;
</script>

<div id="wrapper" class="relative w-full h-full min-h-screen">
	<Tools />
	<Debug />
	<Board bind:canvas {width} {height} {elements} />
</div>
