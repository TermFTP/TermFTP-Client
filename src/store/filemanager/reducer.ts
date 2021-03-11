import { Action, ActionCreator } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { ContextMenuProps, FMState, FMTypes } from "./types";

export type FTPThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, FMState, unknown, Action<string>>
>;

export const setContextMenu = (client: ContextMenuProps) => ({
  type: FMTypes.SET_CONTEXT_MENU,
  payload: client,
});
