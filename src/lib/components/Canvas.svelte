<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Element } from '$lib/types';
	import { Tool } from '$lib/types';

	export let canvas: HTMLCanvasElement;
	export let width: number;
	export let height: number;
	export let elements: Element[];
	export let selectedTool: Tool;

	let ctx: CanvasRenderingContext2D;
	let drawing = false;
	let x = 0;
	let y = 0;

	const dispatch = createEventDispatcher();

	onMount(() => {
		ctx = canvas.getContext('2d')!;
	});

	function onMouseDown(event: MouseEvent) {
		drawing = true;
		[x, y] = [event.offsetX, event.offsetY];
	}

	function onMouseMove(event: MouseEvent) {
		if (!drawing) return;
		switch (selectedTool) {
			case Tool.DRAW:
				ctx.beginPath();
				ctx.moveTo(x, y);
				[x, y] = [event.offsetX, event.offsetY];
				ctx.lineTo(x, y);
				ctx.stroke();
				dispatch('elementAdd', { type: Tool.DRAW, points: [[x, y]] });
				break;
		}
	}

	function onMouseUp() {
		drawing = false;
	}

	$: {
		if (ctx) {
			ctx.clearRect(0, 0, width, height);
			elements.forEach((element) => {
				// implement drawing logic for each element type
			});
		}
	}
</script>

<div
	class="w-full h-full absolute top-0 left-0"
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	<canvas
		on:mousedown={onMouseDown}
		on:mousemove={onMouseMove}
		on:mouseup={onMouseUp}
		bind:this={canvas}
		{width}
		{height}
	/>
	<div class="absolute text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<pre>{drawing}</pre>
	</div>
</div>
