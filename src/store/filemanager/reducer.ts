import { FMState, FMTypes } from "./types";
import { Reducer } from "redux";

export const initialState: FMState = {
  menu: {
    isOpen: false,
  },
  loading: false,
  terminalOpen: false
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
    case FMTypes.SET_FM_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    case FMTypes.SET_TERMINAL:
      switch (action.payload) {
        case "OPEN":
          return {
            ...state,
            terminalOpen: true
          }
        case "TOGGLE":
          return {
            ...state,
            terminalOpen: !state.terminalOpen
          }
        case "CLOSE":
          return {
            ...state,
            terminalOpen: false
          }
        default: return state;
      }
    default:
      return state;
  }
};

export default fmReducer;
