import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { TabData, TabsAddTab, TabsChangePosition, TabsRemoveTab, TabsSwitchTab } from ".";
import { TabsState, TabsActionTypes } from "./types";

const A = TabsActionTypes;

export type TabsThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, TabsState, unknown, Action<string>>
>;

export const addTab = (tab: TabData): TabsAddTab => ({
	payload: tab,
	type: A.ADD
});

export const removeTab = (id: string): TabsRemoveTab => ({
	payload: id,
	type: A.REMOVE
});

export const changeTabPosition = (id: string, index: number): TabsChangePosition => ({
	payload: {
		id, index
	},
	type: A.CHANGE_POS
})

export const switchToTab = (id: string): TabsSwitchTab => ({
	payload: id,
	type: A.SWITCH_TAB
})
