import { normalizeURL } from "@lib";
import { createFMState, FMState, updateFMReducer } from "@store/filemanager";
import { createFTPState, FTPState, updateFTPReducer } from "@store/ftp";
import { push } from "connected-react-router";
import { randomUUID } from "crypto";
import { TabData, TabsAddTab, TabsChangePosition, TabsRemoveTab, TabsSwitchTab, TabsThunk } from ".";
import { TabsActionTypes } from "./types";

const A = TabsActionTypes;

export const addTab: TabsThunk<TabsAddTab> = () => (dispatch) => {
	dispatch(push("/main"));
	return dispatch({
		payload: {
			fmReducer: createFMState(),
			ftpReducer: createFTPState(),
			path: "",
			id: randomUUID()
		},
		type: A.ADD
	})
};

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

export const switchToTab: TabsThunk<TabsSwitchTab> = (tab: TabData, currentFm: FMState, currentFtp: FTPState) => (dispatch) => {
	const url = normalizeURL(
		window.location.pathname.replace(/^\/([^/]+)\/?/, "/")
	);
	const pathname = window.location.pathname;
	if (pathname === "/main")
		dispatch(updateFTPReducer(tab.ftpReducer));
	dispatch(updateFMReducer(tab.fmReducer));

	if (tab.path === "") dispatch(push("/main"))
	else dispatch(push(`/file-manager${tab.path}`));

	return dispatch({
		type: A.SWITCH_TAB,
		payload: {
			currentFm,
			currentFtp,
			currentPath: pathname === "/main" ? "" : url,
			id: tab.id
		}
	});
}
