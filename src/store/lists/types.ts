import { Group, HistoryServer, Server } from "@models";

export enum ListActionTypes {
  // FETCH_HISTORY = "lists/fetch-history",
  ADD_HISTORY = "lists/add-history",
  DEL_HISTORY = "lists/del-history",

  FETCH_GROUPS = "lists/fetch-groups",
  ADD_GROUP = "lists/add-group",
  ADD_TO_GROUP = "lists/add-to-group",
  REMOVE_GROUP = "lists/remove-group",
  CHANGE_GROUP = "lists/change-group",
  REMOVE_SERVER_FROM_GROUP = "lists/remove-server-from-group",

  ADD_FAV = "lists/add-fav",
  DEL_FAV = "lists/del-fav",

  SAVE_SERVER = "lists/save-server",
  EDIT_SERVER = "lists/edit-server",
  START_EDIT_SERVER = "lists/start-edit-server",
  REMOVE_SERVER = "lists/remove-server",
}

export interface ListState {
  groups: Group[];
  history: HistoryServer[];
  saved: Group;
  favourites?: Group;
  currentlyEdited: Server;
}
