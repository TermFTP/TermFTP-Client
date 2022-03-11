import { PromptProps } from "@components";
import { OkbarProps } from "@components/Okbar/Okbar";
import { BubbleModel } from "@models";

export enum AppActionTypes {
	SET_LOADING = "app/set-loading",
	SET_PROMPT = "app/set-prompt",
	SET_SETTINGS = "app/set-settings",
	ADD_BUBBLE = "app/add-bubble",
	REMOVE_BUBBLE = "app/remove-bubble",
	SET_AUTO_LOGGED_IN = "app/set-auto-logged-in",
	SET_OKBAR = "app/set-okbar"
}

export interface AppState {
	isLoading?: boolean;
	bubbles?: Map<string, BubbleModel>;
	settingsOpen: boolean;
	prompt: PromptProps;
	autoLoggedIn: boolean;
	okbar: OkbarProps;
}

const A = AppActionTypes;

export interface AppSetLoading {
	type: typeof A.SET_LOADING;
	payload: boolean;
}

export interface AppSetPrompt {
	type: typeof A.SET_PROMPT;
	payload: PromptProps;
}

export interface AppSetSettings {
	type: typeof A.SET_SETTINGS;
	payload: boolean;
}

export interface AppAddBubble {
	type: typeof A.ADD_BUBBLE;
	payload: {
		key: string,
		bubble: BubbleModel;
	}
}

export interface AppRemoveBubble {
	type: typeof A.REMOVE_BUBBLE;
	payload: string;
}

export interface AppSetAutoLoggedIn {
	type: typeof A.SET_AUTO_LOGGED_IN;
	payload: boolean;
}

export interface AppSetOkbar {
	type: typeof A.SET_OKBAR;
	payload: OkbarProps;
}

export type AppActions =
	AppSetLoading | AppSetPrompt | AppSetSettings | AppAddBubble | AppRemoveBubble | AppSetAutoLoggedIn | AppSetOkbar;
