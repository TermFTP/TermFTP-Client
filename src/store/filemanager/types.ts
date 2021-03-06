import { FileI, ProgressFileI } from "@shared";

export type TerminalActions = "OPEN" | "CLOSE" | "TOGGLE";

export interface ContextMenuProps {
	x?: number;
	y?: number;
	file?: FileI;
	isOpen: boolean;
}

export interface SearchProps {
	searching: boolean;
	query?: string;
}

export enum FMActions {
	SET_CONTEXT_MENU = "fm/set-context-menu",
	SET_FM_LOADING = "fm/set-fm-loading",
	SET_TERMINAL = "fm/set-terminal",
	SET_TERMINAL_HEIGHT = "fm/set-terminal-height",
	SEARCH = "fm/search",
	ADD_PROGRESS_FILES = "fm/add-progress-files",
	UPDATE_PROGRESS_FILE = "fm/update-progress-file",
	REMOVE_PROGRESS_FILES = "fm/remove-progress-files",
	CLEAR_PROGRESS_FILES = "fm/clear-progress-files"
}


export interface FMState {
	menu: ContextMenuProps;
	loading: boolean;
	terminalOpen: boolean;
	terminalHeight: number;
	search: SearchProps;
	progressFiles: Map<string, ProgressFileI>;
}
