import { AppState, AppActionTypes } from "./types";
import { Reducer } from "redux";
import { BubbleModel } from "@models";

export const initialState: AppState = {
  data: {
    isLoading: false,
    bubbles: new Map<string, BubbleModel>(),
  },
  settingsOpen: false,
  prompt: undefined,
  autoLoggedIn: false
};

export const appReducer: Reducer<AppState> = (state = initialState, action) => {
  switch (action.type) {
    case AppActionTypes.SET_LOADING: {
      return {
        ...state,
        data: {
          ...state.data,
          isLoading: action.payload,
        },
      };
    }
    case AppActionTypes.SET_PROMPT: {
      return {
        ...state,
        prompt: action.payload,
      };
    }
    case AppActionTypes.SET_SETTINGS: {
      return {
        ...state,
        settingsOpen: action.payload,
      };
    }
    case AppActionTypes.ADD_BUBBLE: {
      if (state.data.bubbles.get(action.payload.key)) {
        console.error(
          `bubble with "${action.payload.key}" already exists, so it was not created`
        );
      }
      const nMap = new Map<string, BubbleModel>(state.data.bubbles);
      nMap.set(action.payload.key, action.payload.bubble);
      return {
        ...state,
        data: {
          ...state.data,
          bubbles: nMap,
        },
      };
    }
    case AppActionTypes.REMOVE_BUBBLE: {
      const copy = new Map<string, BubbleModel>(state.data.bubbles);
      copy.delete(action.payload.key);
      return { ...state, data: { bubbles: copy } };
      // return state;
    }
    default:
      return state;
  }
};

export default appReducer;
