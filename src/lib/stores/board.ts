import type {
	ArrowElement,
	BaseElement,
	CircleElement,
	DrawElement,
	Element,
	LineElement,
	SquareElement,
	Tool
} from '$lib/types';
import { writable } from 'svelte/store';

function createBoardStore() {
	const { subscribe, update } = writable<{
		tool: Tool;
		elements: Element[];
		history: Element[];
		step: number;
		selectedIds: string[];
	}>({
		tool: 'draw',
		elements: [],
		history: [],
		step: 0,
		selectedIds: []
	});

	return {
		subscribe,
		setTool: (tool: Tool) => update((state) => ({ ...state, tool })),
		setStep: (step: number) => update((state) => ({ ...state, step })),
		setSelectedIds(ids: string[]) {
			update((state) => ({ ...state, selectedIds: ids }));
		},
		add: (element: Partial<Element>) =>
			update((state) => {
				const newElement = createElement(state.tool, element);
				const newElements = [...state.elements, newElement];
				return {
					...state,
					elements: newElements
				};
			}),
		update: (id: string, data: Element) => {
			update((state) => {
				const index = state.elements.findIndex((element) => element.id === id);
				if (index === -1) return state;

				const newElements = [...state.elements];
				newElements[index] = { ...newElements[index], ...data };
				return { ...state, elements: newElements };
			});
		},
		select: (ids: string[]) => {
			update((state) => {
				const newElements = state.elements.map((el) => ({
					...el,
					isSelected: ids.includes(el.id)
				}));
				return { ...state, elements: newElements, selectedElementIds: ids };
			});
		},
		undo: () => {},
		redo: () => {},
		clear: () =>
			update((state) => ({
				...state,
				elements: [],
				history: [],
				step: 0,
				selectedElementIds: []
			}))
	};
}

export function createElement(type: Tool, data: Partial<Element>): Element {
	const baseElement: BaseElement = {
		// id: crypto.randomUUID(),
		id: Date.now().toString(),
		type,
		strokeColor: '#000000',
		strokeWidth: 1,
		...data
	};

	switch (type) {
		case 'draw':
			return { ...baseElement, ...data } as DrawElement;
		case 'square':
			return { ...baseElement, ...data } as SquareElement;
		case 'circle':
			return { ...baseElement, ...data } as CircleElement;
		case 'line':
			return { ...baseElement, ...data } as LineElement;
		case 'arrow':
			return { ...baseElement, ...data } as ArrowElement;
		default:
			throw new Error(`Unsupported tool type: ${type}`);
	}
}

export const boardStore = createBoardStore();
