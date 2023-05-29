import { AppActionTypes } from "./types";
import { BubbleModel } from "@models";
import { PromptProps } from "@components";
import { OkbarProps } from "@components/Okbar/Okbar";
import { AppAddBubble, AppRemoveBubble, AppSetAutoLoggedIn, AppSetLoading, AppSetOkbar, AppSetPrompt, AppSetSettings } from ".";

const A = AppActionTypes;

export const setLoading = (loading: boolean): AppSetLoading => {
	return {
		type: A.SET_LOADING,
		payload: loading,
	};
};

export const setSettings = (open: boolean): AppSetSettings => {
	return {
		type: A.SET_SETTINGS,
		payload: open,
	};
};

export const setPrompt = (prompt: PromptProps): AppSetPrompt => {
	return {
		type: A.SET_PROMPT,
		payload: prompt,
	};
};

export const setOkbar = (okbar: OkbarProps): AppSetOkbar => {
	return {
		type: A.SET_OKBAR,
		payload: okbar,
	}
}

export const addBubble = (key: string, bubble: BubbleModel): AppAddBubble => {
	bubble.when = new Date();
	return {
		type: A.ADD_BUBBLE,
		payload: {
			key,
			bubble,
		},
	};
};

export const removeBubble = (key: string): AppRemoveBubble => {
	return {
		type: A.REMOVE_BUBBLE,
		payload: key,
	};
};

export const setAutoLoggedIn = (autoLoggedIn: boolean): AppSetAutoLoggedIn => {
	return {
		type: A.SET_AUTO_LOGGED_IN,
		payload: autoLoggedIn
	}
}
