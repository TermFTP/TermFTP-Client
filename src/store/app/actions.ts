import { AppState, AppActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: AppState = {
  data: {
    isLoading: false,
  },
  error: undefined,
  settingsOpen: false,
  prompt: undefined,
};

export const appReducer: Reducer<AppState> = (state = initialState, action) => {
  switch (action.type) {
    case AppActionTypes.PUT_ERROR:
      return {
        ...state,
        data: {
          isLoading: false,
        },
        error: {
          title: action.payload.title,
          message: action.payload.message,
        },
      };
    case AppActionTypes.ENABLE_LOADING: {
      return {
        ...state,
        data: {
          isLoading: true,
        },
      };
    }
    case AppActionTypes.DISABLE_LOADING: {
      return {
        ...state,
        data: {
          isLoading: false,
        },
      };
    }
    case AppActionTypes.TOGGLE_LOADING: {
      return {
        ...state,
        data: {
          isLoading: !state.data.isLoading,
        },
      };
    }
    case AppActionTypes.RESET_ERROR: {
      return {
        ...state,
        error: undefined,
      };
    }
    case AppActionTypes.OPEN_SETTINGS: {
      return {
        ...state,
        settingsOpen: true,
      };
    }
    case AppActionTypes.CLOSE_SETTINGS: {
      return {
        ...state,
        settingsOpen: false,
      };
    }
    case AppActionTypes.SET_PROMPT: {
      return {
        ...state,
        prompt: action.payload,
      };
    }
    default:
      return state;
  }
};

export default appReducer;
