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
			const { id, index } = action.payload;
			const curIndex = state.tabIndices[id];
			// if (curIndex === 0 && (index === 0 || index === 1)) {
			// 	// don't try to move if the first tab is getting placed at the first two indices
			// 	return state;
			// }
			if (curIndex === state.tabs.length - 1 && index >= state.tabs.length - 1) {
				// don't try to move if the last tab is getting placed at the last index (or right to the last)
				return state;
			}
			const tabs = [...state.tabs];
			const tab = { ...tabs[curIndex] };
			if (tabs.length === index) {
				tabs.splice(index, 0, tab); //insert
				tabs.splice(curIndex, 1); // remove tab at current position
			} else {
				tabs.splice(curIndex, 1); // remove tab at current position
				tabs.splice(index, 0, tab); //insert
			}
			// generate new indices
			const tabIndices: Record<string, number> = {};
			tabs.forEach((t, i) => tabIndices[t.id] = i);
			return {
				...state,
				tabIndices,
				tabs,
				tabToMove: undefined
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
