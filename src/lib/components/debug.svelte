<script lang="ts">
	import { boardStore } from '$lib/stores/board';

	$: elements = $boardStore.elements;
	$: tool = $boardStore.tool;
	$: history = $boardStore.history;
	$: step = $boardStore.step;
	$: selectedIds = $boardStore.selectedIds;
</script>

<div
	class="flex flex-col text-xs border border-black/25 p-2 m-2 fixed bottom-0 right-0 w-max text-red-500"
>
	<pre>tool: {JSON.stringify(tool, null, 2)}</pre>
	<pre>ele: {JSON.stringify(
			// elements.map((e) => e.id),
			elements,
			null,
			2
		)}</pre>
	<pre>history: {JSON.stringify(history, null, 2)}</pre>
	<pre>step: {JSON.stringify(step, null, 2)}</pre>
	<pre>selectedIds: {JSON.stringify(selectedIds, null, 2)}</pre>
</div>
