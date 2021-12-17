import { BaseFTP, FTPConfig } from "@lib";

export interface TabData {
	id: string;
	client: BaseFTP;
	ftpConfig: FTPConfig;
}

export enum TabsActionTypes {
	ADD = "tabs/add",
	REMOVE = "tabs/remove",
	CHANGE_POS = "tabs/change-pos"
}

export interface TabsState {
	tabIndices: Record<string, number>;
	tabs: TabData[];
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

export type TabsActions = TabsAddTab | TabsRemoveTab | TabsChangePosition;
