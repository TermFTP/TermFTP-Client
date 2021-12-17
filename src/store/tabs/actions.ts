import { DefaultReturn } from "@models";
import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { TabsState, TabsActionTypes } from "./types";

export type TabsThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, TabsState, unknown, Action<string>>
>;

interface Ret extends DefaultReturn {
	type: TabsActionTypes;
	payload?: unknown;
}


