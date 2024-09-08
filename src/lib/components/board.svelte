<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		ArrowElement,
		CircleElement,
		DrawElement,
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

	function onKeyDown(event: KeyboardEvent) {
		if (event.repeat) return;

		switch (event.key) {
			case 'Backspace' || 'Delete':
				if (selectedIds.length) {
					boardStore.remove(selectedIds);
					selectedIds = [];
				}
				break;
		}
	}

	function beginDrawing(event: MouseEvent) {
		drawing = true;
		startPoint = { x: event.offsetX, y: event.offsetY };

		if ($boardStore.tool === 'select') {
			if (clickingOnElement(event)) return;
			selectBoxStart = startPoint;
			selectBoxEnd = startPoint;
		} else {
			selectBoxStart = selectBoxEnd = null;
			createElement($boardStore.tool, startPoint);
		}
	}

	function updateDrawing(event: MouseEvent) {
		if (!drawing) return;
		const currentPoint = { x: event.offsetX, y: event.offsetY };

		if ($boardStore.tool === 'select' && selectBoxStart) {
			selectBoxEnd = currentPoint;
		} else {
			const lastElementId = elements[elements.length - 1]?.id;
			if (lastElementId) {
				updateElement($boardStore.tool, currentPoint, lastElementId);
			}
		}
		lastPoint = currentPoint;
	}

	function endDrawing() {
		drawing = false;
		if ($boardStore.tool === 'select' && selectBoxStart && selectBoxEnd) {
			selectElementsWithinBox(selectBoxStart, selectBoxEnd);
			selectBoxStart = selectBoxEnd = null;
		}
	}

	function createElement(tool: string, startPoint: Point) {
		const elementMap: Record<string, () => void> = {
			draw: () => boardStore.add({ type: 'draw', points: [startPoint] }),
			square: () => boardStore.add({ type: 'square', startPoint, endPoint: startPoint }),
			circle: () => boardStore.add({ type: 'circle', startPoint, endPoint: startPoint }),
			line: () => boardStore.add({ type: 'line', startPoint, endPoint: startPoint }),
			arrow: () =>
				boardStore.add({ type: 'arrow', startPoint, endPoint: startPoint, arrowDirection: 'end' })
		};
		elementMap[tool]?.();
	}

	function updateElement(tool: string, currentPoint: Point, lastElementId: string) {
		const target = elements.find((element) => element.id === lastElementId);
		if (!target) return;

		if (tool === 'draw' && target.type === 'draw') {
			target.points.push(currentPoint);
		} else if (['square', 'circle', 'line', 'arrow'].includes(tool) && target.type !== 'draw') {
			target.endPoint = currentPoint;
		}
		boardStore.update(lastElementId, target);
	}

	function selectElementsWithinBox(start: Point, end: Point) {
		const [left, right, top, bottom] = [
			Math.min(start.x, end.x),
			Math.max(start.x, end.x),
			Math.min(start.y, end.y),
			Math.max(start.y, end.y)
		];
		selectedIds = elements
			.filter((element) => isElementWithinBounds(element, left, right, top, bottom))
			.map((element) => element.id);
		boardStore.select(selectedIds);
	}

	function isElementWithinBounds(
		element: Element,
		left: number,
		right: number,
		top: number,
		bottom: number
	): boolean {
		if (element.type === 'draw') {
			const points = element.points;
			return (
				Math.min(...points.map((p) => p.x)) >= left &&
				Math.max(...points.map((p) => p.x)) <= right &&
				Math.min(...points.map((p) => p.y)) >= top &&
				Math.max(...points.map((p) => p.y)) <= bottom
			);
		}
		const { startPoint, endPoint } = element as ShapeElement;
		return (
			Math.min(startPoint.x, endPoint.x) >= left &&
			Math.max(startPoint.x, endPoint.x) <= right &&
			Math.min(startPoint.y, endPoint.y) >= top &&
			Math.max(startPoint.y, endPoint.y) <= bottom
		);
	}

	function drawElement(ctx: CanvasRenderingContext2D, element: Element) {
		ctx.strokeStyle = element.strokeColor;
		ctx.lineWidth = element.strokeWidth;
		switch (element.type) {
			case 'draw':
				drawFreehand(ctx, element);
				break;
			case 'square':
				drawRect(ctx, element);
				break;
			case 'circle':
				drawCircle(ctx, element);
				break;
			case 'line':
				drawLine(ctx, element);
				break;
			case 'arrow':
				drawArrow(ctx, element);
				break;
		}
		if (element.isSelected) drawSelectionOutline(ctx, element);
	}

	function drawFreehand(ctx: CanvasRenderingContext2D, element: DrawElement) {
		ctx.beginPath();
		element.points.forEach((point, index) =>
			index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)
		);
		ctx.stroke();
	}

	function drawRect(ctx: CanvasRenderingContext2D, element: SquareElement) {
		const { startPoint, endPoint } = element;
		ctx.strokeRect(
			startPoint.x,
			startPoint.y,
			endPoint.x - startPoint.x,
			endPoint.y - startPoint.y
		);
	}

	function drawCircle(ctx: CanvasRenderingContext2D, element: CircleElement) {
		const { startPoint, endPoint } = element;
		const radiusX = (endPoint.x - startPoint.x) / 2;
		const radiusY = (endPoint.y - startPoint.y) / 2;
		ctx.beginPath();
		ctx.arc(startPoint.x + radiusX, startPoint.y + radiusY, Math.abs(radiusX), 0, 2 * Math.PI);
		ctx.stroke();
	}

	function drawLine(ctx: CanvasRenderingContext2D, element: LineElement) {
		ctx.beginPath();
		ctx.moveTo(element.startPoint.x, element.startPoint.y);
		ctx.lineTo(element.endPoint.x, element.endPoint.y);
		ctx.stroke();
	}

	function drawArrow(ctx: CanvasRenderingContext2D, element: ArrowElement) {
		const { startPoint, endPoint } = element;
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
	}

	function drawSelectionOutline(ctx: CanvasRenderingContext2D, element: Element) {
		ctx.save();
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 0.5;
		const padding = 8;

		let left, right, top, bottom;
		if (element.type === 'draw') {
			left = Math.min(...element.points.map((p) => p.x)) - padding;
			right = Math.max(...element.points.map((p) => p.x)) + padding;
			top = Math.min(...element.points.map((p) => p.y)) - padding;
			bottom = Math.max(...element.points.map((p) => p.y)) + padding;
		} else {
			const { startPoint, endPoint } = element as ShapeElement;
			left = Math.min(startPoint.x, endPoint.x) - padding;
			right = Math.max(startPoint.x, endPoint.x) + padding;
			top = Math.min(startPoint.y, endPoint.y) - padding;
			bottom = Math.max(startPoint.y, endPoint.y) + padding;
		}

		ctx.strokeRect(left, top, right - left, bottom - top);

		// Draw handles
		const handleSize = 6;
		const handleOffset = handleSize / 2;

		// Corners
		const handlePositions = [
			{ x: left, y: top }, // Top-left
			{ x: right, y: top }, // Top-right
			{ x: left, y: bottom }, // Bottom-left
			{ x: right, y: bottom }, // Bottom-right
			// Midpoints
			{ x: (left + right) / 2, y: top }, // Mid-top
			{ x: (left + right) / 2, y: bottom }, // Mid-bottom
			{ x: left, y: (top + bottom) / 2 }, // Mid-left
			{ x: right, y: (top + bottom) / 2 } // Mid-right
		];

		handlePositions.forEach((pos) => {
			ctx.fillStyle = 'blue';
			ctx.fillRect(pos.x - handleOffset, pos.y - handleOffset, handleSize, handleSize);
			ctx.strokeRect(pos.x - handleOffset, pos.y - handleOffset, handleSize, handleSize);
		});

		ctx.restore();
	}

	function clickingOnElement(event: MouseEvent) {
		const clickedPoint = { x: event.offsetX, y: event.offsetY };
		const clickedElement = elements.find((element) => {
			if (element.type === 'draw') {
				const points = element.points;
				return (
					clickedPoint.x >= Math.min(...points.map((p) => p.x)) &&
					clickedPoint.x <= Math.max(...points.map((p) => p.x)) &&
					clickedPoint.y >= Math.min(...points.map((p) => p.y)) &&
					clickedPoint.y <= Math.max(...points.map((p) => p.y))
				);
			}
			const { startPoint, endPoint } = element as ShapeElement;
			return (
				clickedPoint.x >= Math.min(startPoint.x, endPoint.x) &&
				clickedPoint.x <= Math.max(startPoint.x, endPoint.x) &&
				clickedPoint.y >= Math.min(startPoint.y, endPoint.y) &&
				clickedPoint.y <= Math.max(startPoint.y, endPoint.y)
			);
		});
		if (clickedElement) {
			selectedIds.push(clickedElement.id);
			boardStore.select([clickedElement.id]);
		} else {
			boardStore.select([]);
		}

		return !!clickedElement;
	}

	$: {
		if (ctx) {
			ctx.clearRect(0, 0, width, height);
			elements.forEach((element) => drawElement(ctx, element));

			if (selectBoxStart && selectBoxEnd) {
				ctx.strokeStyle = 'blue';
				ctx.lineWidth = 1;
				ctx.setLineDash([4, 2]);
				const boxWidth = selectBoxEnd.x - selectBoxStart.x;
				const boxHeight = selectBoxEnd.y - selectBoxStart.y;
				ctx.strokeRect(selectBoxStart.x, selectBoxStart.y, boxWidth, boxHeight);
				ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
				ctx.fillRect(selectBoxStart.x, selectBoxStart.y, boxWidth, boxHeight);
				ctx.setLineDash([]);
			}
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div
	class="w-full h-full absolute top-0 left-0"
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	<canvas
		on:mousedown={beginDrawing}
		on:mousemove={updateDrawing}
		on:mouseup={endDrawing}
		bind:this={canvas}
		{width}
		{height}
	/>
	<div class="absolute text-xs m-2 bottom-0 left-0 text-red-500 border border-black/25 p-2">
		<pre>{drawing}</pre>
	</div>
</div>
