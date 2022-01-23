import { FMState, updateFMReducer } from "@store/filemanager";
import { FTPState, updateFTPReducer } from "@store/ftp";
import { TabData, TabsAddTab, TabsChangePosition, TabsRemoveTab, TabsSwitchTab, TabsThunk } from ".";
import { TabsActionTypes } from "./types";

const A = TabsActionTypes;

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

export const switchToTab: TabsThunk = (tab: TabData, currentFm: FMState, currentPath: string, currentFtp: FTPState) => (dispatch) => {
	dispatch(updateFTPReducer(tab.ftpReducer));
	dispatch(updateFMReducer(tab.fmReducer))
	return dispatch({
		type: A.SWITCH_TAB,
		payload: {
			currentFm,
			currentFtp,
			currentPath,
			id: tab.id
		}
	})
}

export const switchToHome = (): TabsSwitchTab => ({
	payload: undefined,
	type: A.SWITCH_TAB
})
