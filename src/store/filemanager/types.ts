import { FileI, ProgressFileI } from "@shared";

export type TerminalActions = "OPEN" | "CLOSE" | "TOGGLE";

export interface ContextMenuProps {
	x?: number;
	y?: number;
	isOpen: boolean;
}

export interface SearchProps {
	searching: boolean;
	query?: string;
}

export interface PathBoxData {
	pwd?: string;
	focused?: boolean;
}

export interface PasteBuffer {
	type: "copy" | "cut",
	dir: string;
	files: Set<FileI>;
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
	CLEAR_PROGRESS_FILES = "fm/clear-progress-files",
	CHANGE_PATH_BOX = "fm/change-path-box",
	TOGGLE_CONTEXT_MENU = "fm/toggle-context-menu",
	SET_PASTE_BUFFER = "fm/create-paste-buffer",
	UPDATE_FM_REDUCER = "fm/update-fm-reducer"
}


export interface FMState {
	menu: ContextMenuProps;
	loading: boolean;
	terminalOpen: boolean;
	terminalHeight: number;
	search: SearchProps;
	progressFiles: Map<string, ProgressFileI>;
	pathBox: PathBoxData;
	pasteBuffer?: PasteBuffer;
}
