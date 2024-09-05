<script lang="ts">
	import { onMount } from 'svelte';
	import { whiteboardStore } from '$lib/stores/whiteboardStore';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import { Tool, type Element } from '$lib/types';
	import Debug from '$lib/components/Debug.svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let width = 1280;
	let height = 720;

	$: elements = $whiteboardStore.elements;
	$: selectedTool = $whiteboardStore.selectedTool;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = width;
		canvas.height = height;
	});

	function handleToolChange(event: CustomEvent<{ tool: Tool }>) {
		whiteboardStore.setTool(event.detail.tool);
	}

	function handleElementAdd(event: CustomEvent<{ type: Tool; points: [number, number][] }>) {
		// this is breaking the drawing aspect right now
		// const ele: Element = {
		// 	id: Date.now(),
		// 	type: event.detail.type,
		// 	x: event.detail.points[0][0],
		// 	y: event.detail.points[0][1],
		// 	size: {},
		// 	color: 'black',
		// 	points: event.detail.points
		// };
		// whiteboardStore.addElement(ele);
	}
</script>

<div id="wrapper" class="relative w-full h-full min-h-screen">
	<Toolbar {selectedTool} on:toolChange={handleToolChange} />
	<Canvas bind:canvas {width} {height} {elements} {selectedTool} on:elementAdd={handleElementAdd} />
	<Debug />
</div>
