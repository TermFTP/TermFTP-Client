import { ListState, ListActionTypes } from "./types";
import { Reducer } from "redux";
import { Group, Server } from "@models";

export const initialState: ListState = {
  groups: [],
  saved: undefined,
  history: [],
  favourites: undefined,
  currentlyEdited: undefined,
};

export const listReducer: Reducer<ListState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case ListActionTypes.ADD_HISTORY:
      return { ...state, history: [...state.history, action.payload] };
    case ListActionTypes.ADD_FAV:
      return {
        ...state,
        favourites: {
          ...state.favourites,
          server: [...state.favourites.server, action.payload],
        },
      };

    case ListActionTypes.SAVE_SERVER:
      return {
        ...state,
        saved: {
          ...state.saved,
          server: [...state.saved.server, action.payload],
        },
      };

    case ListActionTypes.FETCH_GROUPS:
      return {
        ...state,
        ...action.payload,
      };

    case ListActionTypes.CHANGE_EDIT_SERVER:
      return { ...state, currentlyEdited: action.payload };
    case ListActionTypes.EDIT_SERVER: {
      let saved = undefined;
      if (state.saved) saved = { ...state.saved };
      if (saved) {
        const result = recursiveSearch(saved, action.payload);
        if (result) {
          return { ...state, saved: { ...state.favourites } };
        }
      }

      const groups = [...state.groups];
      for (const group of groups) {
        const result = recursiveSearch(group, action.payload);
        if (result) {
          return { ...state, groups: [...groups] };
        }
      }

      let favourites = undefined;
      if (state.favourites) favourites = { ...state.favourites };
      if (favourites) {
        const result = recursiveSearch(favourites, action.payload);
        if (result) {
          return { ...state, favourites: { ...favourites } };
        }
      }
      return { ...state };
    }
    default:
      return state;
  }
};

export function recursiveSearch(group: Group, server: Server): boolean {
  for (const i in group.server) {
    if (group.server[i].serverID === server.serverID) {
      group.server[i] = server;
      return true;
    }
  }
  for (const sub of group.serverGroups) {
    return recursiveSearch(sub, server);
  }
  return false;
}

export default listReducer;
