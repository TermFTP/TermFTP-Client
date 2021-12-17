import { TabsState, TabsActionTypes } from "./types";
import { Reducer } from "redux";
import { TabsActions } from ".";

const A = TabsActionTypes;

export const initialState: TabsState = {
	tabs: [],
	tabIndices: {}
};

export const tabsReducer: Reducer<TabsState, TabsActions> = (state = initialState, action: TabsActions) => {
	switch (action.type) {
		case A.ADD: {
			const tab = action.payload;
			const tabs = [...state.tabs, tab];
			const tabIndices = { ...state.tabIndices }
			tabIndices[tab.id] = tabs.length - 1;
			return {
				...state,
				tabs,
				tabIndices
			}
		}
		case A.REMOVE: {
			const tabs = state.tabs.filter(t => t.id != action.payload);
			const tabIndices = { ...state.tabIndices };
			delete tabIndices[action.payload];
			for (const key in tabIndices) {
				tabIndices[key]--; // decrement position
			}
			return {
				...state,
				tabIndices,
				tabs
			}
		}
		case A.CHANGE_POS: {
			const tabs = [...state.tabs]
			const tab = { ...tabs[state.tabIndices[action.payload.id]] };
			tabs.splice(state.tabIndices[action.payload.id], 1); // remove tab at current position
			tabs.splice(action.payload.index, 0, tab); //insert
			// generate new indices
			const tabIndices = tabs.map((t, i) => ({ [t.id]: i })) as unknown as Record<string, number>
			return {
				...state,
				tabIndices,
				tabs
			}
		}
		default:
			return state;
	}
};

export default tabsReducer;
