<!-- 
states
elements list[objects{id, position, type, size, color, ...}]
drawing/moving/adding/removing
save/load
history: past, present, future
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		BorderSolid,
		Circle,
		CursorArrow,
		Eraser,
		Hand,
		Pencil1,
		Square,
		Text
	} from 'svelte-radix';
	import { Tool, type Element } from '$lib/types';

	/**
	 * initializing the canvas
	 */
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let width = 1280;
	let height = 720;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = width;
		canvas.height = height;
	});

	/**
	 * application state
	 */
	let elements: Element[] = [];
	let selectedTool: Tool = Tool.DRAW;
	let drawing = false;
	let x = 0;
	let y = 0;

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
		}
	}

	function onMouseUp() {
		drawing = false;
	}
</script>

<div id="wrapper" class="relative w-full h-full min-h-screen">
	<div id="toolbar" class="flex w-full items-center justify-between fixed top-0 left-0 z-50">
		<div class="flex w-max items-center p-2 gap-1 rounded">
			<!-- hand, cursor, pencil, square, circle, arrows, lines, text, eraser -->
			<button
				on:click={() => (selectedTool = Tool.HAND)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.HAND && 'bg-neutral-200'}`}
			>
				<Hand size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.SELECT)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.SELECT && 'bg-neutral-200'}`}
			>
				<CursorArrow size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.DRAW)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.DRAW && 'bg-neutral-200'}`}
			>
				<Pencil1 size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.SQUARE)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.SQUARE && 'bg-neutral-200'}`}
			>
				<Square size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.CIRCLE)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.CIRCLE && 'bg-neutral-200'}`}
			>
				<Circle size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.ARROW)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.ARROW && 'bg-neutral-200'}`}
			>
				<ArrowRight size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.LINE)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.LINE && 'bg-neutral-200'}`}
			>
				<BorderSolid size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.TEXT)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.TEXT && 'bg-neutral-200'}`}
			>
				<Text size="16" />
			</button>
			<button
				on:click={() => (selectedTool = Tool.ERASER)}
				class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.ERASER && 'bg-neutral-200'}`}
			>
				<Eraser size="16" />
			</button>
		</div>
		<button
			class="px-2 py-1 rounded bg-black hover:bg-black/75 transition-all ease-in-out duration-200 text-white font-bold text-xs mr-3"
		>
			Export
		</button>
	</div>
	<div
		class="w-full h-full absolute top-0 left-0"
		bind:clientWidth={width}
		bind:clientHeight={height}
	>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			{drawing}
			{selectedTool}
			{elements.length}
		</div>
		<canvas
			on:mousedown={onMouseDown}
			on:mousemove={onMouseMove}
			on:mouseup={onMouseUp}
			bind:this={canvas}
			{width}
			{height}
		/>
	</div>
</div>
