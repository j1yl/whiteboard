import { Tool, ElementType } from './types';

export function getTypeFromTool(tool: Tool) {
	switch (tool) {
		case Tool.DRAW:
			return ElementType.DRAW;
		case Tool.SQUARE:
			return ElementType.SQUARE;
		case Tool.CIRCLE:
			return ElementType.CIRCLE;
		case Tool.ARROW:
			return ElementType.ARROW;
		case Tool.LINE:
			return ElementType.LINE;
		case Tool.TEXT:
			return ElementType.TEXT;
		default:
			return ElementType.DRAW;
	}
}
