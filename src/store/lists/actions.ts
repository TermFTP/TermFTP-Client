import { ListState, ListActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: ListState = {
  groups: null,
  saved: [],
  history: [],
  favourites: undefined,
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
        saved: [...state.saved, action.payload],
      };

    case ListActionTypes.FETCH_GROUPS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default listReducer;
