import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { AppState, AppActionTypes } from "./types";
import { BubbleModel } from "@models";
import { PromptProps } from "@components";
import { OkbarProps } from "@components/Okbar/Okbar";
import { AppAddBubble, AppRemoveBubble, AppSetAutoLoggedIn, AppSetLoading, AppSetOkbar, AppSetPrompt, AppSetSettings } from ".";

export type AppThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, AppState, unknown, Action<string>>
>;

export const setLoading = (loading: boolean): AppSetLoading => {
	return {
		type: AppActionTypes.SET_LOADING,
		payload: loading,
	};
};

export const setSettings = (open: boolean): AppSetSettings => {
	return {
		type: AppActionTypes.SET_SETTINGS,
		payload: open,
	};
};

export const setPrompt = (prompt: PromptProps): AppSetPrompt => {
	return {
		type: AppActionTypes.SET_PROMPT,
		payload: prompt,
	};
};

export const setOkbar = (okbar: OkbarProps): AppSetOkbar => {
	return {
		type: AppActionTypes.SET_OKBAR,
		payload: okbar,
	}
}

export const addBubble = (key: string, bubble: BubbleModel): AppAddBubble => {
	bubble.when = new Date();
	return {
		type: AppActionTypes.ADD_BUBBLE,
		payload: {
			key,
			bubble,
		},
	};
};

export const removeBubble = (key: string): AppRemoveBubble => {
	return {
		type: AppActionTypes.REMOVE_BUBBLE,
		payload: key,
	};
};

export const setAutoLoggedIn = (autoLoggedIn: boolean): AppSetAutoLoggedIn => {
	return {
		type: AppActionTypes.SET_AUTO_LOGGED_IN,
		payload: autoLoggedIn
	}
}
