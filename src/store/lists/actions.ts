import { ListState, ListActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: ListState = {
  groups: null,
  history: [],
};

// TODO implement all cases

export const listReducer: Reducer<ListState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default listReducer;
