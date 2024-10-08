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
	import Export from 'virtual:icons/ph/export';

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
	let resizeHandle: string | null = null;

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

	function exportAsPNG() {
		// White background and draw elements
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);
		elements.forEach((element) => drawElement(ctx, element));

		const link = document.createElement('a');
		link.href = canvas.toDataURL('image/png');
		link.download = `whiteboard-${Date.now()}.png`;
		link.click();
	}

	function onMouseDown(event: MouseEvent) {
		drawing = true;
		startPoint = { x: event.offsetX, y: event.offsetY };

		if ($boardStore.tool === 'select') {
			if (clickingOnElement(event)) {
				lastPoint = startPoint;
				return;
			}
			selectBoxStart = startPoint;
			selectBoxEnd = startPoint;
		} else if ($boardStore.tool === 'eraser') {
			const clickedPoint = { x: event.offsetX, y: event.offsetY };
			const clickedElement = elements.find((element) => isPointInElement(clickedPoint, element));
			if (clickedElement) {
				boardStore.remove([clickedElement.id]);
			}
		} else {
			selectBoxStart = selectBoxEnd = null;
			createElement($boardStore.tool, startPoint);
		}
	}

	function onMouseMove(event: MouseEvent) {
		if (!drawing) {
			const hoveredPoint = { x: event.offsetX, y: event.offsetY };
			const hoveredElement = elements.find((element) => isPointInElement(hoveredPoint, element));
			if (hoveredElement && hoveredElement.isSelected) {
				const handle = getResizeHandle(hoveredPoint, hoveredElement);
				if (handle) {
					setResizeCursor(handle);
				} else {
					canvas.style.cursor = 'move'; // Move cursor when over an element but not a handle
				}
			} else {
				canvas.style.cursor = 'default'; // Default cursor
			}
			return;
		}
		const currentPoint = { x: event.offsetX, y: event.offsetY };

		if (resizeHandle) {
			if (selectedIds.length) {
				const id = selectedIds[0];
				const element = elements.find((el) => el.id === id);
				if (element) {
					resizeElement(element, resizeHandle, currentPoint);
					boardStore.update(id, element);
				}
			}
		} else if ($boardStore.tool === 'select') {
			if (selectBoxStart) {
				selectBoxEnd = currentPoint;
			} else if (selectedIds.length) {
				const dx = currentPoint.x - lastPoint.x;
				const dy = currentPoint.y - lastPoint.y;

				selectedIds.forEach((id) => {
					const element = elements.find((el) => el.id === id);
					if (element) {
						moveElement(element, dx, dy);
						boardStore.update(id, element);
					}
				});

				lastPoint = currentPoint;
			}
		} else {
			const lastElementId = elements[elements.length - 1]?.id;
			if (lastElementId) {
				updateElement($boardStore.tool, currentPoint, lastElementId);
			}
		}
	}

	function onMouseUp() {
		drawing = false;

		if (resizeHandle) {
			resizeHandle = null; // Reset the resize handle
		} else if ($boardStore.tool === 'select' && selectBoxStart && selectBoxEnd) {
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
		} else if (tool === 'text' && target.type === 'text') {
			// TODO: update text element
		} else if (
			['square', 'circle', 'line', 'arrow'].includes(tool) &&
			target.type !== 'draw' &&
			target.type !== 'text'
		) {
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
		const margin = 0;

		let left, right, top, bottom;
		if (element.type === 'draw') {
			left = Math.min(...element.points.map((p) => p.x)) - margin;
			right = Math.max(...element.points.map((p) => p.x)) + margin;
			top = Math.min(...element.points.map((p) => p.y)) - margin;
			bottom = Math.max(...element.points.map((p) => p.y)) + margin;
		} else {
			const { startPoint, endPoint } = element as ShapeElement;
			left = Math.min(startPoint.x, endPoint.x) - margin;
			right = Math.max(startPoint.x, endPoint.x) + margin;
			top = Math.min(startPoint.y, endPoint.y) - margin;
			bottom = Math.max(startPoint.y, endPoint.y) + margin;
		}

		ctx.strokeRect(left, top, right - left, bottom - top);

		const handleSize = 6;
		const handleOffset = handleSize / 2;

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

	function getResizeHandle(point: Point, element: Element) {
		const margin = 0;
		const handleSize = 6;

		let left, right, top, bottom;
		if (element.type === 'draw') {
			left = Math.min(...element.points.map((p) => p.x)) - margin;
			right = Math.max(...element.points.map((p) => p.x)) + margin;
			top = Math.min(...element.points.map((p) => p.y)) - margin;
			bottom = Math.max(...element.points.map((p) => p.y)) + margin;
		} else {
			const { startPoint, endPoint } = element as ShapeElement;
			left = Math.min(startPoint.x, endPoint.x) - margin;
			right = Math.max(startPoint.x, endPoint.x) + margin;
			top = Math.min(startPoint.y, endPoint.y) - margin;
			bottom = Math.max(startPoint.y, endPoint.y) + margin;
		}

		const handlePositions = [
			{ x: left, y: top }, // Top-left
			{ x: right, y: top }, // Top-right
			{ x: left, y: bottom }, // Bottom-left
			{ x: right, y: bottom }, // Bottom-right
			{ x: (left + right) / 2, y: top }, // Mid-top
			{ x: (left + right) / 2, y: bottom }, // Mid-bottom
			{ x: left, y: (top + bottom) / 2 }, // Mid-left
			{ x: right, y: (top + bottom) / 2 } // Mid-right
		];

		const names = [
			'top-left',
			'top-right',
			'bottom-left',
			'bottom-right',
			'mid-top',
			'mid-bottom',
			'mid-left',
			'mid-right'
		];

		const handle = handlePositions.find(
			(pos, index) =>
				point.x >= pos.x - handleSize / 2 &&
				point.x <= pos.x + handleSize / 2 &&
				point.y >= pos.y - handleSize / 2 &&
				point.y <= pos.y + handleSize / 2
		);

		return handle ? names[handlePositions.indexOf(handle)] : null;
	}

	function resizeElement(element: Element, handle: string, currentPoint: Point) {
		if (element.type === 'draw') {
			return;
		} else {
			const shape = element as ShapeElement;
			switch (handle) {
				case 'top-left':
					shape.startPoint = currentPoint;
					break;
				case 'top-right':
					shape.startPoint.y = currentPoint.y;
					shape.endPoint.x = currentPoint.x;
					break;
				case 'bottom-left':
					shape.startPoint.x = currentPoint.x;
					shape.endPoint.y = currentPoint.y;
					break;
				case 'bottom-right':
					shape.endPoint = currentPoint;
					break;
				case 'mid-top':
					shape.startPoint.y = currentPoint.y;
					break;
				case 'mid-bottom':
					shape.endPoint.y = currentPoint.y;
					break;
				case 'mid-left':
					shape.startPoint.x = currentPoint.x;
					break;
				case 'mid-right':
					shape.endPoint.x = currentPoint.x;
					break;
			}
		}

		boardStore.update(element.id, element);
	}

	function setResizeCursor(handle: string) {
		switch (handle) {
			case 'top-left':
			case 'bottom-right':
				canvas.style.cursor = 'nwse-resize';
				break;
			case 'top-right':
			case 'bottom-left':
				canvas.style.cursor = 'nesw-resize';
				break;
			case 'mid-top':
			case 'mid-bottom':
				canvas.style.cursor = 'ns-resize';
				break;
			case 'mid-left':
			case 'mid-right':
				canvas.style.cursor = 'ew-resize';
				break;
			default:
				canvas.style.cursor = 'default';
				break;
		}
	}

	function clickingOnElement(event: MouseEvent): boolean {
		const clickedPoint = { x: event.offsetX, y: event.offsetY };
		const clickedElement = elements.find((element) => isPointInElement(clickedPoint, element));

		if (clickedElement) {
			const handle = getResizeHandle(clickedPoint, clickedElement);
			if (handle) {
				resizeHandle = handle;
				return true;
			}

			if (!selectedIds.includes(clickedElement.id)) {
				selectedIds = [clickedElement.id];
				boardStore.select(selectedIds);
			}
		} else {
			selectedIds = [];
			boardStore.select([]);
		}

		return !!clickedElement;
	}

	function moveElement(element: Element, dx: number, dy: number) {
		if (element.type === 'draw') {
			element.points.forEach((point) => {
				point.x += dx;
				point.y += dy;
			});
		} else {
			const shape = element as ShapeElement;
			shape.startPoint.x += dx;
			shape.startPoint.y += dy;
			shape.endPoint.x += dx;
			shape.endPoint.y += dy;
		}
	}

	function isPointInElement(point: Point, element: Element): boolean {
		if (element.type === 'draw') {
			const { x, y } = point;
			const points = element.points;
			return (
				x >= Math.min(...points.map((p) => p.x)) &&
				x <= Math.max(...points.map((p) => p.x)) &&
				y >= Math.min(...points.map((p) => p.y)) &&
				y <= Math.max(...points.map((p) => p.y))
			);
		} else {
			const { startPoint, endPoint } = element as ShapeElement;
			return (
				point.x >= Math.min(startPoint.x, endPoint.x) &&
				point.x <= Math.max(startPoint.x, endPoint.x) &&
				point.y >= Math.min(startPoint.y, endPoint.y) &&
				point.y <= Math.max(startPoint.y, endPoint.y)
			);
		}
	}

	$: {
		if (ctx) {
			ctx.clearRect(0, 0, width, height);
			elements.forEach((element) => drawElement(ctx, element));

			if (selectBoxStart && selectBoxEnd) {
				ctx.strokeStyle = 'blue';
				ctx.lineWidth = 0.5;
				const boxWidth = selectBoxEnd.x - selectBoxStart.x;
				const boxHeight = selectBoxEnd.y - selectBoxStart.y;
				ctx.strokeRect(selectBoxStart.x, selectBoxStart.y, boxWidth, boxHeight);
				ctx.fillStyle = 'rgba(0, 0, 255, 0.05)';
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
		on:mousedown={onMouseDown}
		on:mousemove={onMouseMove}
		on:mouseup={onMouseUp}
		bind:this={canvas}
		{width}
		{height}
	/>
	<button
		on:click={() => exportAsPNG()}
		class={`p-2 hover:bg-skyblue m-4 absolute top-0 right-0 active:ring-[1px] active:ring-skyblueborder rounded-lg`}
	>
		<Export />
	</button>
	<!-- <pre class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{resizeHandle}</pre> -->
</div>
