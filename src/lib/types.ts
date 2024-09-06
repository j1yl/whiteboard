export interface BaseElement {
	id: string;
	type: Tool;
	strokeColor: string;
	strokeWidth: number;
	isSelected?: boolean;
}

export interface Point {
	x: number;
	y: number;
}

export interface DrawElement extends BaseElement {
	type: 'draw';
	points: Point[];
}

export interface ShapeElement extends BaseElement {
	fillColor: string;
	startPoint: Point;
	endPoint: Point;
}

export interface SquareElement extends ShapeElement {
	type: 'square';
}

export interface CircleElement extends ShapeElement {
	type: 'circle';
}

export interface LineElement extends BaseElement {
	type: 'line';
	startPoint: Point;
	endPoint: Point;
}

export interface ArrowElement extends BaseElement {
	type: 'arrow';
	startPoint: Point;
	endPoint: Point;
	arrowDirection: 'start' | 'end' | 'both';
}

export type Element = DrawElement | SquareElement | CircleElement | LineElement | ArrowElement;
export type Tool =
	| 'hand'
	| 'select'
	| 'draw'
	| 'square'
	| 'circle'
	| 'arrow'
	| 'line'
	| 'text'
	| 'eraser';
