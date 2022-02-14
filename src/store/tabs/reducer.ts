import { TabsState, TabsActionTypes } from "./types";
import { Reducer } from "redux";
import { TabsActions } from ".";

const A = TabsActionTypes;

export const initialState: TabsState = {
	tabs: [],
	tabIndices: {},
	currentTab: undefined
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
				tabIndices,
			}
		}
		case A.REMOVE: {
			const tabs = state.tabs.filter(t => t.id != action.payload);
			const tabIndices = { ...state.tabIndices };
			delete tabIndices[action.payload];
			for (const key in tabIndices) {
				// get index of tab in array
				tabIndices[key] = state.tabs.findIndex((t => t.id === key))
			}
			return {
				...state,
				tabIndices,
				tabs
			}
		}
		case A.CHANGE_POS: {
			if (state.tabIndices[action.payload.id] == 0) {
				return;
			}
			const tabs = [...state.tabs];
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
		case A.SWITCH_TAB: {
			const { id, currentFm, currentFtp, currentPath } = action.payload;
			const { currentTab } = state;
			const newTabs = [...state.tabs];
			// if this is false/undefined it is the home tab
			if (currentTab) {
				const index = state.tabIndices[currentTab];
				const tab = { ...state.tabs[index] };
				tab.fmReducer = currentFm;
				tab.ftpReducer = currentFtp;
				tab.path = currentPath;
				newTabs[index] = tab;
			}
			return {
				...state,
				currentTab: id,
				tabs: newTabs,
			}
		}
		case A.START_MOVE_TAB:
			return {
				...state,
				tabToMove: action.payload
			}
		default:
			return state;
	}
};

export default tabsReducer;
