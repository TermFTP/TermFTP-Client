import { FTPState, FTPActionTypes } from "./types";
import { Reducer } from "redux";
import { FileI, FTPConnectTypes } from "@shared";

export const createFTPState = (): FTPState => ({

	client: undefined,
	files: [],
	selection: {
		lastSelection: undefined,
		selected: new Set<FileI>()
	},
	ftpType: FTPConnectTypes.SFTP
})
export const initialState: FTPState = createFTPState();

export const ftpReducer: Reducer<FTPState> = (state = initialState, action) => {
	switch (action.type) {
		case FTPActionTypes.SET_FTP_CLIENT:
			return { ...state, client: action.payload };
		case FTPActionTypes.SET_FILES:
			return { ...state, files: action.payload };

		case FTPActionTypes.SELECT_FILE: {
			return {
				...state,
				selection: {
					...state.selection,
					lastSelection: action.payload,
					selected: new Set([action.payload])
				}
			}
		}
		case FTPActionTypes.ADD_SELECTION: {
			return {
				...state,
				selection: {
					...state.selection,
					lastSelection: action.payload,
					selected: new Set(state.selection.selected).add(action.payload)
				}
			}
		}
		case FTPActionTypes.REMOVE_SELECTION: {
			const removed = new Set(state.selection.selected);
			removed.delete(action.payload);
			return {
				...state,
				selection: {
					...state.selection,
					lastSelection: undefined,
					selected: removed
				}
			}
		}
		case FTPActionTypes.SHIFT_SELECTION: {
			if (!state.files && state.files.length == 0) return state;

			const files = [...state.files];
			let lastI = -1;
			let nowI = -1;
			for (const idx in files) {
				const i = Number(idx);
				if (files[i].name === state.selection.lastSelection?.name) {
					lastI = i;
				}
				if (files[i].name === action.payload.name) {
					nowI = i;
				}
			}
			if (lastI === -1 || nowI === -1) return state;

			const selection = new Set(state.selection.selected);
			if (lastI > nowI) {
				const temp = nowI;
				nowI = lastI;
				lastI = temp;
			}
			files.filter((_, i) => lastI <= i && i <= nowI).forEach((f) => selection.add(f));

			return {
				...state,
				selection: {
					...state.selection,
					lastSelection: action.payload,
					selected: selection
				}
			}
		}
		case FTPActionTypes.CLEAR_SELECTION:
			return {
				...state,
				selection: {
					lastSelection: undefined,
					selected: new Set<FileI>()
				}
			}
		case FTPActionTypes.SET_FTP_TYPE:
			return {
				...state,
				ftpType: action.payload
			}
		case FTPActionTypes.UPDATE_FTP_REDUCER:
			return {
				...action.payload
			}
		default:
			return state;
	}
};

export default ftpReducer;
