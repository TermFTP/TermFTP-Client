import { RootActions } from "@store";
import { FMState } from "@store/filemanager";
import { FTPState } from "@store/ftp";
import { ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";

export type TabsThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, TabsState, unknown, RootActions>
>;

export interface TabData {
	id?: string;
	ftpReducer?: FTPState;
	fmReducer?: FMState;
	path?: string;
}

export enum TabsActionTypes {
	ADD = "tabs/add",
	REMOVE = "tabs/remove",
	CHANGE_POS = "tabs/change-pos",
	SWITCH_TAB = "tabs/switch-tab"
}

export interface TabsState {
	tabIndices: Record<string, number>;
	tabs: TabData[];
	currentTab?: string;
}

const A = TabsActionTypes;

export interface TabsAddTab {
	type: typeof A.ADD;
	payload: TabData;
}

export interface TabsRemoveTab {
	type: typeof A.REMOVE;
	payload: string;
}

export interface TabsChangePosition {
	type: typeof A.CHANGE_POS,
	payload: {
		id: string;
		index: number;
	};
}

export interface TabsSwitchTab {
	type: typeof A.SWITCH_TAB,
	payload: {
		id: string;
		currentFtp: FTPState;
		currentFm: FMState;
		currentPath: string;
	}
}

export type TabsActions = TabsAddTab | TabsRemoveTab | TabsChangePosition | TabsSwitchTab;
