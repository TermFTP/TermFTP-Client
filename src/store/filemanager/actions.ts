import { DefaultReturn } from "@models";
import { ProgressFileI } from "@shared";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { PathBoxData } from ".";
import { ContextMenuProps, FMState, FMActions, TerminalActions, SearchProps } from "./types";

export type FTPThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, FMState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
	type: FMActions;
}

export const setContextMenu = (menu: ContextMenuProps): Ret => ({
	type: FMActions.SET_CONTEXT_MENU,
	payload: menu,
});

export const toggleContextMenu = (): Ret => ({
	type: FMActions.TOGGLE_CONTEXT_MENU,
})

export const setFMLoading = (loading: boolean): Ret => ({
	type: FMActions.SET_FM_LOADING,
	payload: loading
})

export const setTerminal = (action: TerminalActions): Ret => ({
	type: FMActions.SET_TERMINAL,
	payload: action
})

export const setTerminalHeight = (height: number): Ret => ({
	type: FMActions.SET_TERMINAL_HEIGHT,
	payload: height
})

export const doSearch = (search: SearchProps): Ret => ({
	type: FMActions.SEARCH,
	payload: search,
})

export const addProgressFiles = (files: ProgressFileI[]): Ret => ({
	type: FMActions.ADD_PROGRESS_FILES,
	payload: files,
});

export const updateProgressFile = (file: ProgressFileI): Ret => ({
	type: FMActions.UPDATE_PROGRESS_FILE,
	payload: file
})

export const removeProgressFiles = (files: ProgressFileI[]): Ret => ({
	type: FMActions.REMOVE_PROGRESS_FILES,
	payload: files
})

export const clearProgressFiles = (): Ret => ({
	type: FMActions.CLEAR_PROGRESS_FILES,
})

export const changePathBox = (pathBox: PathBoxData): Ret => ({
	type: FMActions.CHANGE_PATH_BOX,
	payload: pathBox
})