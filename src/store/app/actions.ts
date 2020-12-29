import { AppState, AppActionTypes } from "./types";
import { Reducer } from "redux";

export const initialState: AppState = {
  data: {
    isLoading: false,
  },
  error: undefined,
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
    default:
      return state;
  }
};

export default appReducer;
