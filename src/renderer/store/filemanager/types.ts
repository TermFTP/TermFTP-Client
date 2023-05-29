import { FileI, ProgressFileI } from "@models";

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

export enum FMActionTypes {
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
	SET_PASTE_BUFFER = "fm/set-paste-buffer",
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

const A = FMActionTypes;

export interface FMSetMenu {
	type: typeof A.SET_CONTEXT_MENU;
	payload: ContextMenuProps;
}

export interface FMSetLoading {
	type: typeof A.SET_FM_LOADING;
	payload: boolean;
}

export interface FMSetTerminal {
	type: typeof A.SET_TERMINAL;
	payload: TerminalActions;
}

export interface FMSetTerminalHeight {
	type: typeof A.SET_TERMINAL_HEIGHT;
	payload: number;
}

export interface FMSearch {
	type: typeof A.SEARCH;
	payload: SearchProps;
}

export interface FMAddProgressFiles {
	type: typeof A.ADD_PROGRESS_FILES;
	payload: ProgressFileI[];
}

export interface FMUpdateProgressFile {
	type: typeof A.UPDATE_PROGRESS_FILE;
	payload: ProgressFileI;
}

export interface FMRemoveProgressFiles {
	type: typeof A.REMOVE_PROGRESS_FILES;
	payload: ProgressFileI[];
}

export interface FMClearProgressFiles {
	type: typeof A.CLEAR_PROGRESS_FILES;
}

export interface FMChangePathBox {
	type: typeof A.CHANGE_PATH_BOX;
	payload: PathBoxData;
}

export interface FMToggleContextMenu {
	type: typeof A.TOGGLE_CONTEXT_MENU;
}

export interface FMSetPasteBuffer {
	type: typeof A.SET_PASTE_BUFFER;
	payload: PasteBuffer;
}

export interface FMUpdateReducer {
	type: typeof A.UPDATE_FM_REDUCER;
	payload: FMState;
}

export type FMActions =
	| FMSetMenu
	| FMSetLoading
	| FMSetTerminal
	| FMSetTerminalHeight
	| FMSearch
	| FMAddProgressFiles
	| FMUpdateProgressFile
	| FMRemoveProgressFiles
	| FMClearProgressFiles
	| FMChangePathBox
	| FMToggleContextMenu
	| FMSetPasteBuffer
	| FMUpdateReducer;
