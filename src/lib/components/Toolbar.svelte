<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Tool } from '$lib/types';
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

	export let selectedTool: Tool;

	const dispatch = createEventDispatcher();

	function selectTool(tool: Tool) {
		dispatch('toolChange', {
			tool: tool
		});
	}
</script>

<div id="toolbar" class="flex w-full items-center justify-between fixed top-0 left-0 z-50">
	<div class="flex w-max items-center p-2 gap-1 rounded">
		<button
			on:click={() => selectTool(Tool.HAND)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.HAND && 'bg-neutral-200'}`}
		>
			<Hand size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.SELECT)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.SELECT && 'bg-neutral-200'}`}
		>
			<CursorArrow size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.DRAW)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.DRAW && 'bg-neutral-200'}`}
		>
			<Pencil1 size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.SQUARE)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.SQUARE && 'bg-neutral-200'}`}
		>
			<Square size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.CIRCLE)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.CIRCLE && 'bg-neutral-200'}`}
		>
			<Circle size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.ARROW)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.ARROW && 'bg-neutral-200'}`}
		>
			<ArrowRight size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.LINE)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.LINE && 'bg-neutral-200'}`}
		>
			<BorderSolid size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.TEXT)}
			class={`p-2 hover:bg-neutral-200 rounded ${selectedTool === Tool.TEXT && 'bg-neutral-200'}`}
		>
			<Text size="16" />
		</button>
		<button
			on:click={() => selectTool(Tool.ERASER)}
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
