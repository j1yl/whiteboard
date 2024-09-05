<script lang="ts">
	import { whiteboardStore } from '$lib/stores/whiteboardStore';

	$: elements = $whiteboardStore.elements;
	$: selectedTool = $whiteboardStore.selectedTool;
	$: history = $whiteboardStore.history;
	$: currentStep = $whiteboardStore.currentStep;
</script>

<div
	class="flex flex-col text-xs border border-black/25 p-2 m-2 fixed bottom-0 right-0 w-max text-red-500"
>
	<pre>elements: {JSON.stringify(elements, null, 2)}</pre>
	<pre>selected: {JSON.stringify(selectedTool, null, 2)}</pre>
	<pre>history: {JSON.stringify(history, null, 2)}</pre>
	<pre>currentStep: {JSON.stringify(currentStep, null, 2)}</pre>
</div>
