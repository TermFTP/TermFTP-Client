import { DefaultReturn } from "@models";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
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