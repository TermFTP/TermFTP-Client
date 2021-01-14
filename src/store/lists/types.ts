import { Group, HistoryServer } from "@models";

export enum ListActionTypes {
  FETCH_GROUPS = "lists/fetch-groups",
  FETCH_HISTORY = "lists/fetch-history",
  ADD_GROUP = "lists/add-group",
  ADD_HISTORY = "lists/add-history",
}

export interface ListState {
  groups: Group[];
  history: HistoryServer[];
}
