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

export interface TabToMove {
	tab: string;
	x: number;
}

export enum TabsActionTypes {
	ADD = "tabs/add",
	REMOVE = "tabs/remove",
	CHANGE_POS = "tabs/change-pos",
	SWITCH_TAB = "tabs/switch-tab",
	NEXT_TAB = "tabs/next-tab",
	PREV_TAB = "tabs/prev-tab",
	START_MOVE_TAB = "tabs/start-move-tab"
}

export interface TabsState {
	tabIndices: Record<string, number>;
	tabs: TabData[];
	currentTab: string | undefined;
	tabToMove?: TabToMove;
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
	type: typeof A.CHANGE_POS;
	payload: {
		id: string;
		index: number;
	};
}

export interface TabsSwitchTab {
	type: typeof A.SWITCH_TAB;
	payload: {
		id: string;
		currentFtp: FTPState;
		currentFm: FMState;
		currentPath: string;
	};
}
export interface TabsPrevNextTab {
	type: typeof A.NEXT_TAB | typeof A.PREV_TAB;
	payload: {
		currentFtp: FTPState;
		currentFm: FMState;
		currentPath: string;
	}
}

export interface TabsDoMoveTab {
	type: typeof A.START_MOVE_TAB;
	payload?: TabToMove;
}

export type TabsActions = TabsAddTab | TabsRemoveTab | TabsChangePosition | TabsSwitchTab | TabsPrevNextTab | TabsDoMoveTab;
