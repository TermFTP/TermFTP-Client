import { FMState, FMTypes } from "./types";
import { Reducer } from "redux";

export const initialState: FMState = {
  menu: {
    isOpen: false,
  },
};

export const fmReducer: Reducer<FMState> = (state = initialState, action) => {
  switch (action.type) {
    case FMTypes.SET_CONTEXT_MENU:
      return {
        ...state,
        menu: {
          ...state.menu,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export default fmReducer;
