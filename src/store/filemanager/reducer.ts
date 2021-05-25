import { FMState, FMActions, ProgressFileI } from "./types";
import { Reducer } from "redux";
import { FileType } from "@shared";

export const initialState: FMState = {
  menu: {
    isOpen: false,
  },
  loading: false,
  terminalOpen: false,
  terminalHeight: 300,
  search: {
    searching: false,
  },
  progressFiles: new Map<string, ProgressFileI>([["yo", { cwd: "dd", fileType: FileType.FILE, name: "dd", progress: 2, progressType: "download", total: 3 }]]),
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
    case FMActions.SEARCH:
      return {
        ...state,
        search: action.payload
      }
    case FMActions.ADD_PROGRESS_FILES: {
      const copy = new Map(state.progressFiles);
      for (const file of action.payload) {
        copy.set(file.pwd + file.name, file);
      }
      return {
        ...state,
        progressFiles: copy
      }
    }
    case FMActions.UPDATE_PROGRESS_FILE: {
      const copy = new Map(state.progressFiles);
      copy.set(action.payload.pwd + action.payload.name, action.payload);
      return {
        ...state,
        progressFiles: copy
      }
    }
    case FMActions.REMOVE_PROGRESS_FILES: {
      const copy = new Map(state.progressFiles);

      for (const p of action.payload) {
        copy.delete(p.pwd + p.name);
      }

      return {
        ...state,
        progressFiles: copy
      }
    }
    default:
      return state;
  }
};

export default fmReducer;
