import { writable } from 'svelte/store';
import type { Element } from '$lib/types';
import { Tool } from '$lib/types';

function createWhiteboardStore() {
	const { subscribe, update, set } = writable({
		elements: [] as Element[],
		selectedTool: Tool.DRAW,
		history: [] as Element[][],
		currentStep: 0
	});

	return {
		subscribe,
		setTool: (tool: Tool) => update((state) => ({ ...state, selectedTool: tool })),
		addElement: (element: Element) =>
			update((state) => {
				const newElements = [...state.elements, element];
				const newHistory = [...state.history.slice(0, state.currentStep + 1), newElements];
				return {
					...state,
					elements: newElements,
					history: newHistory,
					currentStep: newHistory.length - 1
				};
			}),
		undo: () =>
			update((state) => {
				if (state.currentStep > 0) {
					return {
						...state,
						currentStep: state.currentStep - 1,
						elements: state.history[state.currentStep - 1]
					};
				}
				return state;
			}),
		redo: () =>
			update((state) => {
				if (state.currentStep < state.history.length - 1) {
					return {
						...state,
						currentStep: state.currentStep + 1,
						elements: state.history[state.currentStep + 1]
					};
				}
				return state;
			})
	};
}

export const whiteboardStore = createWhiteboardStore();
