import { FMState, FMActionTypes, FMActions } from "./types";
import { Reducer } from "redux";
import { ProgressFileI } from "@models";
import { basename } from "path";

const A = FMActionTypes;

export const createFMState = (): FMState => ({
	menu: {
		isOpen: false,
	},
	loading: false,
	terminalOpen: false,
	terminalHeight: 300,
	search: {
		searching: false,
	},
	progressFiles: new Map<string, ProgressFileI>(),
	pathBox: {
		pwd: "",
		focused: false
	}
})

export const initialState: FMState = createFMState();

export const fmReducer: Reducer<FMState, FMActions> = (state = initialState, action) => {
	switch (action.type) {
		case A.SET_CONTEXT_MENU:
			return {
				...state,
				menu: {
					...state.menu,
					...action.payload,
				},
			};
		case A.TOGGLE_CONTEXT_MENU:
			return {
				...state,
				menu: {
					...state.menu,
					isOpen: !state.menu.isOpen,
					x: undefined,
					y: undefined
				}
			}
		case A.SET_FM_LOADING:
			return {
				...state,
				loading: action.payload
			}
		case A.SET_TERMINAL:
			switch (action.payload) {
				case "OPEN":
					return {
						...state,
						terminalOpen: true
					}
				case "TOGGLE":
					return {
						...state,
						terminalOpen: !state.terminalOpen
					}
				case "CLOSE":
					return {
						...state,
						terminalOpen: false
					}
				default: return state;
			}
		case A.SET_TERMINAL_HEIGHT:
			return {
				...state,
				terminalHeight: action.payload
			}
		case A.SEARCH:
			return {
				...state,
				search: action.payload
			}
		case A.ADD_PROGRESS_FILES: {
			const copy = new Map(state.progressFiles);
			for (const file of action.payload) {
				copy.set(file.cwd + file.name + file.progressType, file);
			}
			return {
				...state,
				progressFiles: copy
			}
		}
		case A.UPDATE_PROGRESS_FILE: {
			const copy = new Map(state.progressFiles);
			let f = copy.get(action.payload.cwd + action.payload.name + action.payload.progressType);
			if (!f) {
				f = { ...action.payload, progress: 0, name: basename(action.payload.name) };
			}
			if (!action.payload.total) {
				action.payload.total = f.total;
			}
			f.progress += action.payload.progress;
			copy.set(action.payload.cwd + action.payload.name + action.payload.progressType, action.payload);
			return {
				...state,
				progressFiles: copy
			}
		}
		case A.REMOVE_PROGRESS_FILES: {
			const copy = new Map(state.progressFiles);

			for (const p of action.payload) {
				copy.delete(p.cwd + p.name + p.progressType);
			}

			return {
				...state,
				progressFiles: copy
			}
		}
		case A.CLEAR_PROGRESS_FILES:
			return {
				...state,
				progressFiles: new Map()
			}
		case A.CHANGE_PATH_BOX:
			return {
				...state,
				pathBox: {
					...state.pathBox,
					...action.payload
				}
			}
		case A.SET_PASTE_BUFFER:
			return {
				...state,
				pasteBuffer: action.payload
			}
		case A.UPDATE_FM_REDUCER:
			return {
				...action.payload
			}
		default:
			return state;
	}
};

export default fmReducer;
