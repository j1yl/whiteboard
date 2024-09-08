<script lang="ts">
	import { boardStore } from '$lib/stores/board';

	import HandOutline from 'virtual:icons/ph/hand';
	import Pencil from 'virtual:icons/ph/pencil';
	import Cursor from 'virtual:icons/ph/cursor';
	import Rectangle from 'virtual:icons/ph/rectangle';
	import Circle from 'virtual:icons/ph/circle';
	import ArrowRight from 'virtual:icons/ph/arrow-right';
	import Line from 'virtual:icons/ph/line-vertical';
	import Text from 'virtual:icons/ph/text';
	import Eraser from 'virtual:icons/ph/eraser';
	import Reset from 'virtual:icons/ph/arrow-clockwise';
	import Export from 'virtual:icons/ph/export';

	let statusText = 'Welcome to the whiteboard!';

	function onKeyDown(event: KeyboardEvent) {
		if (event.repeat) return;

		switch (event.key) {
			case '1':
				boardStore.setTool('select');
				break;
			case '2':
				boardStore.setTool('draw');
				break;
			case '3':
				boardStore.setTool('square');
				break;
			case '4':
				boardStore.setTool('circle');
				break;
			case '5':
				boardStore.setTool('arrow');
				break;
			case '6':
				boardStore.setTool('line');
				break;
			case '7':
				boardStore.setTool('text');
				break;
			case '8':
				boardStore.setTool('eraser');
				break;
			case 'Shift' && 'R':
				boardStore.clear();
				break;
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="flex flex-col gap-1 absolute left-1/2 -translate-x-1/2 top-0 m-4 z-50">
	<div id="toolbar" class="flex items-center gap-1 justify-between p-1 shadow rounded-xl bg-white">
		<button
			class={`${$boardStore.tool === 'hand' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('hand')}
		>
			<HandOutline />
		</button>
		<button
			class={`${$boardStore.tool === 'select' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('select')}
		>
			<Cursor />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>1</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'draw' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('draw')}
		>
			<Pencil />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>2</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'square' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('square')}
		>
			<Rectangle />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>3</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'circle' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('circle')}
		>
			<Circle />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>4</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'arrow' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('arrow')}
		>
			<ArrowRight />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>5</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'line' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('line')}
		>
			<Line />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>6</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'text' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('text')}
		>
			<Text />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>7</span
			>
		</button>
		<button
			class={`${$boardStore.tool === 'eraser' && 'bg-skyblue'} p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.setTool('eraser')}
		>
			<Eraser />
			<span class="text-black/25 absolute -bottom-[2px] right-0 m-1 text-[10px] font-semibold"
				>8</span
			>
		</button>
		<button
			class={`p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
			on:click={() => boardStore.clear()}
		>
			<Reset />
		</button>
		<button
			class={`p-2 hover:bg-skyblue active:ring-[1px] active:ring-skyblueborder relative rounded-lg`}
		>
			<Export />
		</button>
	</div>
	<span class="text-black/25 text-xs mx-auto select-none pointer-events-none">{statusText}</span>
</div>
