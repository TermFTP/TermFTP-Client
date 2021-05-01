import { DefaultReturn } from "@models";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { ContextMenuProps, FMState, FMTypes, TerminalActions } from "./types";

export type FTPThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, FMState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
  type: FMTypes;
}

export const setContextMenu = (menu: ContextMenuProps): Ret => ({
  type: FMTypes.SET_CONTEXT_MENU,
  payload: menu,
});

export const setFMLoading = (loading: boolean): Ret => ({
  type: FMTypes.SET_FM_LOADING,
  payload: loading
})

export const setTerminal = (action: TerminalActions): Ret => ({
  type: FMTypes.SET_TERMINAL,
  payload: action
})

export const setTerminalHeight = (height: number): Ret => ({
  type: FMTypes.SET_TERMINAL_HEIGHT,
  payload: height
})
