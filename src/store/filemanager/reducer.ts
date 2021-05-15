import { FMState, FMActions } from "./types";
import { Reducer } from "redux";

export const initialState: FMState = {
  menu: {
    isOpen: false,
  },
  loading: false,
  terminalOpen: false,
  terminalHeight: 300,
};

export const fmReducer: Reducer<FMState> = (state = initialState, action) => {
  switch (action.type) {
    case FMActions.SET_CONTEXT_MENU:
      return {
        ...state,
        menu: {
          ...state.menu,
          ...action.payload,
        },
      };
    case FMActions.SET_FM_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    case FMActions.SET_TERMINAL:
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
    case FMActions.SET_TERMINAL_HEIGHT:
      return {
        ...state,
        terminalHeight: action.payload
      }
    default:
      return state;
  }
};

export default fmReducer;
