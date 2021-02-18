import { Group, HistoryServer, Server } from "@models";

export enum ListActionTypes {
  FETCH_GROUPS = "lists/fetch-groups",
  FETCH_HISTORY = "lists/fetch-history",
  ADD_GROUP = "lists/add-group",
  // ADD_HISTORY = "lists/add-history",
  ADD_TO_GROUP = "lists/add-to-group",
  ADD_FAV = "lists/add-fav",
  DEL_GROUP = "lists/del-group",
  DEL_HISTORY = "lists/del-history",
  DEL_FAV = "lists/del-fav",
  ADD_HISTORY = "lists/add-history",
  SAVE_SERVER = "lists/save-server",
}

export interface ListState {
  groups: Group[];
  history: HistoryServer[];
  saved: Server[];
  favourites?: Group;
}
