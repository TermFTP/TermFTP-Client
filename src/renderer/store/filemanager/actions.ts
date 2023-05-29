import { ProgressFileI } from "@models";
import { PasteBuffer, PathBoxData } from ".";
import { ContextMenuProps, FMState, FMActionTypes, TerminalActions, SearchProps, FMSetMenu, FMToggleContextMenu, FMSetLoading, FMSetTerminal, FMSetTerminalHeight, FMSearch, FMAddProgressFiles, FMUpdateProgressFile, FMRemoveProgressFiles, FMClearProgressFiles, FMChangePathBox, FMSetPasteBuffer, FMUpdateReducer } from "./types";

const A = FMActionTypes;

export const setContextMenu = (menu: ContextMenuProps): FMSetMenu => ({
	type: A.SET_CONTEXT_MENU,
	payload: menu,
});

export const toggleContextMenu = (): FMToggleContextMenu => ({
	type: A.TOGGLE_CONTEXT_MENU,
})

export const setFMLoading = (loading: boolean): FMSetLoading => ({
	type: A.SET_FM_LOADING,
	payload: loading
})

export const setTerminal = (action: TerminalActions): FMSetTerminal => ({
	type: A.SET_TERMINAL,
	payload: action
})

export const setTerminalHeight = (height: number): FMSetTerminalHeight => ({
	type: A.SET_TERMINAL_HEIGHT,
	payload: height
})

export const doSearch = (search: SearchProps): FMSearch => ({
	type: A.SEARCH,
	payload: search,
})

export const addProgressFiles = (files: ProgressFileI[]): FMAddProgressFiles => ({
	type: A.ADD_PROGRESS_FILES,
	payload: files,
});

export const updateProgressFile = (file: ProgressFileI): FMUpdateProgressFile => ({
	type: A.UPDATE_PROGRESS_FILE,
	payload: file
})

export const removeProgressFiles = (files: ProgressFileI[]): FMRemoveProgressFiles => ({
	type: A.REMOVE_PROGRESS_FILES,
	payload: files
})

export const clearProgressFiles = (): FMClearProgressFiles => ({
	type: A.CLEAR_PROGRESS_FILES,
})

export const changePathBox = (pathBox: PathBoxData): FMChangePathBox => ({
	type: A.CHANGE_PATH_BOX,
	payload: pathBox
})

export const setPasteBuffer = (buffer: PasteBuffer): FMSetPasteBuffer => ({
	type: A.SET_PASTE_BUFFER,
	payload: buffer
})

export const updateFMReducer = (fm: FMState): FMUpdateReducer => ({
	type: A.UPDATE_FM_REDUCER,
	payload: fm
})

export const clearPasteBuffer = (): FMSetPasteBuffer => setPasteBuffer(undefined);