import { FMState, FMActions } from "./types";
import { Reducer } from "redux";
import { ProgressFileI } from "@shared";
import { basename } from "path";

export const initialState: FMState = {
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
};

export const fmReducer: Reducer<FMState> = (state = initialState, action) => {
	switch (action.type) {
		case FMActions.SET_CONTEXT_MENU:
			return {
				...state,
				menu: {
					...state.menu,
					...action.payload,
				},
			};
		case FMActions.TOGGLE_CONTEXT_MENU:
			return {
				...state,
				menu: {
					...state.menu,
					isOpen: !state.menu.isOpen,
					x: undefined,
					y: undefined
				}
			}
		case FMActions.SET_FM_LOADING:
			return {
				...state,
				loading: action.payload
			}
		case FMActions.SET_TERMINAL:
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
		case FMActions.SET_TERMINAL_HEIGHT:
			return {
				...state,
				terminalHeight: action.payload
			}
		case FMActions.SEARCH:
			return {
				...state,
				search: action.payload
			}
		case FMActions.ADD_PROGRESS_FILES: {
			const copy = new Map(state.progressFiles);
			for (const file of action.payload) {
				copy.set(file.cwd + file.name + file.progressType, file);
			}
			return {
				...state,
				progressFiles: copy
			}
		}
		case FMActions.UPDATE_PROGRESS_FILE: {
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
		case FMActions.REMOVE_PROGRESS_FILES: {
			const copy = new Map(state.progressFiles);

			for (const p of action.payload) {
				copy.delete(p.cwd + p.name + p.progressType);
			}

			return {
				...state,
				progressFiles: copy
			}
		}
		case FMActions.CLEAR_PROGRESS_FILES:
			return {
				...state,
				progressFiles: new Map()
			}
		case FMActions.CHANGE_PATH_BOX:
			return {
				...state,
				pathBox: {
					...state.pathBox,
					...action.payload
				}
			}
		default:
			return state;
	}
};

export default fmReducer;
