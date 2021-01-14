import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { ListState, ListActionTypes } from "./types";

export type ListsThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, ListState, unknown, Action<string>>
>;
