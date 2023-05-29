import { normalizeURL } from "@lib";
import { createFMState, FMState, updateFMReducer } from "@store/filemanager";
import { createFTPState, FTPState, updateFTPReducer } from "@store/ftp";
import { push } from "connected-react-router";
import { randomUUID } from "crypto";
import { TabData, TabsChangePosition, TabsRemoveTab, TabsDoMoveTab, TabsThunk, TabToMove } from ".";
import { TabsActionTypes } from "./types";

const A = TabsActionTypes;

export const addTab: TabsThunk<TabData> = () => (dispatch) => {
	const payload = {
		fmReducer: createFMState(),
		ftpReducer: createFTPState(),
		path: "",
		id: randomUUID()
	}

	dispatch({
		payload,
		type: A.ADD
	})
	return payload
};

export const removeTab = (id: string): TabsRemoveTab => ({
	payload: id,
	type: A.REMOVE
});

export const closeTab: TabsThunk = (tab: TabData) => (dispatch) => {
	tab.ftpReducer?.client?.disconnect();
	dispatch(removeTab(tab.id));
	dispatch(switchToTab({ id: undefined }, undefined, undefined, undefined))
	// TODO move to next tab (or home tab when it was the only tab)
};

export const changeTabPosition = (id: string, index: number): TabsChangePosition => ({
	payload: {
		id, index
	},
	type: A.CHANGE_POS
})

export const switchToTab: TabsThunk = (tab: TabData, currentFm: FMState, currentFtp: FTPState, path = "") => (dispatch) => {
	const url = normalizeURL(
		path.replace(/^\/([^/]+)\/?/, "/")
	);
	const pathname = path;
	dispatch({
		type: A.SWITCH_TAB,
		payload: {
			currentFm,
			currentFtp,
			currentPath: pathname === "/main" ? "" : url,
			id: tab.id
		}
	});
	// if (pathname === "/main")
	dispatch(updateFTPReducer(tab.ftpReducer));
	dispatch(updateFMReducer(tab.fmReducer));

	if (tab.path === "" || !tab.id) dispatch(push("/main"))
	else {
		dispatch(push(`/file-manager${tab.path}`));
	}
}

export const switchAndAddTab: TabsThunk<TabData> = (currentFm: FMState, currentFtp: FTPState, path: string) => (dispatch) => {
	const tab = dispatch(addTab());
	dispatch(switchToTab(tab, currentFm, currentFtp, path))
	return tab;
}

export const startToMoveTab = (payload: TabToMove): TabsDoMoveTab => ({
	type: A.START_MOVE_TAB,
	payload: payload,
});
