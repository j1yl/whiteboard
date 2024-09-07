<script lang="ts">
	// TODO: moving elements
	// TODO: resizing elements
	// TODO: deleting elements
	// TODO: history
	// TODO: keyboard shortcuts
	// TODO: export
	import { onMount } from 'svelte';
	import type {
		ArrowElement,
		CircleElement,
		Element,
		LineElement,
		Point,
		ShapeElement,
		SquareElement
	} from '$lib/types';
	import { boardStore } from '$lib/stores/board';

	export let canvas: HTMLCanvasElement;
	export let width: number;
	export let height: number;
	export let elements: Element[];

	let ctx: CanvasRenderingContext2D;
	let drawing = false;
	let startPoint: Point = { x: 0, y: 0 };
	let lastPoint: Point = { x: 0, y: 0 };
	let selectBoxStart: Point | null = null;
	let selectBoxEnd: Point | null = null;
	let selectedIds: string[] = [];

	onMount(() => {
		ctx = canvas.getContext('2d')!;
	});

	function onMouseDown(event: MouseEvent) {
		if (event.button !== 0) return;

		drawing = true;
		startPoint = { x: event.offsetX, y: event.offsetY };

		if ($boardStore.tool === 'select') {
			selectBoxStart = startPoint;
			selectBoxEnd = startPoint;
		} else {
			selectBoxStart = null;
			selectBoxEnd = null;

			switch ($boardStore.tool) {
				case 'draw':
					boardStore.add({
						type: 'draw',
						points: [startPoint]
					});
					break;
				case 'square':
					boardStore.add({
						type: 'square',
						startPoint: startPoint,
						endPoint: startPoint
					});
					break;
				case 'circle':
					boardStore.add({
						type: 'circle',
						startPoint: startPoint,
						endPoint: startPoint
					});
					break;
				case 'line':
					boardStore.add({
						type: 'line',
						startPoint: startPoint,
						endPoint: startPoint
					});
					break;
				case 'arrow':
					boardStore.add({
						type: 'arrow',
						startPoint: startPoint,
						endPoint: startPoint,
						arrowDirection: 'end'
					});
					break;
			}
		}
	}

	function onMouseMove(event: MouseEvent) {
		if (!drawing) return;

		const currentPoint = { x: event.offsetX, y: event.offsetY };

		if ($boardStore.tool === 'select' && selectBoxStart) {
			selectBoxEnd = currentPoint;
		} else {
			if (!elements[elements.length - 1]) return;
			const lastElementId = elements[elements.length - 1].id || null;

			if (!lastElementId) return;

			switch ($boardStore.tool) {
				case 'draw': {
					const target = elements.find((element) => element.id === lastElementId);
					if (target && target.type === 'draw') {
						target.points.push(currentPoint);
					}
					boardStore.update(lastElementId, target!);
					break;
				}
				case 'square': {
					const target = elements.find((element) => element.id === lastElementId);
					if (target && target.type === 'square') {
						target.endPoint = currentPoint;
					}
					boardStore.update(lastElementId, target!);
					break;
				}
				case 'circle': {
					const target = elements.find((element) => element.id === lastElementId);
					if (target && target.type === 'circle') {
						target.endPoint = currentPoint;
					}
					boardStore.update(lastElementId, target!);
					break;
				}
				case 'line': {
					const target = elements.find((element) => element.id === lastElementId);
					if (target && target.type === 'line') {
						target.endPoint = currentPoint;
					}
					boardStore.update(lastElementId, target!);
					break;
				}
				case 'arrow': {
					const target = elements.find((element) => element.id === lastElementId);
					if (target && target.type === 'arrow') {
						target.endPoint = currentPoint;
					}
					boardStore.update(lastElementId, target!);
					break;
				}
			}
		}

		lastPoint = currentPoint;
	}

	function onMouseUp() {
		drawing = false;

		if ($boardStore.tool === 'select' && selectBoxStart && selectBoxEnd) {
			const left = Math.min(selectBoxStart.x, selectBoxEnd.x);
			const right = Math.max(selectBoxStart.x, selectBoxEnd.x);
			const top = Math.min(selectBoxStart.y, selectBoxEnd.y);
			const bottom = Math.max(selectBoxStart.y, selectBoxEnd.y);

			selectedIds = elements
				.filter((element) => {
					switch (element.type) {
						case 'draw': {
							const drawLeft = Math.min(...element.points.map((p) => p.x));
							const drawRight = Math.max(...element.points.map((p) => p.x));
							const drawTop = Math.min(...element.points.map((p) => p.y));
							const drawBottom = Math.max(...element.points.map((p) => p.y));

							return (
								drawLeft >= left && drawRight <= right && drawTop >= top && drawBottom <= bottom
							);
						}
						case 'square':
						case 'circle':
						case 'line':
						case 'arrow': {
							const { startPoint, endPoint } = element;
							const elementLeft = Math.min(startPoint.x, endPoint.x);
							const elementRight = Math.max(startPoint.x, endPoint.x);
							const elementTop = Math.min(startPoint.y, endPoint.y);
							const elementBottom = Math.max(startPoint.y, endPoint.y);

							return (
								elementLeft >= left &&
								elementRight <= right &&
								elementTop >= top &&
								elementBottom <= bottom
							);
						}
						default:
							return false;
					}
				})
				.map((element) => element.id);

			boardStore.select(selectedIds);

			selectBoxStart = null;
			selectBoxEnd = null;
		}
	}

	function drawElement(ctx: CanvasRenderingContext2D, element: Element) {
		ctx.strokeStyle = element.strokeColor;
		ctx.lineWidth = element.strokeWidth;

		switch (element.type) {
			case 'draw': {
				ctx.beginPath();
				ctx.moveTo(element.points[0].x, element.points[0].y);
				element.points.forEach((point) => {
					ctx.lineTo(point.x, point.y);
				});
				ctx.stroke();
				break;
			}
			case 'square': {
				const { startPoint, endPoint } = element as SquareElement;
				const width = endPoint.x - startPoint.x;
				const height = endPoint.y - startPoint.y;
				ctx.strokeRect(startPoint.x, startPoint.y, width, height);
				break;
			}
			case 'circle': {
				const { startPoint, endPoint } = element as CircleElement;
				ctx.beginPath();
				ctx.arc(
					startPoint.x + (endPoint.x - startPoint.x) / 2,
					startPoint.y + (endPoint.y - startPoint.y) / 2,
					Math.abs(endPoint.x - startPoint.x) / 2,
					0,
					2 * Math.PI
				);
				ctx.stroke();
				break;
			}
			case 'line': {
				const { startPoint, endPoint } = element as LineElement;
				ctx.beginPath();
				ctx.moveTo(startPoint.x, startPoint.y);
				ctx.lineTo(endPoint.x, endPoint.y);
				ctx.stroke();
				break;
			}
			case 'arrow': {
				const { startPoint, endPoint } = element as ArrowElement;
				const headlen = 8;
				const dx = endPoint.x - startPoint.x;
				const dy = endPoint.y - startPoint.y;
				const angle = Math.atan2(dy, dx);
				ctx.beginPath();
				ctx.moveTo(startPoint.x, startPoint.y);
				ctx.lineTo(endPoint.x, endPoint.y);
				ctx.lineTo(
					endPoint.x - headlen * Math.cos(angle - Math.PI / 6),
					endPoint.y - headlen * Math.sin(angle - Math.PI / 6)
				);
				ctx.moveTo(endPoint.x, endPoint.y);
				ctx.lineTo(
					endPoint.x - headlen * Math.cos(angle + Math.PI / 6),
					endPoint.y - headlen * Math.sin(angle + Math.PI / 6)
				);
				ctx.stroke();
				break;
			}
			default:
				break;
		}

		if (element.isSelected) {
			ctx.save();
			ctx.strokeStyle = 'blue';
			ctx.setLineDash([4, 2]);
			ctx.lineWidth = 1;
			const offset = 8;

			switch (element.type) {
				case 'draw': {
					const drawLeft = Math.min(...element.points.map((p) => p.x)) - offset;
					const drawRight = Math.max(...element.points.map((p) => p.x)) + offset;
					const drawTop = Math.min(...element.points.map((p) => p.y)) - offset;
					const drawBottom = Math.max(...element.points.map((p) => p.y)) + offset;
					const drawWidth = drawRight - drawLeft;
					const drawHeight = drawBottom - drawTop;
					ctx.strokeRect(drawLeft, drawTop, drawWidth, drawHeight);
					break;
				}
				case 'square':
				case 'circle':
				case 'line':
				case 'arrow': {
					const { startPoint, endPoint } = element as ShapeElement | LineElement | ArrowElement;
					const elementLeft = Math.min(startPoint.x, endPoint.x) - offset;
					const elementRight = Math.max(startPoint.x, endPoint.x) + offset;
					const elementTop = Math.min(startPoint.y, endPoint.y) - offset;
					const elementBottom = Math.max(startPoint.y, endPoint.y) + offset;
					const elementWidth = elementRight - elementLeft;
					const elementHeight = elementBottom - elementTop;
					ctx.strokeRect(elementLeft, elementTop, elementWidth, elementHeight);
					break;
				}
				default:
					break;
			}

			ctx.restore();
		}
	}

	$: {
		if (ctx) {
			ctx.clearRect(0, 0, width, height);
			elements.forEach((element) => {
				drawElement(ctx, element);
			});

			if (selectBoxStart && selectBoxEnd) {
				ctx.strokeStyle = 'blue';
				ctx.lineWidth = 1;
				ctx.setLineDash([4, 2]);
				const width = selectBoxEnd.x - selectBoxStart.x;
				const height = selectBoxEnd.y - selectBoxStart.y;
				ctx.strokeRect(selectBoxStart.x, selectBoxStart.y, width, height);
				ctx.fillStyle = 'rgb(0, 0, 255, 0.1)';
				ctx.fillRect(selectBoxStart.x, selectBoxStart.y, width, height);
				ctx.setLineDash([]);
			}
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
	<div class="absolute text-xs m-2 bottom-0 left-0 text-red-500 border border-black/25 p-2">
		<pre>{drawing}</pre>
	</div>
</div>
