export type Element = {
	id: number;
	type: Tool;
	x: number;
	y: number;
	size: {
		width?: number;
		height?: number;
		radius?: number;
	};
	color: string;
	text?: string; // Optional for text elements
	points?: number[][]; // Optional for line elements
	strokeWidth?: number; // Optional for line width, border thickness
};

export enum Tool {
	HAND = 'hand',
	SELECT = 'select',
	DRAW = 'draw',
	SQUARE = 'square',
	CIRCLE = 'circle',
	ARROW = 'arrow',
	LINE = 'line',
	TEXT = 'text',
	ERASER = 'eraser'
}
