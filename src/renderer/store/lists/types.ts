import { Group, HistoryServer, Server } from "@models";
import { RootActions } from "@store";
import { ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";

export type ListsThunk<ReturnType = void> = ActionCreator<
	ThunkAction<ReturnType, ListState, unknown, RootActions>
>;

export enum ListActionTypes {
	ADD_HISTORY = "lists/add-history",

	FETCH_GROUPS = "lists/fetch-groups",
	ADD_GROUP = "lists/add-group",

	ADD_FAV = "lists/add-fav",
	// DEL_FAV = "lists/del-fav",

	SAVE_SERVER = "lists/save-server",
	EDIT_SERVER = "lists/edit-server",
	START_EDIT_SERVER = "lists/start-edit-server",
	// REMOVE_SERVER = "lists/remove-server",
}

export interface ListState {
	groups: Group[];
	history: HistoryServer[];
	saved: Group;
	favourites?: Group;
	currentlyEdited: Server;
}

const A = ListActionTypes;

export interface ListAddHistory {
	type: typeof A.ADD_HISTORY;
	payload: HistoryServer;
}

export interface ListFetchGroups {
	type: typeof A.FETCH_GROUPS;
	payload: {
		groups: Group[];
		saved: Group;
		favourites: Group;
	}
}

export interface ListAddGroup {
	type: typeof A.ADD_GROUP;
	payload: Group;
}

export interface ListAddFav {
	type: typeof A.ADD_FAV;
	payload: Server;
}

export interface ListSaveServer {
	type: typeof A.SAVE_SERVER;
	payload: Server;
}

export interface ListEditServer {
	type: typeof A.EDIT_SERVER;
	payload: Server;
}

export interface ListStartEdit {
	type: typeof A.START_EDIT_SERVER;
	payload: Server;
}

export type ListActions =
	ListAddHistory | ListFetchGroups | ListAddGroup | ListAddFav | ListSaveServer | ListEditServer | ListStartEdit;
