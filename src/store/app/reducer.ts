import { AppState, AppActionTypes } from "./types";
import { Reducer } from "redux";
import { BubbleModel } from "@models";
import { AppActions } from ".";

export const initialState: AppState = {
	isLoading: false,
	bubbles: new Map<string, BubbleModel>(),
	settingsOpen: false,
	prompt: undefined,
	autoLoggedIn: false,
	okbar: undefined,
};

export const appReducer: Reducer<AppState, AppActions> = (state = initialState, action) => {
	switch (action.type) {
		case AppActionTypes.SET_LOADING: {
			return {
				...state,
				isLoading: action.payload,
			};
		}
		case AppActionTypes.SET_PROMPT: {
			return {
				...state,
				prompt: action.payload,
			};
		}
		case AppActionTypes.SET_OKBAR: {
			return {
				...state,
				okbar: action.payload,
			}
		}
		case AppActionTypes.SET_SETTINGS: {
			return {
				...state,
				settingsOpen: action.payload,
			};
		}
		case AppActionTypes.ADD_BUBBLE: {
			if (state.bubbles.get(action.payload.key)) {
				console.error(
					`bubble with "${action.payload.key}" already exists, so it was not created`
				);
			}
			const nMap = new Map<string, BubbleModel>(state.bubbles);
			nMap.set(action.payload.key, action.payload.bubble);
			return {
				...state,
				bubbles: nMap,
			};
		}
		case AppActionTypes.REMOVE_BUBBLE: {
			const copy = new Map<string, BubbleModel>(state.bubbles);
			copy.delete(action.payload);
			return { ...state, bubbles: copy };
		}
		default:
			return state;
	}
};

export default appReducer;
