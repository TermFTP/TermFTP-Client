import { DefaultReturn } from "@models";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { ContextMenuProps, FMState, FMTypes } from "./types";

export type FTPThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, FMState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
  type: FMTypes;
}

export const setContextMenu = (client: ContextMenuProps): Ret => ({
  type: FMTypes.SET_CONTEXT_MENU,
  payload: client,
});

export const setFMLoading = (loading: boolean): Ret => ({
  type: FMTypes.SET_FM_LOADING,
  payload: loading
})
